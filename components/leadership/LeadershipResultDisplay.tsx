import React from 'react';
import { LeadershipAnalysis } from '../../types';
import { UserGroupIcon, StarIcon, CheckCircleIcon, InformationCircleIcon } from '../IconComponents';
import { CollapsibleSection } from '../CollapsibleSection';

interface LeadershipResultDisplayProps {
  result: LeadershipAnalysis;
}

const assessmentColors: {[key: string]: string} = {
    'Strong': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
    'Average': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
    'Weak': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
    'N/A': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600',
};

const StarRating = ({ rating }: { rating?: number }) => {
    if (rating === undefined || rating === null || rating < 1 || rating > 5) return null;
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
            ))}
        </div>
    );
};

export const LeadershipResultDisplay: React.FC<LeadershipResultDisplayProps> = ({ result }) => {
  const { overall_assessment, summary, key_executives, leadership_recently_changed } = result;
  
  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Leadership Analysis</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Evaluates executive team strength and stability.</p>

        <div className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-200/80 rounded-lg dark:bg-slate-700/50 dark:border-slate-600/80">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Overall Assessment</span>
            <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${assessmentColors[overall_assessment] || assessmentColors['N/A']}`}>
                {overall_assessment}
            </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-2 justify-center">
            <div className="flex items-center gap-1.5">
                {leadership_recently_changed ? <InformationCircleIcon className="h-4 w-4 text-orange-500 dark:text-orange-400" /> : <CheckCircleIcon className="h-4 w-4 text-green-500 dark:text-green-400" />}
                <span>{leadership_recently_changed ? 'Recent Changes' : 'Stable Team'}</span>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
          <p>{summary}</p>
        </div>
        
        {key_executives && key_executives.length > 0 && (
          <CollapsibleSection title={`Key Executives (${key_executives.length})`} icon={<UserGroupIcon />}>
            <div className="space-y-3">
                {key_executives.map((exec, index) => (
                    <div key={index} className="p-3 bg-white border border-gray-200/80 rounded-lg dark:bg-slate-700/50 dark:border-slate-600/80">
                        <div className="flex justify-between items-start gap-2">
                           <div>
                               <p className="font-semibold text-slate-800 text-sm leading-tight dark:text-slate-100">{exec.name}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">{exec.role}</p>
                           </div>
                           {exec.tenure && (
                                <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 shrink-0 dark:bg-slate-600 dark:text-slate-300 dark:border-slate-500">
                                   {exec.tenure}
                               </span>
                           )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                             <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Impact Rating:</p>
                             <StarRating rating={exec.impact_rating} />
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-2 border-t border-gray-100 dark:border-slate-600/50 pt-2">
                            <p className="whitespace-pre-line">{exec.summary}</p>
                        </div>
                    </div>
                ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
};