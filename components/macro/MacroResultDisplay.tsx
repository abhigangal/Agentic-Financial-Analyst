import React from 'react';
import { MacroAnalysis } from '../../types';
import { LinkIcon, DocumentTextIcon } from '../IconComponents';
import { CollapsibleSection } from '../CollapsibleSection';
import { Tooltip } from '../Tooltip';

interface MacroResultDisplayProps {
  result: MacroAnalysis;
}

const Indicator: React.FC<{ title: string; value: string; naReason?: string; }> = ({ title, value, naReason }) => (
    <div className="flex-1 text-center bg-gray-100/80 border border-gray-200/80 p-3 rounded-lg flex flex-col justify-center dark:bg-slate-700/50 dark:border-slate-600">
        <p className="text-xs text-slate-500 mb-1 dark:text-slate-400">{title}</p>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{value || 'N/A'}</p>
        {value === 'N/A' && naReason && (
            <Tooltip text={naReason}>
                 <p className="text-xs text-blue-600 hover:text-blue-500 mt-1 cursor-help underline decoration-dotted dark:text-blue-400 dark:hover:text-blue-300">(Why?)</p>
            </Tooltip>
        )}
    </div>
);

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


export const MacroResultDisplay: React.FC<MacroResultDisplayProps> = ({ result }) => {
  const { gdp_growth, inflation_rate, interest_rate, outlook_summary, sector_impact, sources, last_updated, confidence_level, sector_clarity, na_justifications } = result;

  const formattedDate = formatDate(last_updated);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Key Indicators Dashboard */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Indicator title="GDP Growth" value={gdp_growth} naReason={na_justifications?.['gdp_growth']} />
        <Indicator title="Inflation (CPI)" value={inflation_rate} naReason={na_justifications?.['inflation_rate']} />
        <Indicator title="Interest Rate" value={interest_rate} naReason={na_justifications?.['interest_rate']} />
      </div>

       <div className="flex justify-center flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 py-2">
            {confidence_level && (
                <Tooltip text="Our level of confidence in the macroeconomic analysis, based on data availability.">
                    <div className="flex items-center gap-1.5 cursor-help">
                        <strong>Confidence:</strong>
                        <span className="font-medium capitalize px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full dark:bg-slate-600 dark:text-slate-200">{confidence_level}</span>
                    </div>
                </Tooltip>
            )}
            {sector_clarity && (
                <Tooltip text="How clearly the macroeconomic trends translate into a specific impact on the company's sector.">
                    <div className="flex items-center gap-1.5 cursor-help">
                        <strong>Clarity:</strong>
                        <span className="font-medium capitalize px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full dark:bg-slate-600 dark:text-slate-200">{sector_clarity}</span>
                    </div>
                </Tooltip>
            )}
            {formattedDate && (
                <div className="flex items-center gap-1.5">
                    <strong>Updated:</strong>
                    <span className="font-medium">{formattedDate}</span>
                </div>
            )}
        </div>

      <div className="space-y-2">
        <CollapsibleSection title="Economic Outlook Summary" icon={<DocumentTextIcon />}>
          <p className="whitespace-pre-line prose prose-sm text-slate-600 max-w-none dark:text-slate-300">{outlook_summary}</p>
        </CollapsibleSection>
        <CollapsibleSection title="Sector Impact Analysis" icon={<DocumentTextIcon />}>
          <p className="whitespace-pre-line prose prose-sm text-slate-600 max-w-none dark:text-slate-300">{sector_impact}</p>
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