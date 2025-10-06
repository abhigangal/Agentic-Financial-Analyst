import React from 'react';
import { QuantitativeResultDisplay } from './QuantitativeResultDisplay';
import { QuantitativeAnalysis } from '../../types';

interface QuantitativeAgentCardProps {
  result: QuantitativeAnalysis | null;
}

export const QuantitativeAgentCard: React.FC<QuantitativeAgentCardProps> = ({ result }) => {
  if (result) {
    return <QuantitativeResultDisplay result={result} />;
  }

  return null;
};
