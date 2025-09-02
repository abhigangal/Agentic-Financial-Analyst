import React from 'react';
import { SparklesIcon } from './IconComponents';

interface NutshellSummaryProps {
    summary: string | null | undefined;
}

export const NutshellSummary: React.FC<NutshellSummaryProps> = ({ summary }) => {
    if (!summary) return null;

    return (
        <div className="my-6 p-5 bg-yellow-50/70 border border-yellow-200 rounded-xl dark:bg-yellow-900/20 dark:border-yellow-500/30 animate-fade-in-fast">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                     <SparklesIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-yellow-800 mb-1 dark:text-yellow-300">In a Nutshell</h3>
                    <p className="text-slate-700 whitespace-pre-line dark:text-slate-200 text-base">{summary}</p>
                </div>
            </div>
        </div>
    );
};
