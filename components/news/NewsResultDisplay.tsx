import React from 'react';
import { MarketIntelligenceAnalysis, RegulatoryAndGeopoliticalRisk, InstitutionalHolder } from '../../types';
import { NewspaperIcon, LinkIcon, ExclamationTriangleIcon, CheckCircleIcon, UserGroupIcon } from '../IconComponents';
import { VisualGauge } from '../VisualGauge';
import { CollapsibleSection } from '../CollapsibleSection';

interface MarketIntelligenceResultDisplayProps {
  result: MarketIntelligenceAnalysis;
}

const sentimentGaugeSegments = [
    { label: 'Negative', color: 'bg-red-200', textColor: 'text-red-800 dark:text-red-300' },
    { label: 'Neutral', color: 'bg-gray-200', textColor: 'text-gray-800 dark:text-gray-300' },
    { label: 'Positive', color: 'bg-green-200', textColor: 'text-green-800 dark:text-green-300' },
];

const sentimentGaugeMap: {[key: string]: number} = {
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

const RegulatoryRiskCard: React.FC<{ risk: RegulatoryAndGeopoliticalRisk }> = ({ risk }) => (
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


export const MarketIntelligenceResultDisplay: React.FC<MarketIntelligenceResultDisplayProps> = ({ result }) => {
  const { overall_sentiment, intelligence_summary, key_articles, regulatory_and_geopolitical_risks, key_positive_points, key_negative_points, major_holders, sources, insider_trading_summary } = result;
  const sentimentValue = sentimentGaugeMap[overall_sentiment];
  
  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Market Intelligence Analysis</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Synthesized news, sentiment, and ownership trends.</p>

        {sentimentValue !== undefined && overall_sentiment !== 'N/A' && (
            <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-200/80 dark:bg-slate-700/50 dark:border-slate-600/80">
                <VisualGauge label="Overall Sentiment" value={sentimentValue} segments={sentimentGaugeSegments} />
            </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
          <p>{intelligence_summary}</p>
        </div>
        
         {insider_trading_summary && insider_trading_summary !== 'N/A' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-500/30">
                <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-1">Insider Activity</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200">{insider_trading_summary}</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Key Positive Points</h4>
                <ul className="space-y-2">
                    {key_positive_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Key Negative Points</h4>
                <ul className="space-y-2">
                    {key_negative_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
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

        {regulatory_and_geopolitical_risks && regulatory_and_geopolitical_risks.length > 0 && (
          <CollapsibleSection title={`Regulatory & Geopolitical Risks (${regulatory_and_geopolitical_risks.length})`} icon={<ExclamationTriangleIcon />}>
            <div className="space-y-3">
              {regulatory_and_geopolitical_risks.map((risk, index) => (
                <RegulatoryRiskCard key={index} risk={risk} />
              ))}
            </div>
          </CollapsibleSection>
        )}
        
         {major_holders && major_holders.length > 0 && (
            <CollapsibleSection title="Major Institutional Holders" icon={<UserGroupIcon />}>
                <div className="columns-1 md:columns-2 gap-x-6">
                {major_holders.map((holder: InstitutionalHolder, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700/50 break-inside-avoid">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{holder.name}</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{holder.stake}</span>
                    </div>
                ))}
                </div>
            </CollapsibleSection>
         )}

        {sources && sources.length > 0 && (
            <CollapsibleSection title="Sources" icon={<LinkIcon />}>
                 <ul className="list-disc pl-5 space-y-2 prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
                  {sources.map((source, index) => (
                      <li key={index}>
                          <a 
                              href={source.uri} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-500 hover:underline break-all dark:text-blue-400 dark:hover:text-blue-300"
                              title={source.uri}
                          >
                              {source.title || source.uri}
                          </a>
                      </li>
                  ))}
              </ul>
            </CollapsibleSection>
        )}

      </div>
    </div>
  );
};