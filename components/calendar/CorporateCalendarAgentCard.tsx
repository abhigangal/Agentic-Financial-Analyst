import React from 'react';
import { CorporateCalendarResultDisplay } from './CorporateCalendarResultDisplay';
import { CorporateCalendarAnalysis } from '../../types';

interface CorporateCalendarAgentCardProps {
  result: CorporateCalendarAnalysis | null;
}

export const CorporateCalendarAgentCard: React.FC<CorporateCalendarAgentCardProps> = ({ result }) => {
  if (result) {
    return <CorporateCalendarResultDisplay result={result} />;
  }

  return null;
};