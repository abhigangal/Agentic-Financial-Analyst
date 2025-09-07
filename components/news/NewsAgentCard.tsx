import React from 'react';
import { MarketIntelligenceResultDisplay } from './NewsResultDisplay';
import { MarketIntelligenceAnalysis } from '../../types';

interface MarketIntelligenceAgentCardProps {
  result: MarketIntelligenceAnalysis | null;
}

export const MarketIntelligenceAgentCard: React.FC<MarketIntelligenceAgentCardProps> = ({ result }) => {
  if (result) {
    return <MarketIntelligenceResultDisplay result={result} />;
  }

  return null;
};