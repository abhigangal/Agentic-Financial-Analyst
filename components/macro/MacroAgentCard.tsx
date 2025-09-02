import React from 'react';
import { MacroResultDisplay } from './MacroResultDisplay';
import { MacroAnalysis } from '../../types';

interface MacroAgentCardProps {
  result: MacroAnalysis | null;
}

export const MacroAgentCard: React.FC<MacroAgentCardProps> = ({ result }) => {
  if (result) {
    return <MacroResultDisplay result={result} />;
  }

  return null;
};
