import React from 'react';
import { TechnicalAnalysis } from '../types';

export const TechnicalResultDisplay: React.FC<{ result: TechnicalAnalysis }> = ({ result }) => {
    return (
        <div className="animate-fade-in space-y-4">
             <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Technical Analysis</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Chart patterns, indicators, and key price levels.</p>
            </div>
             <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
                <p>{result.summary}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="text-center bg-gray-100/80 border border-gray-200/80 p-3 rounded-lg dark:bg-slate-700/50 dark:border-slate-600">
                    <p className="text-xs text-slate-500 mb-1 dark:text-slate-400">Trend</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{result.trend}</p>
                </div>
                 <div className="text-center bg-gray-100/80 border border-gray-200/80 p-3 rounded-lg dark:bg-slate-700/50 dark:border-slate-600">
                    <p className="text-xs text-slate-500 mb-1 dark:text-slate-400">Support</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{result.support_level}</p>
                </div>
                 <div className="text-center bg-gray-100/80 border border-gray-200/80 p-3 rounded-lg dark:bg-slate-700/50 dark:border-slate-600">
                    <p className="text-xs text-slate-500 mb-1 dark:text-slate-400">Resistance</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{result.resistance_level}</p>
                </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-500/30">
                <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-1">Moving Averages</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200">{result.moving_averages_summary}</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-500/30">
                <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-1">Indicators (RSI, MACD)</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200">{result.indicators_summary}</p>
            </div>
        </div>
    );
};
