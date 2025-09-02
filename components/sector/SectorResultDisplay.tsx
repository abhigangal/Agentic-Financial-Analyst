import React from 'react';
import { SectorAnalysis } from '../../types';
import { LinkIcon, DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../IconComponents';
import { CollapsibleSection } from '../CollapsibleSection';

interface SectorResultDisplayProps {
  result: SectorAnalysis;
}

const outlookColors: {[key: string]: string} = {
    'Positive': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
    'Neutral': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600',
    'Negative': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
    'N/A': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600',
};

export const SectorResultDisplay: React.FC<SectorResultDisplayProps> = ({ result }) => {
  const { sector_outlook, summary, key_drivers, key_risks, sources } = result;
  
  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Sector Outlook</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Analyzes the health and trends of the company's industry.</p>
        
        <div className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-200/80 rounded-lg dark:bg-slate-700/50 dark:border-slate-600/80">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Overall Sector Outlook</span>
            <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${outlookColors[sector_outlook] || outlookColors['N/A']}`}>
                {sector_outlook}
            </span>
        </div>
      </div>
      
      <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
        <p>{summary}</p>
      </div>

      <div className="space-y-3 pt-2">
        {key_drivers && key_drivers.length > 0 && (
          <CollapsibleSection title={`Key Drivers (Tailwinds)`} icon={<CheckCircleIcon className="text-green-500"/>}>
            <ul className="space-y-2">
                {key_drivers.map((item, index) => (
                     <li key={index} className="flex items-start gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                     </li>
                ))}
            </ul>
          </CollapsibleSection>
        )}

        {key_risks && key_risks.length > 0 && (
          <CollapsibleSection title={`Key Risks (Headwinds)`} icon={<ExclamationTriangleIcon className="text-red-500" />}>
            <ul className="space-y-2">
              {key_risks.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
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