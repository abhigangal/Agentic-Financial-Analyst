import React from 'react';
import { EsgAnalysis } from '../../types';
import { Tooltip } from '../Tooltip';

type EsgScore = EsgAnalysis['score'];

const esgConfig = [
    { score: 'CCC', color: 'bg-red-300' },
    { score: 'B', color: 'bg-orange-300' },
    { score: 'BB', color: 'bg-yellow-300' },
    { score: 'BBB', color: 'bg-lime-300' },
    { score: 'A', color: 'bg-green-300' },
    { score: 'AA', color: 'bg-teal-300' },
    { score: 'AAA', color: 'bg-sky-300' }
];

interface EsgGaugeProps {
    score: EsgScore;
    naReason?: string;
}

export const EsgGauge: React.FC<EsgGaugeProps> = ({ score, naReason }) => {
    const scoreIndex = esgConfig.findIndex(s => s.score === score);
    if (score === 'N/A' || scoreIndex === -1) {
        return (
            <div className="w-full my-4 text-center">
                <div className="h-4 rounded-full bg-gray-200 border border-gray-300 dark:bg-slate-700 dark:border-slate-600"></div>
                 <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-2">N/A</p>
                 {naReason ? (
                    <Tooltip text={naReason}>
                        <p className="text-xs text-blue-600 hover:text-blue-500 cursor-help underline decoration-dotted dark:text-blue-400 dark:hover:text-blue-300">(Why?)</p>
                    </Tooltip>
                 ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No score available</p>
                 )}
            </div>
        )
    }

    const percentage = (scoreIndex + 0.5) / esgConfig.length * 100;

    return (
        <div className="w-full my-4">
             <div className="relative w-full">
                <div className="flex h-4 rounded-full overflow-hidden border border-gray-200 dark:border-slate-700">
                    {esgConfig.map((segment, index) => (
                        <div key={index} style={{width: `${100/esgConfig.length}%`}} className={`${segment.color}`}></div>
                    ))}
                </div>
                 {scoreIndex !== -1 && (
                    <div 
                        className="absolute -top-5 transform -translate-x-1/2 transition-all duration-500"
                        style={{ left: `${percentage}%` }}
                    >
                        <div className="relative">
                            <span className="text-sm font-bold text-slate-800 px-2 py-1 bg-white border border-gray-300 rounded-md shadow dark:bg-slate-700 dark:text-slate-100 dark:border-slate-500">
                                {score}
                            </span>
                            <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-white border-b border-r border-gray-300 transform -translate-x-1/2 rotate-45 dark:bg-slate-700 dark:border-b-slate-500 dark:border-r-slate-500"></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1.5 px-1">
                <span>Laggard</span>
                <span>Leader</span>
            </div>
        </div>
    );
};