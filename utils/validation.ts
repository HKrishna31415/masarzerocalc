import { InputParams } from '../types';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export const validateInputParams = (params: InputParams): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Volume validation
  if (params.avgGasolineSold <= 0) {
    errors.push({
      field: 'avgGasolineSold',
      message: 'Daily gasoline volume must be greater than 0',
      severity: 'error'
    });
  }
  if (params.avgGasolineSold < 1000) {
    errors.push({
      field: 'avgGasolineSold',
      message: 'Volume below 1,000 L/day may not be economically viable',
      severity: 'warning'
    });
  }
  if (params.avgGasolineSold > 500000) {
    errors.push({
      field: 'avgGasolineSold',
      message: 'Volume exceeds typical station capacity',
      severity: 'warning'
    });
  }

  // Price validation
  if (params.gasolinePrice <= 0) {
    errors.push({
      field: 'gasolinePrice',
      message: 'Gasoline price must be greater than 0',
      severity: 'error'
    });
  }
  if (params.gasolinePrice > 10) {
    errors.push({
      field: 'gasolinePrice',
      message: 'Gasoline price seems unusually high',
      severity: 'warning'
    });
  }

  // Recovery rate validation
  if (params.recoveryRate < 0 || params.recoveryRate > 100) {
    errors.push({
      field: 'recoveryRate',
      message: 'Recovery rate must be between 0% and 100%',
      severity: 'error'
    });
  }
  if (params.recoveryRate < 10) {
    errors.push({
      field: 'recoveryRate',
      message: 'Recovery rate below 10% is unusually low',
      severity: 'warning'
    });
  }

  // Revenue share validation
  if (params.companyRevenueShare < 0 || params.companyRevenueShare > 100) {
    errors.push({
      field: 'companyRevenueShare',
      message: 'Revenue share must be between 0% and 100%',
      severity: 'error'
    });
  }

  // Units validation
  if (params.unitsPerClient <= 0) {
    errors.push({
      field: 'unitsPerClient',
      message: 'Units per client must be at least 1',
      severity: 'error'
    });
  }
  if (params.numberOfClients <= 0) {
    errors.push({
      field: 'numberOfClients',
      message: 'Number of clients must be at least 1',
      severity: 'error'
    });
  }

  // Lease term validation
  if (params.leaseTerm < 1) {
    errors.push({
      field: 'leaseTerm',
      message: 'Lease term must be at least 1 year',
      severity: 'error'
    });
  }
  if (params.leaseTerm > 20) {
    errors.push({
      field: 'leaseTerm',
      message: 'Lease term exceeds 20 years - consider long-term risks',
      severity: 'warning'
    });
  }

  // Cost validations
  if (params.unitCost <= 0) {
    errors.push({
      field: 'unitCost',
      message: 'Unit cost must be greater than 0',
      severity: 'error'
    });
  }
  if (params.installationCostPerUnit < 0) {
    errors.push({
      field: 'installationCostPerUnit',
      message: 'Installation cost cannot be negative',
      severity: 'error'
    });
  }
  if (params.annualMaintenanceCost < 0) {
    errors.push({
      field: 'annualMaintenanceCost',
      message: 'Maintenance cost cannot be negative',
      severity: 'error'
    });
  }

  // Rate validations
  if (params.discountRate < 0 || params.discountRate > 100) {
    errors.push({
      field: 'discountRate',
      message: 'Discount rate must be between 0% and 100%',
      severity: 'error'
    });
  }
  if (params.discountRate > 30) {
    errors.push({
      field: 'discountRate',
      message: 'Discount rate above 30% is unusually high',
      severity: 'warning'
    });
  }

  if (params.inflationRate < -10 || params.inflationRate > 50) {
    errors.push({
      field: 'inflationRate',
      message: 'Inflation rate should be between -10% and 50%',
      severity: 'warning'
    });
  }

  // Electricity validation
  if (params.electricityPrice < 0) {
    errors.push({
      field: 'electricityPrice',
      message: 'Electricity price cannot be negative',
      severity: 'error'
    });
  }
  if (params.electricityPrice > 1) {
    errors.push({
      field: 'electricityPrice',
      message: 'Electricity price seems unusually high',
      severity: 'warning'
    });
  }

  return errors;
};

export const hasErrors = (errors: ValidationError[]): boolean => {
  return errors.some(e => e.severity === 'error');
};

export const hasWarnings = (errors: ValidationError[]): boolean => {
  return errors.some(e => e.severity === 'warning');
};

export const getErrorsForField = (errors: ValidationError[], field: string): ValidationError[] => {
  return errors.filter(e => e.field === field);
};
