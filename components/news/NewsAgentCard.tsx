import React from 'react';
import { NewsResultDisplay } from './NewsResultDisplay';
import { NewsAnalysis } from '../../types';

interface NewsAgentCardProps {
  result: NewsAnalysis | null;
}

export const NewsAgentCard: React.FC<NewsAgentCardProps> = ({ result }) => {
  if (result) {
    return <NewsResultDisplay result={result} />;
  }

  return null;
};
