import React from 'react';
import { CompetitiveResultDisplay } from './CompetitiveResultDisplay';
import { CompetitiveAnalysis, CalculatedMetric } from '../../types';

interface CompetitiveAgentCardProps {
  result: CompetitiveAnalysis | null;
  stockSymbol: string;
  calculatedMetrics: Record<string, CalculatedMetric>;
}

export const CompetitiveAgentCard: React.FC<CompetitiveAgentCardProps> = ({ result, stockSymbol, calculatedMetrics }) => {
  if (result) {
    return <CompetitiveResultDisplay result={result} stockSymbol={stockSymbol} calculatedMetrics={calculatedMetrics} />;
  }

  return null;
};
