import { useMemo } from 'react';
import { InputParams, CalculatedResults } from '../types';
import { calculateVaporRecovery } from '../utils/calculator';

export const useVaporRecoveryCalculator = (params: InputParams): CalculatedResults => {
  return useMemo(() => calculateVaporRecovery(params), [params]);
};
