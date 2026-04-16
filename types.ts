
import React from 'react';

export interface TooltipInfo {
  title: string;
  shortText: string;
  details: React.ReactNode;
}

export interface InputParams {
  businessModel: 'Direct Sales' | 'Leasing';
  unitSystem: 'gallons' | 'liters';
  unitsPerClient: number;
  numberOfClients: number;
  companyHandlesInstallation: boolean;
  installationPaidByClient: boolean; // Separate from who handles it
  electricityPaidByClient: boolean; // Whether client pays electricity costs
  enableCashFlowDiscounting: boolean;
  discountRate: number;
  enableCarbonCredits: boolean;
  pricePerCredit: number;
  avgGasolineSold: number;
  recoveryRate: number;
  gasolinePrice: number;
  companyRevenueShare: number;
  leaseTerm: number;
  machineUptime: number;
  electricityPrice: number;
  annualMaintenanceCost: number;
  unitSalePrice: number;
  volumeGrowthRate: number;
  annualConsumablesCost: number;
  annualWarrantyCost: number;
  dailyOperationalCost: number;
  
  // Hardware Specs
  hardwareType?: string;
  hardwarePowerRatingKw: number;
  hardwareProcessingRateLph: number;
  electricityUsageType: 'Fixed' | 'Variable';

  // Constants
  installationCostPerUnit: number;
  installationMargin: number; // %
  customerAcquisitionCost: number;
  unitCost: number;
  unitElectricityConsumptionKwhDay: number;
  co2TonnesPerGallon: number;

  // SaaS / Monthly Fees
  enableMonthlyFees: boolean;
  monthlyFeePerUnit: number;

  // Direct Sales Specifics
  warrantyDurationYears: number;
  postWarrantyRevenuePerUnit: number; // e.g. Spare parts sales

  // Advanced Project Finance
  enableFinancing: boolean;
  loanDownPaymentPercent: number; // 0-100
  loanInterestRate: number; // %
  loanTermYears: number;
  corporateTaxRate: number; // %
  depreciationPeriod: number; // years
  
  // New Features
  inflationRate: number; // % Annual increase in OpEx
  depreciationMethod: 'Straight Line' | 'MACRS 5-Year' | 'MACRS 7-Year' | 'Double Declining Balance';
  
  // Enhanced Analyst Parameters
  maintenanceInflationRate?: number; // % Annual increase in maintenance costs
  electricityInflationRate?: number; // % Annual increase in electricity costs
  consumablesInflationRate?: number; // % Annual increase in consumables
  seasonalVolumeVariation?: number; // % Seasonal volume swing (±)
  equipmentDegradationRate?: number; // % Annual decline in efficiency
  maintenanceEscalationYear?: number; // Year when maintenance costs increase significantly
  
  // Compliance & Regulatory
  annualComplianceFee?: number; // Annual regulatory/compliance fees per unit
  penaltyAvoidanceSavings?: number; // Annual savings from avoiding penalties per unit
}

export interface CalculatedResults {
  totalUnitsSold: number;
  revenue: {
    salesRevenue: number;
    leasingRevenue: number;
    installationRevenue: number;
    carbonCreditRevenue: number;
    monthlyFeeRevenue: number;
    sparePartsRevenue: number;
    totalRevenue: number;
  };
  costs: {
    cogs: number;
    installationCost: number;
    maintenanceCost: number;
    electricityCost: number;
    consumablesCost: number;
    warrantyCost: number;
    operationalCost: number;
    customerAcquisitionCost: number;
    loanInterestCost: number;
    totalCosts: number;
    totalTaxes: number;
  };
  profitability: {
    grossProfit: number;
    ebitda: number;
    netProfit: number; // After tax
    profitMargin: number;
    roi: number;
    npv: number;
    irr: number;
    paybackPeriod: number; // Years to break even
  };
  cashFlow: number[];
  impact: {
      totalCo2Saved: number;
      treesPlantedEquiv: number;
      carsOffRoadEquiv: number;
      homesPoweredEquiv: number;
      breakEvenDailyVolume: number; // Volume needed to cover OpEx
      breakEvenTotalVolume: number; // Volume needed to cover OpEx + CapEx (ROI > 0)
      safetyMargin: number; // % distance between current volume and break even
  }
}

export interface Station {
  id: string;
  name: string;
  dailyVolume: number;
  recoveryRate: number;
  uptime: number;
  installCost: number;
  // Multi-currency support
  localCurrency?: string;
  exchangeRateToGlobal?: number; // 1 Local = X Global
}

export interface Scenario {
  id: string;
  name: string;
  date: string;
  params: InputParams;
  tag?: 'base' | 'optimistic' | 'pessimistic' | 'custom';
}

export type AnalyzableVariable = 
  | 'avgGasolineSold'
  | 'recoveryRate'
  | 'gasolinePrice'
  | 'companyRevenueShare'
  | 'leaseTerm'
  | 'unitsPerClient'
  | 'pricePerCredit'
  | 'unitSalePrice';

export type AnalyzableMetric = 'netProfit' | 'npv' | 'roi' | 'totalRevenue';
