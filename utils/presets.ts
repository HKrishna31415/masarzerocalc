
import { InputParams } from '../types';

// NOTE: Unit costs in presets are base estimates and should be adjusted based on:
// - EXW (Ex Works): Factory price, buyer arranges shipping
// - FOB (Free On Board): Includes delivery to port
// - DDP (Delivered Duty Paid): Includes all shipping, duties, taxes to destination
// Example: GEVLR-3 may be $35k EXW, $42k FOB, or $50k+ DDP depending on destination

export const SMART_PRESETS: { name: string; description: string; category: string; params: Partial<InputParams> }[] = [
    {
        name: "Conservative",
        description: "Low volume, high costs, pessimistic assumptions",
        category: "Risk Profile",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 8000,
            gasolinePrice: 0.45,
            recoveryRate: 0.25,
            companyRevenueShare: 40,
            volumeGrowthRate: 0,
            machineUptime: 95,
            electricityPrice: 0.25,
            annualMaintenanceCost: 1500,
            unitCost: 35000, // GEVLR-2
            installationCostPerUnit: 3000,
            installationMargin: 15,
            pricePerCredit: 15,
            unitsPerClient: 10,
            numberOfClients: 1,
            leaseTerm: 15,
        }
    },
    {
        name: "Moderate",
        description: "Realistic average gas station, balanced assumptions",
        category: "Risk Profile",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 12000,
            gasolinePrice: 0.50,
            recoveryRate: 0.5,
            companyRevenueShare: 50,
            volumeGrowthRate: 2,
            machineUptime: 98,
            electricityPrice: 0.20,
            annualMaintenanceCost: 1000,
            unitCost: 35000, // GEVLR-2
            installationCostPerUnit: 3000,
            installationMargin: 20,
            pricePerCredit: 20,
            unitsPerClient: 20,
            numberOfClients: 1,
            leaseTerm: 20,
        }
    },
    {
        name: "Aggressive",
        description: "High volume station, optimistic assumptions",
        category: "Risk Profile",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 18000,
            gasolinePrice: 0.55,
            recoveryRate: 0.6,
            companyRevenueShare: 60,
            volumeGrowthRate: 5,
            machineUptime: 99.5,
            electricityPrice: 0.15,
            annualMaintenanceCost: 800,
            unitCost: 35000, // GEVLR-2
            installationCostPerUnit: 3000,
            installationMargin: 25,
            pricePerCredit: 25,
            unitsPerClient: 30,
            numberOfClients: 1,
            leaseTerm: 20,
        }
    },
    {
        name: "Ultra Conservative",
        description: "Worst-case scenario with minimal volume and high risks",
        category: "Risk Profile",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 5000,
            gasolinePrice: 0.40,
            recoveryRate: 0.15,
            companyRevenueShare: 35,
            volumeGrowthRate: -1,
            machineUptime: 90,
            electricityPrice: 0.30,
            annualMaintenanceCost: 2000,
            unitCost: 35000, // GEVLR-2
            installationCostPerUnit: 3500,
            installationMargin: 10,
            pricePerCredit: 10,
            unitsPerClient: 5,
            numberOfClients: 1,
            leaseTerm: 10,
            enableCarbonCredits: false,
        }
    },
    {
        name: "Western Europe",
        description: "Low volume, high fuel prices (€1.80/L), strict regulations",
        category: "Regional",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 9000,
            gasolinePrice: 1.80,
            recoveryRate: 0.55,
            companyRevenueShare: 60,
            electricityPrice: 0.35,
            annualMaintenanceCost: 1200,
            unitCost: 35000, // GEVLR-2
            installationCostPerUnit: 4000,
            installationMargin: 18,
            pricePerCredit: 85,
            unitsPerClient: 15,
            numberOfClients: 1,
            leaseTerm: 20,
            volumeGrowthRate: 1,
            enableCarbonCredits: true,
        }
    },
    {
        name: "Gulf Region",
        description: "High volume, low fuel prices ($0.25/L), subsidized energy",
        category: "Regional",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 25000,
            gasolinePrice: 0.25,
            recoveryRate: 0.45,
            companyRevenueShare: 45,
            electricityPrice: 0.08,
            annualMaintenanceCost: 800,
            unitCost: 50000, // GEVLR-3 for high volume
            installationCostPerUnit: 5000,
            installationMargin: 25,
            pricePerCredit: 12,
            unitsPerClient: 35,
            numberOfClients: 1,
            leaseTerm: 20,
            volumeGrowthRate: 4,
            enableCarbonCredits: false,
        }
    },
    {
        name: "North America",
        description: "Medium-high volume, moderate prices ($0.90/L)",
        category: "Regional",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 15000,
            gasolinePrice: 0.90,
            recoveryRate: 0.5,
            companyRevenueShare: 50,
            electricityPrice: 0.18,
            annualMaintenanceCost: 1000,
            unitCost: 35000, // GEVLR-2
            installationCostPerUnit: 3500,
            installationMargin: 20,
            pricePerCredit: 25,
            unitsPerClient: 25,
            numberOfClients: 1,
            leaseTerm: 20,
            volumeGrowthRate: 2,
        }
    },
    {
        name: "Asia Pacific",
        description: "High growth market, moderate volume, rising prices",
        category: "Regional",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 14000,
            gasolinePrice: 1.20,
            recoveryRate: 0.48,
            companyRevenueShare: 52,
            electricityPrice: 0.22,
            annualMaintenanceCost: 900,
            unitCost: 35000, // GEVLR-2
            installationCostPerUnit: 2800,
            installationMargin: 22,
            pricePerCredit: 30,
            unitsPerClient: 22,
            numberOfClients: 1,
            leaseTerm: 20,
            volumeGrowthRate: 6,
            enableCarbonCredits: true,
        }
    },
    {
        name: "Small Station",
        description: "Rural or low-traffic station (6-8k LPD)",
        category: "Station Size",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 7000,
            gasolinePrice: 0.48,
            recoveryRate: 0.45,
            companyRevenueShare: 45,
            annualMaintenanceCost: 1200,
            unitCost: 35000, // GEVLR-2
            installationCostPerUnit: 2500,
            installationMargin: 18,
            unitsPerClient: 8,
            numberOfClients: 1,
            leaseTerm: 15,
            volumeGrowthRate: 1,
        }
    },
    {
        name: "Medium Station",
        description: "Suburban station with steady traffic (12-15k LPD)",
        category: "Station Size",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 13000,
            gasolinePrice: 0.50,
            recoveryRate: 0.50,
            companyRevenueShare: 50,
            annualMaintenanceCost: 1000,
            unitCost: 35000, // GEVLR-2
            installationCostPerUnit: 3000,
            installationMargin: 20,
            unitsPerClient: 20,
            numberOfClients: 1,
            leaseTerm: 20,
            volumeGrowthRate: 2,
        }
    },
    {
        name: "Large Station",
        description: "Highway or high-traffic station (20-25k LPD)",
        category: "Station Size",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 22000,
            gasolinePrice: 0.52,
            recoveryRate: 0.55,
            companyRevenueShare: 55,
            annualMaintenanceCost: 1000,
            unitCost: 50000, // GEVLR-3 for higher volume
            installationCostPerUnit: 5000,
            installationMargin: 22,
            unitsPerClient: 40,
            numberOfClients: 1,
            leaseTerm: 20,
            volumeGrowthRate: 3,
        }
    },
    {
        name: "Fleet/Industrial",
        description: "Private depot with consistent high volume",
        category: "Station Size",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 35000,
            gasolinePrice: 0.45,
            recoveryRate: 0.5,
            annualMaintenanceCost: 1000,
            unitCost: 50000, // GEVLR-3 or MZ-1 for industrial
            installationCostPerUnit: 8000,
            installationMargin: 20,
            unitsPerClient: 50,
            numberOfClients: 1,
            companyRevenueShare: 55,
            machineUptime: 99.8,
            volumeGrowthRate: 0,
            leaseTerm: 20,
        }
    },
    {
        name: "SaaS + Leasing",
        description: "Revenue share + monthly software fees",
        category: "Business Model",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 12000,
            gasolinePrice: 0.50,
            companyRevenueShare: 40,
            enableMonthlyFees: true,
            monthlyFeePerUnit: 200,
            annualMaintenanceCost: 1000,
            unitCost: 35000,
            installationCostPerUnit: 3000,
            installationMargin: 20,
            unitsPerClient: 20,
            numberOfClients: 1,
            leaseTerm: 20,
        }
    },
    {
        name: "Direct Sales + SaaS",
        description: "Upfront hardware sale with recurring software fees",
        category: "Business Model",
        params: {
            businessModel: 'Direct Sales',
            unitSystem: 'liters',
            avgGasolineSold: 12000,
            gasolinePrice: 0.50,
            unitSalePrice: 38000,
            unitCost: 35000,
            enableMonthlyFees: true,
            monthlyFeePerUnit: 250,
            warrantyDurationYears: 2,
            postWarrantyRevenuePerUnit: 800,
            annualMaintenanceCost: 0, // Client handles maintenance in direct sales
            installationCostPerUnit: 3000,
            installationMargin: 15,
            unitsPerClient: 20,
            numberOfClients: 1,
            leaseTerm: 10,
        }
    },
    {
        name: "Pure Direct Sales",
        description: "Traditional hardware sale, no recurring fees",
        category: "Business Model",
        params: {
            businessModel: 'Direct Sales',
            unitSystem: 'liters',
            avgGasolineSold: 12000,
            gasolinePrice: 0.50,
            unitSalePrice: 42000,
            unitCost: 35000,
            enableMonthlyFees: false,
            warrantyDurationYears: 1,
            postWarrantyRevenuePerUnit: 600,
            annualMaintenanceCost: 0, // Client handles maintenance
            installationCostPerUnit: 3000,
            installationMargin: 18,
            unitsPerClient: 20,
            numberOfClients: 1,
            leaseTerm: 10,
        }
    },
    {
        name: "Debt Financed",
        description: "Leveraged deployment with bank financing",
        category: "Business Model",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 12000,
            enableFinancing: true,
            loanDownPaymentPercent: 15,
            loanInterestRate: 8.5,
            loanTermYears: 5,
            corporateTaxRate: 21,
            discountRate: 12,
            annualMaintenanceCost: 1000,
            unitCost: 35000,
            installationCostPerUnit: 3000,
            installationMargin: 20,
            unitsPerClient: 20,
            numberOfClients: 1,
        }
    },
    {
        name: "Agricultural Bank of Korea",
        description: "288 stations, 3-year term, company bears installation",
        category: "Regional",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 10000,
            gasolinePrice: 0.54, // $0.54/L
            recoveryRate: 0.42,
            companyRevenueShare: 50,
            electricityPrice: 0.13, // $0.13/kWh
            pricePerCredit: 30,
            unitsPerClient: 288,
            numberOfClients: 1,
            leaseTerm: 3,
            volumeGrowthRate: -0.5,
            machineUptime: 99.5,
            enableCarbonCredits: false,
            enableMonthlyFees: false,
            discountRate: 10,
            inflationRate: 2.5,
            installationCostPerUnit: 1500,
            installationMargin: 0, // No margin - company bears cost, no revenue
            companyHandlesInstallation: true,
            installationPaidByClient: false, // Company bears installation cost
            electricityPaidByClient: false, // Company pays electricity
            annualMaintenanceCost: 500, // $500/unit
            annualWarrantyCost: 0, // No warranty cost
            annualConsumablesCost: 150, // $150/unit for insurance
            unitCost: 15000, // $15k per unit
            hardwareType: 'GEVLR-2',
            hardwarePowerRatingKw: 4,
            hardwareProcessingRateLph: 42,
            unitElectricityConsumptionKwhDay: 4,
            annualComplianceFee: 0, // Can be adjusted for regulatory fees
            penaltyAvoidanceSavings: 0, // Can be adjusted for penalty avoidance
        }
    }
];

