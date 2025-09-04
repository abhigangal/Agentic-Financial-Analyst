import React, { useMemo } from 'react';
import { AnalysisPhase } from '../../App';
import { AgentKey, agentConfigurations } from './AnalysisConfiguration';
import { CheckCircleIcon, ExclamationTriangleIcon, SpinnerIcon, DatabaseIcon } from './IconComponents';
import { EsgAnalysis, MacroAnalysis, NewsAnalysis, LeadershipAnalysis, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, MarketSentimentAnalysis, ExecutionStep } from '../../types';

interface AgentStatus {
    isLoading: boolean;
    error: string | null;
}

interface FinancialAdvisorLoaderProps {
    stockSymbol: string;
    analysisPhase: AnalysisPhase;
    agentStatuses: Record<string, AgentStatus>;
    enabledAgents: Record<AgentKey, boolean> | null;
    executionLog: ExecutionStep[];
    esgAnalysis: EsgAnalysis | null;
    macroAnalysis: MacroAnalysis | null;
    newsAnalysis: NewsAnalysis | null;
    leadershipAnalysis: LeadershipAnalysis | null;
    competitiveAnalysis: CompetitiveAnalysis | null;
    sectorAnalysis: SectorAnalysis | null;
    corporateCalendarAnalysis: CorporateCalendarAnalysis | null;
    marketSentimentAnalysis: MarketSentimentAnalysis | null;
}

const mainPhases: { key: AnalysisPhase, text: string }[] = [
    { key: 'PLANNING', text: 'Planning' },
    { key: 'GATHERING', text: 'Gathering' },
    { key: 'CALCULATING', text: 'Calculating' },
    { key: 'DRAFTING', text: 'Drafting' },
    { key: 'DEBATING', text: 'Debating' },
    { key: 'FINALIZING', text: 'Finalizing' },
];

const phaseOrder: Record<AnalysisPhase, number> = {
    IDLE: 0, PLANNING: 1, GATHERING: 2, CALCULATING: 3, VERIFYING: 3,
    DRAFTING: 4, DEBATING: 5, REFINING: 5, FINALIZING: 6, COMPLETE: 7, ERROR: 7, PAUSED: 7
};

const getResultSummary = (agentKey: AgentKey, result: any): React.ReactNode => {
    if (!result) return 'Processing...';
    try {
        switch (agentKey) {
            case 'esg': return <><span className="font-bold">{result.score}</span> ({result.esg_momentum})</>;
            case 'macro': return <>GDP: <span className="font-bold">{result.gdp_growth}</span></>;
            case 'news': return <>Sentiment: <span className="font-bold">{result.overall_sentiment}</span></>;
            case 'leadership': return <>Assessment: <span className="font-bold">{result.overall_assessment}</span></>;
            case 'competitive': return <>Leader: <span className="font-bold">{result.market_leader}</span></>;
            case 'sector': return <>Outlook: <span className="font-bold">{result.sector_outlook}</span></>;
            case 'calendar': return <>Next Earnings: <span className="font-bold">{result.next_earnings_date || 'N/A'}</span></>;
            case 'sentiment': return <>Sentiment: <span className="font-bold">{result.overall_sentiment}</span></>;
            default: return 'Data Processed';
        }
    } catch (e) { return 'Data Processed'; }
};


const AgentProgressCard: React.FC<{
    agentConfig: (typeof agentConfigurations)[0] | { key: 'data_extractor', name: 'Financial Data', icon: React.ReactNode },
    status: AgentStatus,
    result: any
}> = ({ agentConfig, status, result }) => {
    const summary = status.isLoading ? 'Analyzing...' : (status.error ? 'Error' : getResultSummary(agentConfig.key as AgentKey, result));
    const isComplete = !status.isLoading && !status.error;

    return (
        <div className="flex flex-col p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-all duration-300 animate-slide-in-bottom">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{agentConfig.icon}</div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{agentConfig.name}</span>
                </div>
                {status.isLoading && <SpinnerIcon className="h-5 w-5 text-blue-500" />}
                {status.error && <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />}
                {isComplete && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
            </div>
            {isComplete && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700/50 text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400 animate-fade-in">{summary}</p>
                </div>
            )}
        </div>
    );
};

