import React, { ReactNode } from 'react';
import { Loader } from './Loader';

interface SidekickAgentCardProps {
    title: string;
    icon: ReactNode;
    isLoading: boolean;
    error: string | null;
    children: ReactNode;
}

export const SidekickAgentCard: React.FC<SidekickAgentCardProps> = ({ title, icon, isLoading, error, children }) => {
    const status = isLoading ? 'Analyzing...' : (error ? 'Error' : 'Complete');

    const statusColors = {
        'Analyzing...': 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
        'Complete': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        'Error': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    };

    return (
        <div className="border border-gray-200/80 rounded-lg bg-white/50 dark:border-slate-700/80 dark:bg-slate-800/50">
            <div className="w-full flex justify-between items-center p-4 text-left border-b border-gray-200/80 dark:border-slate-700/80">
                <div className="flex items-center">
                    <span className="mr-3 text-blue-500 dark:text-blue-400">{icon}</span>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[status]}`}>
                        {status}
                    </span>
                </div>
            </div>
            <div className="p-4">
                {isLoading && <Loader message={`Analyzing ${title}...`} />}
                {error && (
                    <div className="h-full flex flex-col items-center justify-center p-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center max-w-sm dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-300">
                        <p className="font-bold">{title} Failed</p>
                        <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}
                {!isLoading && !error && children}
            </div>
        </div>
    );
};