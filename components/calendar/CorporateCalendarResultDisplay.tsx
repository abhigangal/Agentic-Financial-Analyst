import React from 'react';
import { CorporateCalendarAnalysis } from '../../types';
import { LinkIcon, InformationCircleIcon } from '../IconComponents';
import { CollapsibleSection } from '../CollapsibleSection';
import { Tooltip } from '../Tooltip';

interface CorporateCalendarResultDisplayProps {
  result: CorporateCalendarAnalysis;
}

const EventItem: React.FC<{ title: string; value: string | null; naReason?: string; }> = ({ title, value, naReason }) => (
    <div className="flex-1 text-center bg-gray-100/80 border border-gray-200/80 p-3 rounded-lg flex flex-col justify-center dark:bg-slate-700/50 dark:border-slate-600 min-h-[80px]">
        <p className="text-xs text-slate-500 mb-1 dark:text-slate-400">{title}</p>
        <p className="text-base font-bold text-slate-800 dark:text-slate-100">{value || 'N/A'}</p>
        {!value && naReason && (
            <Tooltip text={naReason}>
                 <p className="text-xs text-blue-600 hover:text-blue-500 mt-1 cursor-help underline decoration-dotted dark:text-blue-400 dark:hover:text-blue-300">(Why?)</p>
            </Tooltip>
        )}
    </div>
);


export const CorporateCalendarResultDisplay: React.FC<CorporateCalendarResultDisplayProps> = ({ result }) => {
  const { next_earnings_date, dividend_ex_date, analyst_day_date, summary, sources, na_justifications } = result;

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Corporate Calendar</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Key upcoming dates and events for the company.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <EventItem title="Next Earnings" value={next_earnings_date} naReason={na_justifications?.['next_earnings_date']} />
        <EventItem title="Ex-Dividend Date" value={dividend_ex_date} naReason={na_justifications?.['dividend_ex_date']} />
        <EventItem title="Analyst/Investor Day" value={analyst_day_date} naReason={na_justifications?.['analyst_day_date']} />
      </div>

      <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300 pt-2">
          <p>{summary}</p>
      </div>

      <div className="space-y-2 pt-2">
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