const LiveLog: React.FC<{ log: ExecutionStep[] }> = ({ log }) => {
    const lastThree = log.slice(-3);
    return (
        <div className="mt-6 w-full max-w-2xl mx-auto p-4 bg-gray-100/50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700/50">
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 text-center tracking-wider uppercase">Live Activity Log</h4>
            <div className="space-y-2">
                {lastThree.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 animate-slide-in-bottom" style={{ animationDelay: `${index * 100}ms`}}>
                        <span className="font-mono text-slate-400 dark:text-slate-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{step.agentKey.toUpperCase()}:</span>
                        <span>{step.stepName}</span>
                        <span className={`ml-auto font-bold ${step.status === 'running' ? 'text-blue-500' : step.status === 'complete' ? 'text-green-500' : 'text-red-500'}`}>
                            [{step.status.toUpperCase()}]
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const FinancialAdvisorLoader: React.FC<FinancialAdvisorLoaderProps> = (props) => {
    const { stockSymbol, analysisPhase, agentStatuses, enabledAgents, executionLog } = props;
    const currentPhaseIndex = phaseOrder[analysisPhase];

    const currentStatusText = useMemo(() => {
        const runningStep = executionLog.find(s => s.status === 'running');
        if (runningStep) return `Status: ${runningStep.stepName}...`;
        if (analysisPhase === 'COMPLETE') return 'Status: Analysis Complete!';
        if (analysisPhase === 'ERROR' || analysisPhase === 'PAUSED') return 'Status: Analysis Halted.';
        return 'Status: Initializing...';
    }, [executionLog, analysisPhase]);
    
    const isGatheringPhase = analysisPhase === 'GATHERING';
    const gatheringAgents = agentConfigurations.filter(agent => enabledAgents?.[agent.key]);

    const agentResults: Record<string, any> = {
        esg: props.esgAnalysis, macro: props.macroAnalysis, news: props.newsAnalysis,
        leadership: props.leadershipAnalysis, competitive: props.competitiveAnalysis,
        sector: props.sectorAnalysis, calendar: props.corporateCalendarAnalysis,
        sentiment: props.marketSentimentAnalysis,
    };

    return (
        <div className="py-6 animate-fade-in" aria-live="polite" aria-label={`Analyzing ${stockSymbol}...`}>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    <span className="text-blue-600 dark:text-blue-500">Agentic Workflow</span> in Progress...
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    AI agents are collaborating to analyze <span className="font-semibold text-slate-700 dark:text-slate-200">{stockSymbol}</span>.
                </p>
            </div>

            <div className="w-full max-w-2xl mx-auto mb-4">
                <div className="flex justify-between">
                    {mainPhases.map((phase, index) => (
                        <div key={phase.key} className="text-center text-xs text-slate-500 dark:text-slate-400 w-1/6">
                            {phase.text}
                        </div>
                    ))}
                </div>
                <div className="flex h-2.5 rounded-full bg-gray-200 dark:bg-slate-700 mt-1">
                    {mainPhases.map((phase, index) => {
                        const phaseIndex = index + 1;
                        const isComplete = currentPhaseIndex > phaseIndex;
                        const isActive = currentPhaseIndex === phaseIndex;
                        return (
                            <div key={phase.key} className="w-1/6 px-0.5">
                                <div className={`h-full rounded-full ${isActive || isComplete ? 'bg-blue-500' : ''}`}>
                                    {isActive && <div className="h-full rounded-full bg-blue-400 animate-pulse" />}
                                    {isComplete && !isActive && <div className="h-full rounded-full bg-blue-500 animate-fill-bar" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300 h-5 mb-6">{currentStatusText}</p>

            <div className={`transition-opacity duration-500 ${isGatheringPhase ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                <div className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {gatheringAgents.map(agent => (
                        <AgentProgressCard key={agent.key} agentConfig={agent} status={agentStatuses[agent.key]} result={agentResults[agent.key]} />
                    ))}
                    <AgentProgressCard
                        key="data_extractor"
                        agentConfig={{ key: 'data_extractor', name: 'Financial Data', icon: <DatabaseIcon className="h-6 w-6 text-gray-500" /> }}
                        status={agentStatuses.data_extractor}
                        result={null}
                    />
                </div>
            </div>
            
            <LiveLog log={executionLog} />

            {analysisPhase === 'PAUSED' && (
                <div className="mt-6 flex items-center justify-center gap-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-500/30 w-full max-w-2xl mx-auto">
                     <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500"/>
                     <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                        An agent failed. Please review the logs and retry.
                     </span>
                </div>
            )}
        </div>
    );
};