export const DEFAULT_PARAMS: InputParams = {
    businessModel: 'Leasing',
    unitSystem: 'liters', // Default to Liters
    unitsPerClient: 50,
    numberOfClients: 1,
    companyHandlesInstallation: true,
    installationPaidByClient: false, // Company pays by default
    electricityPaidByClient: false, // Company pays by default
    enableCashFlowDiscounting: true,
    discountRate: 10,
    enableCarbonCredits: true,
    pricePerCredit: 20,
    avgGasolineSold: 10000, // Adjusted to 10kL per day
    volumeGrowthRate: 0,
    recoveryRate: 0.5,
    gasolinePrice: 0.50, // Default Price $0.50
    companyRevenueShare: 50,
    leaseTerm: 20, // Adjusted to 20 years
    machineUptime: 99.5,
    electricityPrice: 0.20,
    annualMaintenanceCost: 1000,
    annualConsumablesCost: 200,
    annualWarrantyCost: 150,
    dailyOperationalCost: 2,
    unitSalePrice: 40000,
    installationCostPerUnit: 5000,
    installationMargin: 20, // Default 20% margin
    customerAcquisitionCost: 50000,
    unitCost: 25000, // Base cost - adjust for EXW/FOB/DDP shipping terms
    unitElectricityConsumptionKwhDay: 5,
    co2TonnesPerGallon: 0.008887,
    
    // Hardware Specs (Default to GEVLR-2 equivalent)
    hardwareType: 'GEVLR-2',
    hardwarePowerRatingKw: 4,
    hardwareProcessingRateLph: 42,
    electricityUsageType: 'Variable',

    // Direct Sales Defaults
    warrantyDurationYears: 1,
    postWarrantyRevenuePerUnit: 500,

    // New Defaults
    enableMonthlyFees: false,
    monthlyFeePerUnit: 100,
    enableFinancing: false,
    loanDownPaymentPercent: 20,
    loanInterestRate: 7,
    loanTermYears: 5,
    corporateTaxRate: 0, // Default to 0 to keep it simple initially
    depreciationPeriod: 7,
    
    // New Features v3.1
    inflationRate: 2.5, // Standard inflation
    depreciationMethod: 'Straight Line',
    
    // Enhanced Analyst Parameters
    maintenanceInflationRate: 3.0, // Maintenance typically inflates faster
    electricityInflationRate: 2.0, // Energy inflation
    consumablesInflationRate: 2.5, // Standard inflation
    seasonalVolumeVariation: 10, // ±10% seasonal swing
    equipmentDegradationRate: 0.5, // 0.5% annual efficiency decline
    maintenanceEscalationYear: 5, // Maintenance increases after warranty
    
    // Compliance & Regulatory
    annualComplianceFee: 0, // No compliance fees by default
    penaltyAvoidanceSavings: 0, // No penalty avoidance by default
};

