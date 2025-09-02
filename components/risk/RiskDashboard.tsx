import React from 'react';
import { RiskAnalysis } from '../../types';
import { RiskGauge } from './RiskGauge';
import { ExclamationTriangleIcon } from '../IconComponents';

interface RiskDashboardProps {
    analysis: RiskAnalysis;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({ analysis }) => {
    if (!analysis) return null;

    const { risk_score, risk_level, summary, key_risk_factors } = analysis;

    return (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl dark:bg-slate-800/50 dark:border-slate-700/60 animate-fade-in">
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">Consolidated Risk Dashboard</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1">
                    <RiskGauge score={risk_score} level={risk_level} />
                </div>
                <div className="md:col-span-2">
                    <p className="text-sm text-slate-700 mb-4 dark:text-slate-300">
                         <span className="font-bold text-red-600 dark:text-red-400">Risk Summary:</span> {summary}
                    </p>
                    
                    <h5 className="font-semibold text-slate-800 text-sm mb-2 dark:text-slate-200">Key Risk Factors Identified:</h5>
                    <ul className="space-y-2">
                        {key_risk_factors.map((factor, index) => (
                             <li key={index} className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">{factor}</span>
                             </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};