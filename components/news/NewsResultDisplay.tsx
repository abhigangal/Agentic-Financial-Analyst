import React from 'react';
import { NewsAnalysis, RegulatoryRisk } from '../../types';
import { NewspaperIcon, LinkIcon, ExclamationTriangleIcon } from '../IconComponents';
import { VisualGauge } from '../VisualGauge';
import { CollapsibleSection } from '../CollapsibleSection';

interface NewsResultDisplayProps {
  result: NewsAnalysis;
}

const newsSentimentSegments = [
    { label: 'Negative', color: 'bg-red-200', textColor: 'text-red-800 dark:text-red-300' },
    { label: 'Neutral', color: 'bg-gray-200', textColor: 'text-gray-800 dark:text-gray-300' },
    { label: 'Positive', color: 'bg-green-200', textColor: 'text-green-800 dark:text-green-300' },
];

const newsSentimentMap: {[key: string]: number} = {
    'Negative': 0, 'Neutral': 1, 'Positive': 2
};

const sentimentColors: {[key: string]: string} = {
    'Positive': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
    'Negative': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
    'Neutral': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600',
};

const riskSeverityColors: {[key: string]: string} = {
    'High': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
    'Low': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600',
}

const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return null;
    }
};

const RegulatoryRiskCard: React.FC<{ risk: RegulatoryRisk }> = ({ risk }) => (
    <div className="p-3 bg-white border border-gray-200/80 rounded-lg dark:bg-slate-700/50 dark:border-slate-600/80">
        <div className="flex justify-between items-start gap-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">{risk.description}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${riskSeverityColors[risk.severity] || riskSeverityColors['Low']}`}>
                {risk.severity}
            </span>
        </div>
        {risk.source_url && (
             <a 
                href={risk.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:underline mt-2"
            >
                <LinkIcon /> Source
            </a>
        )}
    </div>
);


export const NewsResultDisplay: React.FC<NewsResultDisplayProps> = ({ result }) => {
  const { overall_sentiment, summary, key_articles, regulatory_risks } = result;
  const sentimentValue = newsSentimentMap[overall_sentiment];
  
  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">News Analysis</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Recent news from the last 15 days.</p>

        {sentimentValue !== undefined && overall_sentiment !== 'N/A' && (
            <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-200/80 dark:bg-slate-700/50 dark:border-slate-600/80">
                <VisualGauge label="Overall News Sentiment" value={sentimentValue} segments={newsSentimentSegments} />
            </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
          <p>{summary}</p>
        </div>
        
        {key_articles && key_articles.length > 0 && (
          <CollapsibleSection title={`Key Articles (${key_articles.length})`} icon={<NewspaperIcon />}>
            <div className="space-y-3">
                {key_articles.map((article, index) => {
                    const formattedDate = formatDate(article.published_date);
                    return (
                        <div key={index} className="p-3 bg-white border border-gray-200/80 rounded-lg dark:bg-slate-700/50 dark:border-slate-600/80">
                            <div className="flex justify-between items-start gap-2">
                               <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline text-sm leading-tight pr-2 dark:text-blue-400 dark:hover:text-blue-300">
                                   {article.title}
                               </a>
                               <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${sentimentColors[article.sentiment] || sentimentColors['Neutral']}`}>
                                   {article.sentiment}
                               </span>
                            </div>
                            {formattedDate && (
                                <p className="text-xs text-gray-500 font-mono mt-1.5 dark:text-slate-400">{formattedDate}</p>
                            )}
                            <p className="text-xs text-slate-600 mt-1.5 dark:text-slate-300">{article.summary}</p>
                        </div>
                    )
                })}
            </div>
          </CollapsibleSection>
        )}

        {regulatory_risks && regulatory_risks.length > 0 && (
          <CollapsibleSection title={`Regulatory & Geopolitical Risks (${regulatory_risks.length})`} icon={<ExclamationTriangleIcon />}>
            <div className="space-y-3">
              {regulatory_risks.map((risk, index) => (
                <RegulatoryRiskCard key={index} risk={risk} />
              ))}
            </div>
          </CollapsibleSection>
        )}

      </div>
    </div>
  );
};
