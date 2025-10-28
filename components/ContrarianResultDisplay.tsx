import React from 'react';
import { ContrarianAnalysis } from '../types';
import { ShieldExclamationIcon } from './IconComponents';

export const ContrarianResultDisplay: React.FC<{ result: ContrarianAnalysis }> = ({ result }) => {
    return (
        <div className="animate-fade-in space-y-4">
             <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Contrarian Case ("Red Team")</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Challenges the consensus view and identifies overlooked risks.</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-500/30">
                <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">Bear Case Summary</h4>
                <p className="prose prose-sm max-w-none text-red-900/80 dark:text-red-200/90">{result.bear_case_summary}</p>
            </div>
             <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Key Contrarian Points</h4>
                <ul className="space-y-2">
                    {result.key_contrarian_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <ShieldExclamationIcon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
