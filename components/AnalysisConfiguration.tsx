import React, { useState } from 'react';
import { AnalysisCacheItem, CACHE_TTL_MS } from '../App';
import { DatabaseIcon, LeafIcon, GlobeAltIcon, NewspaperIcon, UserGroupIcon, TrophyIcon, BuildingOfficeIcon, CalendarDaysIcon, PlayCircleIcon, ChatBubbleLeftRightIcon } from './IconComponents';

export type AgentKey = 'esg' | 'macro' | 'news' | 'leadership' | 'competitive' | 'sector' | 'calendar' | 'sentiment';

interface AgentConfig {
    key: AgentKey;
    name: string;
    description: string;
    icon: React.ReactNode;
}

export const agentConfigurations: AgentConfig[] = [
    { key: 'esg', name: 'ESG Profile', description: 'Environmental, Social, and Governance factors.', icon: <LeafIcon className="h-6 w-6 text-green-500" /> },
    { key: 'macro', name: 'Macro Trends', description: 'Broad economic factors affecting the market.', icon: <GlobeAltIcon className="h-6 w-6 text-sky-500" /> },
    { key: 'news', name: 'Recent News', description: 'Latest news and sentiment analysis.', icon: <NewspaperIcon className="h-6 w-6 text-blue-500" /> },
    { key: 'leadership', name: 'Leadership Team', description: 'Analysis of the executive team and board.', icon: <UserGroupIcon className="h-6 w-6 text-purple-500" /> },
    { key: 'competitive', name: 'Competition', description: 'Competitive landscape and rival analysis.', icon: <TrophyIcon className="h-6 w-6 text-amber-500" /> },
    { key: 'sector', name: 'Sector Outlook', description: 'Tailwinds and headwinds for the industry.', icon: <BuildingOfficeIcon className="h-6 w-6 text-indigo-500" /> },
    { key: 'calendar', name: 'Corp. Calendar', description: 'Upcoming corporate events and dates.', icon: <CalendarDaysIcon className="h-6 w-6 text-rose-500" /> },
    { key: 'sentiment', name: 'Market Sentiment', description: 'Analysis of market sentiment and major holders.', icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-teal-500" /> }
];

const allAgentsEnabled = agentConfigurations.reduce((acc, agent) => {
    acc[agent.key] = true;
    return acc;
}, {} as Record<AgentKey, boolean>);

interface AnalysisConfigurationProps {
    stockSymbol: string;
    analysisCache: Record<string, AnalysisCacheItem>;
    onRunAnalysis: (enabledAgents: Record<AgentKey, boolean>) => void;
    onCancel: () => void;
}

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
    >
        <span
            aria-hidden="true"
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

export const AnalysisConfiguration: React.FC<AnalysisConfigurationProps> = ({ stockSymbol, analysisCache, onRunAnalysis, onCancel }) => {
    const [enabledAgents, setEnabledAgents] = useState<Record<AgentKey, boolean>>(allAgentsEnabled);

    const handleToggle = (key: AgentKey) => {
        setEnabledAgents(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const cacheStatus = (stockSymbol: string): 'Fresh' | 'Stale' => {
        const cachedItem = analysisCache[stockSymbol];
        if (!cachedItem || (Date.now() - cachedItem.timestamp > CACHE_TTL_MS)) {
            return 'Stale';
        }
        return 'Fresh';
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-50">
                    Analysis Configuration
                </h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                    Select agents to run for <span className="font-bold text-blue-600 dark:text-blue-500">{stockSymbol}</span>.
                </p>
            </div>

            <div className="space-y-3">
                {agentConfigurations.map(agent => (
                    <div key={agent.key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700 gap-4">
                        <div className="flex items-center gap-4">
                            {agent.icon}
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{agent.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{agent.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 self-end sm:self-center">
                            <div className="flex items-center gap-2 text-sm">
                                <DatabaseIcon className="h-4 w-4 text-slate-400" />
                                {cacheStatus(stockSymbol) === 'Fresh' ? (
                                    <span className="font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full text-xs">Fresh</span>
                                ) : (
                                    <span className="font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-full text-xs">Stale</span>
                                )}
                            </div>
                            <ToggleSwitch enabled={enabledAgents[agent.key]} onChange={() => handleToggle(agent.key)} />
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
                <button
                    onClick={onCancel}
                    className="h-11 px-6 bg-white border border-gray-300 rounded-md text-slate-700 font-semibold hover:bg-gray-50 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onRunAnalysis(enabledAgents)}
                    className="flex items-center justify-center gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors duration-200"
                >
                    <PlayCircleIcon className="h-5 w-5" />
                    Run Analysis
                </button>
            </div>
        </div>
    );
};