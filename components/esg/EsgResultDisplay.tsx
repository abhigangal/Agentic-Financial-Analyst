import React from 'react';
import { EsgAnalysis } from '../../types';
import { LinkIcon, DocumentTextIcon, SparklesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '../IconComponents';
import { CollapsibleSection } from '../CollapsibleSection';
import { EsgGauge } from './EsgGauge';

interface EsgResultDisplayProps {
  result: EsgAnalysis;
}

export const EsgResultDisplay: React.FC<EsgResultDisplayProps> = ({ result }) => {
  const { score, justification, sources, score_confidence, last_updated, na_justifications, esg_momentum, esg_momentum_period } = result;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // Check if the date is valid
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

  const formattedDate = formatDate(last_updated);
  
  const momentumIcon = {
      'Improving': <ArrowTrendingUpIcon className="h-4 w-4 text-green-500"/>,
      'Declining': <ArrowTrendingDownIcon className="h-4 w-4 text-red-500"/>,
      'Stable': <span className="text-gray-500 font-bold text-lg leading-none">-</span>,
      'N/A': null
  }[esg_momentum];

  return (
    <div className="animate-fade-in space-y-4">
      {/* Score and Summary */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">ESG Analysis</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Evaluates sustainability and ethical impact.</p>
        
        <EsgGauge score={score} naReason={score === 'N/A' ? na_justifications?.['score'] : undefined}/>
        
        <div className="flex justify-center flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
            {esg_momentum !== 'N/A' && (
                 <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full">
                    {momentumIcon}
                    <strong className="font-semibold text-slate-700 dark:text-slate-200">{esg_momentum}</strong>
                    <span className="text-slate-500 dark:text-slate-400">({esg_momentum_period})</span>
                </div>
            )}
            {score_confidence && (
                <div className="flex items-center gap-1.5">
                    <strong>Confidence:</strong>
                    <span className="font-medium capitalize px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full dark:bg-slate-600 dark:text-slate-200">{score_confidence}</span>
                </div>
            )}
            {formattedDate && (
                <div className="flex items-center gap-1.5">
                    <strong className="font-semibold">Updated:</strong>
                    <span className="font-semibold">{formattedDate}</span>
                </div>
            )}
        </div>
      </div>

      {/* Collapsible Details */}
      <div className="space-y-2 pt-2">
        <CollapsibleSection title="Overall Summary" icon={<SparklesIcon />}>
          <p className="whitespace-pre-line prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
              {justification?.overall_summary ?? 'No overall summary provided.'}
          </p>
        </CollapsibleSection>
        <CollapsibleSection title="Environmental Summary" icon={<DocumentTextIcon />}>
          <p className="whitespace-pre-line prose prose-sm text-slate-600 max-w-none dark:text-slate-300">{justification?.environmental_summary ?? 'No environmental summary provided.'}</p>
        </CollapsibleSection>
        <CollapsibleSection title="Social Summary" icon={<DocumentTextIcon />}>
          <p className="whitespace-pre-line prose prose-sm text-slate-600 max-w-none dark:text-slate-300">{justification?.social_summary ?? 'No social summary provided.'}</p>
        </CollapsibleSection>
        <CollapsibleSection title="Governance Summary" icon={<DocumentTextIcon />}>
          <p className="whitespace-pre-line prose prose-sm text-slate-600 max-w-none dark:text-slate-300">{justification?.governance_summary ?? 'No governance summary provided.'}</p>
        </CollapsibleSection>

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