import React, { useState, ReactNode } from 'react';
import { ChevronDownIcon } from './IconComponents';

interface CollapsibleSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  uniqueKey?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, uniqueKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const keyPart = (uniqueKey || title).replace(/\s+/g, '-').toLowerCase();
  const contentId = `collapsible-content-${keyPart}`;
  const testId = `collapsible-${keyPart}`;

  return (
    <div className="border border-gray-200/80 rounded-lg bg-white/50 transition-all duration-300 hover:border-gray-300 dark:border-slate-700/80 dark:bg-slate-800/50 dark:hover:border-slate-600" data-test={testId}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left transition-colors rounded-t-lg hover:bg-gray-100/50 dark:hover:bg-slate-700/50"
        aria-expanded={isOpen}
        aria-controls={contentId}
        data-test={`${testId}-toggle`}
      >
        <div className="flex items-center">
          <span className="mr-3 text-blue-500 dark:text-blue-400">{icon}</span>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={contentId}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[20000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-4 pt-0">
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                 {children}
            </div>
        </div>
      </div>
    </div>
  );
};
