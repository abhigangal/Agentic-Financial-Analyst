import React from 'react';
import { CompetitiveResultDisplay } from './CompetitiveResultDisplay';
import { CompetitiveAnalysis, CalculatedMetric } from '../../types';

interface CompetitiveAgentCardProps {
  result: CompetitiveAnalysis | null;
  stockSymbol: string;
  calculatedMetrics: Record<string, CalculatedMetric>;
  currencySymbol: string;
}

export const CompetitiveAgentCard: React.FC<CompetitiveAgentCardProps> = ({ result, stockSymbol, calculatedMetrics, currencySymbol }) => {
  if (result) {
    return <CompetitiveResultDisplay result={result} stockSymbol={stockSymbol} calculatedMetrics={calculatedMetrics} currencySymbol={currencySymbol} />;
  }

  return null;
};