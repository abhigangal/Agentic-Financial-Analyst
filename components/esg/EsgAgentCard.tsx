import React from 'react';
import { EsgResultDisplay } from './EsgResultDisplay';
import { EsgAnalysis } from '../../types';

interface EsgAgentCardProps {
  result: EsgAnalysis | null;
}

export const EsgAgentCard: React.FC<EsgAgentCardProps> = ({ result }) => {
  if (result) {
    return <EsgResultDisplay result={result} />;
  }

  return null;
};
