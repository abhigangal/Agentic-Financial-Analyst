import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, SparklesIcon, SpinnerIcon } from './IconComponents';
import { AgentKey, agentConfigurations } from './AnalysisConfiguration';

type AnalysisPhase = 'IDLE' | 'PLANNING' | 'GATHERING' | 'CALCULATING' | 'VERIFYING' | 'DRAFTING' | 'DEBATING' | 'REFINING' | 'FINALIZING' | 'COMPLETE' | 'ERROR';

interface AgentStatus {
    isLoading: boolean;
    error: string | null;
}

interface FinancialAdvisorLoaderProps {
    stockSymbol: string;
    analysisPhase: AnalysisPhase;
    agentStatuses: Record<string, AgentStatus>;
    enabledAgents: Record<AgentKey, boolean> | null;
}

const mainPhases: { key: AnalysisPhase, text: string }[] = [
    { key: 'PLANNING', text: 'Generating Analysis Plan' },
    { key: 'GATHERING', text: 'Gathering Intelligence & Extracting Data' },
    { key: 'CALCULATING', text: 'Calculating & Verifying Metrics' },
    { key: 'DRAFTING', text: 'Synthesizing Draft Report' },
    { key: 'DEBATING', text: 'Debating & Self-Correction' },
    { key: 'FINALIZING', text: 'Finalizing Aligned Recommendation' },
];

const phaseOrder: Record<AnalysisPhase, number> = {
    IDLE: 0,
    PLANNING: 1,
    GATHERING: 2,
    CALCULATING: 3,
    VERIFYING: 3, // Part of the same visual step
    DRAFTING: 4,
    DEBATING: 5,
    REFINING: 5, // Part of the same visual step
    FINALIZING: 6,
    COMPLETE: 7,
    ERROR: 7,
};

const AgentStatusPill: React.FC<{ status: AgentStatus }> = ({ status }) => {
    if (status.isLoading) {
        return <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400"><SpinnerIcon className="h-4 w-4" /> Analyzing...</div>;
    }
    if (status.error) {
        return <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400"><ExclamationTriangleIcon className="h-4 w-4" /> Error</div>;
    }
    return <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400"><CheckCircleIcon className="h-4 w-4" /> Complete</div>;
};


export const FinancialAdvisorLoader: React.FC<FinancialAdvisorLoaderProps> = ({ stockSymbol, analysisPhase, agentStatuses, enabledAgents }) => {
    const currentPhaseIndex = phaseOrder[analysisPhase];
    const gatheringAgents = agentConfigurations.filter(agent => enabledAgents?.[agent.key]);

    return (
        <div className="flex flex-col items-center justify-center py-6 animate-fade-in" aria-label={`Analyzing ${stockSymbol}...`}>
            <div className="w-full max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        <span className="text-blue-600 dark:text-blue-500">Agentic Workflow</span> in Progress...
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        AI agents are collaborating to analyze <span className="font-semibold text-slate-700 dark:text-slate-200">{stockSymbol}</span>.
                    </p>
                </div>
                
                <div className="space-y-2">
                    {mainPhases.map((phase, index) => {
                        const phaseIndex = index + 1;
                        const isComplete = currentPhaseIndex > phaseIndex;
                        const isActive = currentPhaseIndex === phaseIndex;
                        const isGatheringAndActive = phase.key === 'GATHERING' && isActive;

                        return (
                            <div key={phase.key} className={`p-4 rounded-lg transition-all duration-500 ease-in-out border ${isActive ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30' : 'bg-gray-50 dark:bg-slate-800/50 border-transparent'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 transition-all duration-300">
                                        {isComplete ? (
                                            <CheckCircleIcon className="h-6 w-6 text-green-500"/>
                                        ) : isActive ? (
                                            <SpinnerIcon className="h-6 w-6 text-blue-500"/>
                                        ) : (
                                            <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-slate-700 border-4 border-gray-50 dark:border-slate-800/50"/>
                                        )}
                                    </div>
                                    <span className={`font-semibold transition-colors ${isActive ? 'text-blue-700 dark:text-blue-300' : isComplete ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                        Phase {phaseIndex}: {phase.text}
                                    </span>
                                </div>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isGatheringAndActive ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>
                                     <div className="pl-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {gatheringAgents.map(agent => (
                                            <div key={agent.key} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-gray-200 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-shrink-0">{agent.icon}</div>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{agent.name}</span>
                                                </div>
                                                <AgentStatusPill status={agentStatuses[agent.key]} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {analysisPhase === 'ERROR' && (
                    <div className="mt-6 flex items-center gap-4 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30">
                         <ExclamationTriangleIcon className="h-6 w-6 text-red-500"/>
                         <span className="font-semibold text-red-700 dark:text-red-300">
                            An error occurred during the analysis. Check tabs for details.
                         </span>
                    </div>
                )}
            </div>
        </div>
    );
};