export const PRESETS: { name: string; description: string; params: Partial<InputParams> }[] = [
    {
        name: "Standard Leasing Model",
        description: "Typical revenue share agreement with no upfront cost to client.",
        params: {
            businessModel: 'Leasing',
            companyRevenueShare: 50,
            unitsPerClient: 20,
            avgGasolineSold: 150000,
            enableMonthlyFees: false,
            enableFinancing: false,
            unitSystem: 'liters',
        }
    },
    {
        name: "US Market (Gallons)",
        description: "Standard US configuration in Gallons.",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'gallons',
            avgGasolineSold: 40000,
            gasolinePrice: 1.00,
        }
    },
    {
        name: "European Boutique Chain",
        description: "High fuel prices (€1.80+), strict regulations, low volume per station.",
        params: {
            businessModel: 'Leasing',
            unitSystem: 'liters',
            avgGasolineSold: 15000, // Low volume in Liters
            gasolinePrice: 1.85, // High price (EUR)
            electricityPrice: 0.35, // High energy cost
            pricePerCredit: 85, // EU ETS Carbon prices are high
            companyRevenueShare: 60, // Higher leverage due to regulation
            recoveryRate: 0.95, // Strict environmental compliance
            unitsPerClient: 15,
            enableCarbonCredits: true,
        }
    },
    {
        name: "Mining Fleet Depot",
        description: "Private industrial site. Direct purchase, high reliability required.",
        params: {
            businessModel: 'Direct Sales',
            unitSystem: 'liters',
            unitsPerClient: 50,
            unitSalePrice: 45000, // Premium ruggedized hardware
            avgGasolineSold: 100000, // Consistent fleet usage
            enableMonthlyFees: true, // Maintenance contract
            monthlyFeePerUnit: 400, // Premium service SLA
            machineUptime: 99.9, // Critical infrastructure
            customerAcquisitionCost: 15000, // Lower marketing, direct B2B sales
            dailyOperationalCost: 1, // Minimal overhead (private site)
            warrantyDurationYears: 3,
        }
    },
    {
        name: "SaaS + Hardware",
        description: "Client buys unit, pays monthly software fee + revenue share.",
        params: {
            businessModel: 'Direct Sales',
            unitSalePrice: 35000,
            enableMonthlyFees: true,
            monthlyFeePerUnit: 250,
            warrantyDurationYears: 2,
            postWarrantyRevenuePerUnit: 800, // Higher spare parts/service revenue
            companyRevenueShare: 20, 
            leaseTerm: 5,
        }
    },
    {
        name: "Leveraged Buyout (Debt)",
        description: "Using bank financing to fund the hardware fleet.",
        params: {
            businessModel: 'Leasing',
            enableFinancing: true,
            loanDownPaymentPercent: 15,
            loanInterestRate: 8.5,
            corporateTaxRate: 21,
            discountRate: 12,
        }
    }
];
