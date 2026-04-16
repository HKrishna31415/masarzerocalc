
import { describe, it, expect } from 'vitest';
import { calculateVaporRecovery } from './calculator';
import { DEFAULT_PARAMS } from './presets';
import { InputParams } from '../types';

describe('Vapor Recovery Calculator Logic', () => {

    describe('Leasing Model Profitability', () => {
        const baseParams: InputParams = {
            ...DEFAULT_PARAMS,
            businessModel: 'Leasing',
            unitsPerClient: 1,
            numberOfClients: 1,
            leaseTerm: 5,
            avgGasolineSold: 1000,
            gasolinePrice: 1.0,
            recoveryRate: 0.1, // 0.1% for simplicity in manual calc? No, inputs are usually percents like 50? 
            // DEFAULT_PARAMS uses recoveryRate: 0.5 (which usually means 0.5%). Wait, the calculator uses params.recoveryRate / 100.
            // If user enters 0.5 in UI, it means 0.5%. Let's assume standard recovery is 0.1% or 0.2% of volume?
            // Actually, vapor recovery rate is usually 0.1% to 0.2% of throughput liquid volume. 
            // In the calculator: `dailyVolThisYear * totalUnitsSold * (params.recoveryRate / 100)`
            // If I input 1, that's 1%.
            
            // Let's stick to easy math:
            // Volume: 1000 gal/day
            // Recovery: 0.1% (entered as 0.1) -> 1 gal/day recovered.
            // Uptime: 100%
            // Price: $1.00/gal
            // Share: 100%
            // Revenue/Year = 1 * 1.00 * 1 * 365 = $365.
        };

        it('calculates leasing revenue correctly', () => {
             const params = {
                 ...baseParams,
                 recoveryRate: 0.1, // 0.1%
                 machineUptime: 100,
                 companyRevenueShare: 100,
                 gasolinePrice: 1.0,
                 enableCarbonCredits: false,
                 enableMonthlyFees: false,
                 companyHandlesInstallation: false
             };
             
             const result = calculateVaporRecovery(params);
             // Expected Recovered = 1000 * 0.001 * 365 = 365 gallons/year
             // Revenue = 365 * $1.00 = $365/year
             // Term = 5 years -> Total = $1825
             
             // The calculator logic uses (recoveryRate / 100).
             // If I want 0.1%, I should enter 0.1.
             
             expect(result.revenue.leasingRevenue).toBeCloseTo(1825, 0);
        });
    });

    describe('Direct Sales Model', () => {
         const directParams: InputParams = {
            ...DEFAULT_PARAMS,
            businessModel: 'Direct Sales',
            unitsPerClient: 10,
            numberOfClients: 1,
            unitSalePrice: 20000,
            companyHandlesInstallation: false,
            warrantyDurationYears: 100 // No post-warranty revenue
        };

        it('calculates sales revenue correctly', () => {
            const result = calculateVaporRecovery(directParams);
            expect(result.revenue.salesRevenue).toBe(10 * 20000); // 200,000
            expect(result.revenue.leasingRevenue).toBe(0);
        });
    });

    describe('Loan Logic', () => {
         const loanParams: InputParams = {
            ...DEFAULT_PARAMS,
            businessModel: 'Direct Sales', // Simplify revenue side
            enableFinancing: true,
            unitCost: 10000,
            unitsPerClient: 1,
            numberOfClients: 1,
            companyHandlesInstallation: false, // No install cost
            customerAcquisitionCost: 0,
            loanDownPaymentPercent: 0,
            loanInterestRate: 10, // 10%
            loanTermYears: 2,
            leaseTerm: 2
        };
        
        // Principal = 10,000
        // r = 0.10
        // n = 2
        // PMT = (10000 * 0.1 * 1.1^2) / (1.1^2 - 1)
        // PMT = (1000 * 1.21) / (0.21) = 1210 / 0.21 = 5761.90
        // Total Interest = (5761.90 * 2) - 10000 = 11523.80 - 10000 = 1523.80

        it('calculates loan interest correctly', () => {
            const result = calculateVaporRecovery(loanParams);
            expect(result.costs.loanInterestCost).toBeGreaterThan(1500);
            expect(result.costs.loanInterestCost).toBeLessThan(1550);
        });
    });

    describe('Payback Period', () => {
         const paybackParams: InputParams = {
            ...DEFAULT_PARAMS,
            businessModel: 'Direct Sales',
            unitsPerClient: 1,
            unitCost: 100, // Cost 100
            unitSalePrice: 150, // Revenue 150
            companyHandlesInstallation: false,
            customerAcquisitionCost: 0,
            annualMaintenanceCost: 0,
            annualWarrantyCost: 0,
            annualConsumablesCost: 0,
            dailyOperationalCost: 0,
            unitElectricityConsumptionKwhDay: 0,
            leaseTerm: 5,
            warrantyDurationYears: 100
            // Initial Cash Flow = -100
            // Year 1 Revenue = 150. OpEx = 0.
            // Net Cash Flow Y1 = 150.
            // Cumulative Y1 = -100 + 150 = +50.
            // Payback should be < 1 year. 
            // Fraction = abs(-100) / 150 = 0.66 years.
        };

        it('calculates fractional payback period', () => {
             const result = calculateVaporRecovery(paybackParams);
             expect(result.profitability.paybackPeriod).toBeCloseTo(0.67, 1);
        });
    });
    
    describe('Variable Electricity Cost', () => {
        const varParams: InputParams = {
            ...DEFAULT_PARAMS,
            businessModel: 'Leasing',
            unitsPerClient: 1,
            numberOfClients: 1,
            leaseTerm: 1, // 1 year term
            inflationRate: 0, // No inflation
            avgGasolineSold: 1000, // 1000 L/day
            recoveryRate: 0.1, // 0.1% -> 1 L/day recovered
            machineUptime: 100,
            electricityPrice: 0.20,
            electricityUsageType: 'Variable',
            hardwarePowerRatingKw: 4,
            hardwareProcessingRateLph: 1, // 1 L/hr processing rate
            // Daily Recovered = 1 L.
            // Run Hours = 1 L / 1 Lph = 1 hour.
            // kWh = 1 hr * 4 kW = 4 kWh.
            // Cost = 4 kWh * $0.20 = $0.80/day.
            // Annual = $0.80 * 365 = $292.
            
            // Fixed comparison:
            unitElectricityConsumptionKwhDay: 10, // 10 kWh/day fixed
        };

        it('calculates variable electricity correctly', () => {
             const result = calculateVaporRecovery(varParams);
             expect(result.costs.electricityCost).toBeCloseTo(292, 0);
        });

        it('uses fixed electricity when toggled', () => {
             const fixedParams = { ...varParams, electricityUsageType: 'Fixed' as const };
             const result = calculateVaporRecovery(fixedParams);
             // 10 kWh * 0.20 * 365 = $730
             expect(result.costs.electricityCost).toBeCloseTo(730, 0);
        });
    });

    describe('Negative Profit Payback', () => {
        const lossParams: InputParams = {
            ...DEFAULT_PARAMS,
            unitSalePrice: 100,
            unitCost: 1000, // Huge loss
            businessModel: 'Direct Sales',
            unitsPerClient: 1,
            numberOfClients: 1,
            // Cash flow Y0: -1000
            // Cash flow Y1: +100
            // Never pays back.
        };

        it('returns -1 for infinite payback', () => {
             const result = calculateVaporRecovery(lossParams);
             expect(result.profitability.paybackPeriod).toBe(-1);
        });
    });

    describe('Safeguards', () => {
        const zeroParams: InputParams = {
            ...DEFAULT_PARAMS,
            unitsPerClient: 0, // No units
            numberOfClients: 0
        };
        
        it('handles zero units without crashing', () => {
            const result = calculateVaporRecovery(zeroParams);
            expect(result.totalUnitsSold).toBe(0);
            expect(result.profitability.roi).toBe(0); // Should handle division by zero
            expect(result.impact.breakEvenDailyVolume).toBe(0);
        });
    });
});
