import React from 'react';
import { SectorResultDisplay } from './SectorResultDisplay';
import { SectorAnalysis } from '../../types';

interface SectorAgentCardProps {
  result: SectorAnalysis | null;
}

export const SectorAgentCard: React.FC<SectorAgentCardProps> = ({ result }) => {
  if (result) {
    return <SectorResultDisplay result={result} />;
  }

  return null;
};