import React from 'react';
import { LeadershipResultDisplay } from './LeadershipResultDisplay';
import { LeadershipAnalysis } from '../../types';

interface LeadershipAgentCardProps {
  result: LeadershipAnalysis | null;
}

export const LeadershipAgentCard: React.FC<LeadershipAgentCardProps> = ({ result }) => {
  if (result) {
    return <LeadershipResultDisplay result={result} />;
  }

  return null;
};
