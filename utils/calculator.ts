
import { InputParams, CalculatedResults } from '../types';

function calculateIRR(cashFlows: number[]): number {
    let min = -1.0;
    let max = 10.0;
    let guess = 0.1;
    let npv = 0;
    
    // Simple Bisection for 20 iterations
    for(let i=0; i<20; i++) {
        guess = (min + max) / 2;
        npv = 0;
        for(let t=0; t<cashFlows.length; t++) {
            npv += cashFlows[t] / Math.pow(1 + guess, t);
        }
        if (npv > 0) {
            min = guess;
        } else {
            max = guess;
        }
    }
    return guess * 100;
}

// Depreciation Schedules
const MACRS_5_YEAR = [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576];
const MACRS_7_YEAR = [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446];

export const calculateVaporRecovery = (params: InputParams): CalculatedResults => {
  const totalUnitsSold = params.unitsPerClient * params.numberOfClients;
  const LITER_PER_GALLON = 3.78541;
  const isDirectSales = params.businessModel === 'Direct Sales';
  const isLeasing = params.businessModel === 'Leasing';

  // Constants & Conversions
  const co2TonnesPerVolumeUnit = params.unitSystem === 'gallons'
    ? params.co2TonnesPerGallon
    : params.co2TonnesPerGallon / LITER_PER_GALLON;

  const durationYears = Math.max(1, params.leaseTerm); // Ensure at least 1 year

  // --- REVENUE CALCULATIONS ---
  // Apply Margin to Installation Cost to get Price
  const installationPricePerUnit = params.installationCostPerUnit * (1 + (params.installationMargin || 0) / 100);
  const installationRevenue = params.companyHandlesInstallation ? totalUnitsSold * installationPricePerUnit : 0;
  
  const salesRevenue = isDirectSales ? totalUnitsSold * params.unitSalePrice : 0;

  // --- LOAN SETUP ---
  let loanPrincipal = 0;
  let annualLoanPayment = 0;
  
  // Cost of the project (Investment basis)
  // If client pays installation, company doesn't bear that cost
  const installationCostTotal = params.companyHandlesInstallation && !params.installationPaidByClient 
    ? totalUnitsSold * params.installationCostPerUnit 
    : 0;
  
  if (params.enableFinancing) {
      const totalInvestment = (totalUnitsSold * params.unitCost) + installationCostTotal;
      
      const downPayment = totalInvestment * (params.loanDownPaymentPercent / 100);
      loanPrincipal = totalInvestment - downPayment;
      
      // PMT Calculation
      if (loanPrincipal > 0 && params.loanInterestRate > 0) {
          const r = params.loanInterestRate / 100;
          const n = params.loanTermYears;
          // Annual payment formula
          annualLoanPayment = (loanPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else if (loanPrincipal > 0) {
          annualLoanPayment = loanPrincipal / params.loanTermYears;
      }
  }

  // --- LOOP ---
  let totalLeasingRevenue = 0;
  let totalRecoveredVolume = 0;
  let totalMonthlyFeeRevenue = 0;
  let totalSparePartsRevenue = 0;
  let totalLoanInterestCost = 0;
  let totalTaxableIncome = 0;
  let totalTaxes = 0;
  
  // Cost Aggregators
  const cogs = totalUnitsSold * params.unitCost;
  // Installation Cost (The expense to the company)
  const installationCost = installationCostTotal;
  
  // Scale CAC by number of clients (Assuming input is Cost Per Client Acquisition)
  const customerAcquisitionCost = params.customerAcquisitionCost * params.numberOfClients;
  
  // Base Annual Costs (Year 1)
  const baseAnnualMaintenance = totalUnitsSold * params.annualMaintenanceCost;
  const baseAnnualWarranty = totalUnitsSold * params.annualWarrantyCost;
  const baseAnnualConsumables = totalUnitsSold * params.annualConsumablesCost;
  const baseAnnualOperational = totalUnitsSold * params.dailyOperationalCost * 365;
  
  // Compliance & Regulatory (Annual)
  const baseAnnualComplianceFee = totalUnitsSold * (params.annualComplianceFee || 0);
  const baseAnnualPenaltyAvoidance = totalUnitsSold * (params.penaltyAvoidanceSavings || 0);
  
  // Electricity Cost Calculation
  let baseAnnualElectricityCostPerUnit = 0;
  
  if (params.electricityUsageType === 'Variable' && params.hardwareProcessingRateLph > 0) {
      // Variable: Based on recovered volume
      // Daily Recovered Volume per Unit = Avg Gasoline Sold * Recovery Rate * Uptime
      const dailyRecoveredVolPerUnit = params.avgGasolineSold * (params.recoveryRate / 100) * (params.machineUptime / 100);
      const dailyRunHours = dailyRecoveredVolPerUnit / params.hardwareProcessingRateLph;
      const dailyKwh = dailyRunHours * params.hardwarePowerRatingKw;
      baseAnnualElectricityCostPerUnit = dailyKwh * 365 * params.electricityPrice;
  } else {
      // Fixed: Based on daily consumption input
      baseAnnualElectricityCostPerUnit = params.unitElectricityConsumptionKwhDay * 365 * params.electricityPrice;
  }
  
  const baseTotalAnnualElectricity = totalUnitsSold * baseAnnualElectricityCostPerUnit;

  // Cash Flow Setup
  let initialOutflow = 0;
  if (params.enableFinancing) {
      const totalInvestment = cogs + installationCost;
      const downPayment = totalInvestment * (params.loanDownPaymentPercent / 100);
      initialOutflow = downPayment + customerAcquisitionCost;
  } else {
      initialOutflow = cogs + installationCost + customerAcquisitionCost;
  }

  // Year 0 Cashflow (Investment)
  const cashFlow: number[] = [-initialOutflow];
  
  // Depreciable Basis
  const depreciableBasis = cogs + installationCost;

  // Loop years
  let currentLoanBalance = loanPrincipal;

  // Aggregators for Breakdown
  let totalMaintenance = 0;
  let totalWarranty = 0;
  let totalConsumables = 0;
  let totalOperational = 0;
  let totalElectricity = 0;

  // Payback Period Logic
  let paybackPeriod = 0;
  let cumulativeCashFlow = -initialOutflow;
  let paybackFound = false;

  for (let year = 1; year <= durationYears; year++) {
    const growthFactor = Math.pow(1 + (params.volumeGrowthRate / 100), year - 1);
    const inflationFactor = Math.pow(1 + (params.inflationRate || 0) / 100, year - 1);
    
    // 1. REVENUE
    let yearRevenue = 0;
    
    // One-time Sales
    if (year === 1 && isDirectSales) yearRevenue += salesRevenue;
    if (year === 1 && params.companyHandlesInstallation) yearRevenue += installationRevenue;

    // Recurring Leasing
    const dailyVolThisYear = params.avgGasolineSold * growthFactor;
    const recoveredThisYear = dailyVolThisYear * totalUnitsSold * (params.recoveryRate / 100) * 365 * (params.machineUptime / 100);
    
    if (isLeasing) {
        const leaseRev = recoveredThisYear * params.gasolinePrice * (params.companyRevenueShare / 100);
        yearRevenue += leaseRev;
        totalLeasingRevenue += leaseRev;
    }
    totalRecoveredVolume += recoveredThisYear;

    // Carbon
    if (params.enableCarbonCredits && isLeasing) {
        const carbonRev = (recoveredThisYear * co2TonnesPerVolumeUnit) * params.pricePerCredit;
        yearRevenue += carbonRev;
    }

    // SaaS
    if (params.enableMonthlyFees) {
        const saasRev = totalUnitsSold * params.monthlyFeePerUnit * 12;
        yearRevenue += saasRev;
        totalMonthlyFeeRevenue += saasRev;
    }

    // Spare Parts (Direct Sales only, post warranty)
    if (isDirectSales && year > params.warrantyDurationYears) {
        const partsRev = totalUnitsSold * params.postWarrantyRevenuePerUnit * inflationFactor;
        yearRevenue += partsRev;
        totalSparePartsRevenue += partsRev;
    }
    
    // Penalty Avoidance Savings (treated as revenue/benefit)
    if (baseAnnualPenaltyAvoidance > 0) {
        yearRevenue += baseAnnualPenaltyAvoidance;
    }

    // 2. OPEX (Apply Inflation)
    let yearOpEx = 0;
    
    // Inflated Costs
    const thisYearMaintenance = baseAnnualMaintenance * inflationFactor;
    const thisYearConsumables = baseAnnualConsumables * inflationFactor;
    const thisYearOperational = baseAnnualOperational * inflationFactor;
    const thisYearElectricity = baseTotalAnnualElectricity * inflationFactor; // Assuming electricity price inflates
    const thisYearWarranty = baseAnnualWarranty;
    const thisYearComplianceFee = baseAnnualComplianceFee * inflationFactor;

    if (isLeasing) {
         // If client pays electricity, don't include it in company costs
         const electricityCost = params.electricityPaidByClient ? 0 : thisYearElectricity;
         yearOpEx = thisYearMaintenance + thisYearWarranty + thisYearConsumables + thisYearOperational + electricityCost + thisYearComplianceFee;
         totalMaintenance += thisYearMaintenance;
         totalWarranty += thisYearWarranty;
         totalConsumables += thisYearConsumables;
         totalOperational += thisYearOperational;
         totalElectricity += electricityCost; // Only count if company pays
    } else {
        // Direct Sales Costs
        if (year <= params.warrantyDurationYears) {
            yearOpEx += thisYearWarranty;
            totalWarranty += thisYearWarranty;
        }
        yearOpEx += thisYearComplianceFee;
    }

    // 3. EBITDA
    const ebitda = yearRevenue - yearOpEx;

    // 4. FINANCING COSTS (Interest)
    let interestPayment = 0;
    let principalPayment = 0;
    
    if (params.enableFinancing && year <= params.loanTermYears && currentLoanBalance > 0) {
        interestPayment = currentLoanBalance * (params.loanInterestRate / 100);
        principalPayment = annualLoanPayment - interestPayment;
        if (principalPayment > currentLoanBalance) principalPayment = currentLoanBalance; // Cap last payment
        currentLoanBalance -= principalPayment;
    }
    totalLoanInterestCost += interestPayment;

    // 5. DEPRECIATION (Non-cash expense for Tax)
    let depreciation = 0;
    
    if (params.depreciationMethod === 'Straight Line') {
        depreciation = (year <= params.depreciationPeriod) ? depreciableBasis / params.depreciationPeriod : 0;
    } else if (params.depreciationMethod === 'MACRS 5-Year') {
        const rate = MACRS_5_YEAR[year - 1] || 0;
        depreciation = depreciableBasis * rate;
    } else if (params.depreciationMethod === 'MACRS 7-Year') {
        const rate = MACRS_7_YEAR[year - 1] || 0;
        depreciation = depreciableBasis * rate;
    } else if (params.depreciationMethod === 'Double Declining Balance') {
        // Simplified DDB
         if (year <= params.depreciationPeriod) {
            const rate = 2 / params.depreciationPeriod;
            depreciation = depreciableBasis * rate; 
        }
    }

    // 6. TAX
    const taxableIncome = ebitda - interestPayment - depreciation;
    let tax = 0;
    if (taxableIncome > 0 && params.corporateTaxRate > 0) {
        tax = taxableIncome * (params.corporateTaxRate / 100);
    }
    totalTaxes += tax;
    totalTaxableIncome += taxableIncome;

    // 7. CASH FLOW
    const netCashFlow = yearRevenue - yearOpEx - interestPayment - principalPayment - tax;
    cashFlow.push(netCashFlow);

    // Payback Period Calculation
    if (!paybackFound) {
        const prevCumulative = cumulativeCashFlow;
        cumulativeCashFlow += netCashFlow;
        if (cumulativeCashFlow >= 0) {
            // Fraction of year needed to cover the remainder
            // Guard against division by zero if netCashFlow is 0 (unlikely but possible)
            if (netCashFlow !== 0) {
                const fraction = Math.abs(prevCumulative) / netCashFlow;
                paybackPeriod = (year - 1) + fraction;
            } else {
                paybackPeriod = year;
            }
            paybackFound = true;
        }
    }
  }

  // --- TOTALS ---
  const totalCarbonRevenue = params.enableCarbonCredits && isLeasing
    ? (totalRecoveredVolume * co2TonnesPerVolumeUnit) * params.pricePerCredit
    : 0;
  
  const totalRevenue = salesRevenue + totalLeasingRevenue + installationRevenue + totalCarbonRevenue + totalMonthlyFeeRevenue + totalSparePartsRevenue;

  const totalOpEx = totalMaintenance + totalWarranty + totalConsumables + totalOperational + totalElectricity;
  const totalCosts = cogs + installationCost + customerAcquisitionCost + totalOpEx + totalLoanInterestCost;

  const netProfit = totalRevenue - totalCosts - totalTaxes; // Post-tax lifetime profit

  // NPV
  let npv = 0;
  cashFlow.forEach((flow, i) => {
      npv += flow / Math.pow(1 + params.discountRate / 100, i);
  });
  
  // IRR
  const irr = calculateIRR(cashFlow);

  // --- IMPACT & BREAK-EVEN CALCULATIONS ---
  // ESG
  const totalCo2Saved = totalRecoveredVolume * co2TonnesPerVolumeUnit;
  // EPA Factors: 1 Tonne = 0.217 vehicles/year, 1 Tonne = 16.5 tree seedlings (10 years) -> rough approx 40-50 trees planted equivalent for simplified marketing stats
  const carsOffRoadEquiv = totalCo2Saved * 0.22;
  const treesPlantedEquiv = totalCo2Saved * 45; // Approx
  const homesPoweredEquiv = totalCo2Saved * 0.12; // Approx

  // Break Even Volume (Daily)
  // We need to find Volume V such that Revenue(V) = OpEx + (CapEx/Term)
  // Revenue Per Daily Gallon Dispensed = 
  //   (RecoveryRate * Uptime * 365) * [ (GasPrice * RevShare) + (Co2PerGal * CreditPrice) ]
  
  const recoveryEfficiency = (params.recoveryRate / 100) * (params.machineUptime / 100) * 365;
  const revPerRecoveredUnit = (params.gasolinePrice * (params.companyRevenueShare/100)) + 
                              (params.enableCarbonCredits ? co2TonnesPerVolumeUnit * params.pricePerCredit : 0);
  
  const annualRevPerDailyDispensedUnit = recoveryEfficiency * revPerRecoveredUnit;

  // Costs
  // OpEx is mostly fixed per unit (maintenance, warranty, etc).
  // Some OpEx is variable (Electricity depends on runtime? usually assumed constant daily profile).
  // Let's assume all OpEx inputs are fixed per machine regardless of volume for this Break Even calc.
  const totalFixedOpExPerYear = totalUnitsSold > 0 
    ? (baseAnnualMaintenance + baseAnnualWarranty + baseAnnualConsumables + baseAnnualOperational + baseTotalAnnualElectricity) / totalUnitsSold
    : 0;
    
  // CapEx (Hardware + Install + CAC) amortized over lease term
  const totalCapExAmortizedPerYear = (totalUnitsSold > 0 && params.leaseTerm > 0)
    ? ((cogs + installationCost + customerAcquisitionCost) / params.leaseTerm) / totalUnitsSold
    : 0;

  // Break Even for OpEx only (Operating Cash Flow positive)
  let breakEvenDailyVolume = 0;
  let breakEvenTotalVolume = 0;
  let safetyMargin = 0;

  if (isLeasing && annualRevPerDailyDispensedUnit > 0) {
      breakEvenDailyVolume = totalFixedOpExPerYear / annualRevPerDailyDispensedUnit;
      // Break Even for Total ROI > 0
      breakEvenTotalVolume = (totalFixedOpExPerYear + totalCapExAmortizedPerYear) / annualRevPerDailyDispensedUnit;
      
      if (params.avgGasolineSold > 0) {
          safetyMargin = ((params.avgGasolineSold - breakEvenTotalVolume) / params.avgGasolineSold) * 100;
      }
  }

  return {
    totalUnitsSold,
    revenue: {
      salesRevenue,
      leasingRevenue: totalLeasingRevenue,
      installationRevenue,
      carbonCreditRevenue: totalCarbonRevenue,
      monthlyFeeRevenue: totalMonthlyFeeRevenue,
      sparePartsRevenue: totalSparePartsRevenue,
      totalRevenue,
    },
    costs: {
      cogs,
      installationCost,
      maintenanceCost: totalMaintenance,
      electricityCost: totalElectricity,
      consumablesCost: totalConsumables,
      warrantyCost: totalWarranty,
      operationalCost: totalOperational,
      customerAcquisitionCost,
      loanInterestCost: totalLoanInterestCost,
      totalCosts,
      totalTaxes,
    },
    profitability: {
      grossProfit: totalRevenue - cogs - installationCost, 
      ebitda: totalRevenue - totalOpEx - cogs - installationCost - customerAcquisitionCost,
      netProfit,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      roi: (totalCosts + totalTaxes) > 0 ? (netProfit / (totalCosts + totalTaxes)) * 100 : 0,
      npv,
      irr,
      paybackPeriod: paybackFound ? paybackPeriod : -1, // Return -1 if never pays back
    },
    cashFlow,
    impact: {
        totalCo2Saved,
        treesPlantedEquiv,
        carsOffRoadEquiv,
        homesPoweredEquiv,
        breakEvenDailyVolume,
        breakEvenTotalVolume,
        safetyMargin
    }
  };
};
