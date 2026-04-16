
import { AnalyzableVariable, AnalyzableMetric, InputParams } from '../types';

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.15,
  CAD: 1.35,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.19,
  INR: 82.90,
  BRL: 4.97,
  // GCC
  SAR: 3.75,
  AED: 3.67,
  KWD: 0.307,
  QAR: 3.64,
  BHD: 0.376,
  OMR: 0.385,
  // Asia-Pacific
  KRW: 1325.0,
  THB: 35.1,
  MYR: 4.72,
  // China
  // CNY already included above
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: '$',
  AUD: '$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  // GCC
  SAR: '﷼',
  AED: 'د.إ',
  KWD: 'KD',
  QAR: 'QR',
  BHD: 'BD',
  OMR: 'OMR',
  // Asia-Pacific
  KRW: '₩',
  THB: '฿',
  MYR: 'RM',
};

export const MONETARY_PARAMS: (keyof InputParams)[] = [
  'pricePerCredit',
  'gasolinePrice',
  'electricityPrice',
  'annualMaintenanceCost',
  'unitSalePrice',
  'installationCostPerUnit',
  'customerAcquisitionCost',
  'unitCost',
  'postWarrantyRevenuePerUnit',
  'monthlyFeePerUnit'
];

export interface VariableConfig {
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  models: ('Leasing' | 'Direct Sales')[];
}

export const SENSITIVITY_CONFIG: Record<AnalyzableVariable, VariableConfig> = {
  avgGasolineSold: {
    label: 'Gasoline Sold (gal/day)',
    min: 10000,
    max: 100000,
    step: 1000,
    unit: 'gal/day',
    models: ['Leasing'],
  },
  recoveryRate: {
    label: 'Recovery Rate',
    min: 0.01,
    max: 1,
    step: 0.01,
    unit: '%',
    models: ['Leasing'],
  },
  gasolinePrice: {
    label: 'Gasoline Price',
    min: 0.5,
    max: 2.0,
    step: 0.05,
    unit: '$',
    models: ['Leasing'],
  },
  companyRevenueShare: {
    label: 'Revenue Share',
    min: 10,
    max: 90,
    step: 5,
    unit: '%',
    models: ['Leasing'],
  },
  leaseTerm: {
    label: 'Lease Term (years)',
    min: 1,
    max: 20,
    step: 1,
    unit: 'yrs',
    models: ['Leasing'],
  },
  unitsPerClient: {
    label: 'Units per Client',
    min: 1,
    max: 200,
    step: 5,
    unit: 'units',
    models: ['Leasing', 'Direct Sales'],
  },
  pricePerCredit: {
    label: 'Carbon Credit Price',
    min: 5,
    max: 100,
    step: 5,
    unit: '$',
    models: ['Leasing'],
  },
  unitSalePrice: {
    label: 'Unit Sale Price',
    min: 20000,
    max: 80000,
    step: 1000,
    unit: '$',
    models: ['Direct Sales'],
  }
};

const formatCurrencyCompact = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const METRIC_CONFIG: Record<AnalyzableMetric, { label: string; format: (value: number, currency: string) => string; }> = {
  netProfit: {
    label: 'Net Profit',
    format: (value, currency) => formatCurrencyCompact(value, currency),
  },
  npv: {
    label: 'Net Present Value (NPV)',
    format: (value, currency) => formatCurrencyCompact(value, currency),
  },
  roi: {
    label: 'Return on Investment (ROI)',
    format: (value) => formatPercent(value),
  },
  totalRevenue: {
    label: 'Total Revenue',
    format: (value, currency) => formatCurrencyCompact(value, currency),
  }
};
