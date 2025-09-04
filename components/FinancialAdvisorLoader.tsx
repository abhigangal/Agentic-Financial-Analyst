import React, { useMemo } from 'react';
import { AnalysisPhase } from '../../App';
import { AgentKey, agentConfigurations } from './AnalysisConfiguration';
import { CheckCircleIcon, ExclamationTriangleIcon, SpinnerIcon, DatabaseIcon, FinancialAdvisorIcon } from './IconComponents';
import { ExecutionStep } from '../../types';

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
}

const mainPhases: { key: AnalysisPhase, text: string }[] = [
    { key: 'PLANNING', text: 'Planning' },
    { key: 'GATHERING', text: 'Gathering' },
    { key: 'DRAFTING', text: 'Synthesizing' },
    { key: 'DEBATING', text: 'Debating' },
    { key: 'FINALIZING', text: 'Finalizing' },
];

const phaseOrder: Record<AnalysisPhase, number> = {
    IDLE: 0, PLANNING: 1, GATHERING: 2, CALCULATING: 2.5, VERIFYING: 2.8,
    DRAFTING: 3, DEBATING: 4, REFINING: 4.5, FINALIZING: 5, COMPLETE: 6, ERROR: 6, PAUSED: 6
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
    const currentPhaseProgress = phaseOrder[analysisPhase];

    const currentStatusText = useMemo(() => {
        const runningStep = executionLog.find(s => s.status === 'running');
        if (runningStep) return `Status: ${runningStep.stepName}...`;
        if (analysisPhase === 'COMPLETE') return 'Status: Analysis Complete!';
        if (analysisPhase === 'ERROR' || analysisPhase === 'PAUSED') return 'Status: Analysis Halted.';
        return 'Status: Initializing...';
    }, [executionLog, analysisPhase]);

    const activeAgents = useMemo(() => {
        const baseAgents = agentConfigurations.filter(agent => enabledAgents?.[agent.key]);
        const dataExtractor = { key: 'data_extractor', name: 'Financial Data', icon: <DatabaseIcon className="h-6 w-6 text-gray-500" /> };
        return [...baseAgents, dataExtractor];
    }, [enabledAgents]);
    
    const nodeRadius = 30;
    const orbitRadius = 130;
    const svgSize = 320;
    const center = svgSize / 2;
    
    const isCentralNodeActive = ['PLANNING', 'DRAFTING', 'FINALIZING', 'DEBATING', 'REFINING', 'CALCULATING', 'VERIFYING'].includes(analysisPhase);

    const nodes = useMemo(() => {
        return activeAgents.map((agent, i) => {
            const angle = (i / activeAgents.length) * 2 * Math.PI - Math.PI / 2;
            const cx = center + orbitRadius * Math.cos(angle);
            const cy = center + orbitRadius * Math.sin(angle);
            return { ...agent, cx, cy };
        });
    }, [activeAgents, center, orbitRadius]);


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
                    {mainPhases.map((phase) => (
                        <div key={phase.key} className="text-center text-xs text-slate-500 dark:text-slate-400 flex-1">
                            {phase.text}
                        </div>
                    ))}
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-slate-700 mt-1">
                     <div 
                        className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-in-out" 
                        style={{ width: `${(currentPhaseProgress / mainPhases.length) * 100}%` }}
                     />
                </div>
            </div>
            
            <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300 h-5 mb-6">{currentStatusText}</p>
            
            <div className="relative flex justify-center items-center" style={{ height: `${svgSize}px` }}>
                <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="overflow-visible">
                    {/* Lines */}
                    {nodes.map(node => {
                        const status = agentStatuses[node.key as string];
                        const isComplete = status && !status.isLoading && !status.error;
                        return (
                            <g key={`line-${node.key}`}>
                                <path 
                                    d={`M ${center} ${center} L ${node.cx} ${node.cy}`} 
                                    className={isComplete ? "stroke-green-400/50" : "stroke-slate-200 dark:stroke-slate-700"}
                                    strokeWidth="1.5" 
                                />
                                {isComplete && (
                                     <path 
                                        d={`M ${node.cx} ${node.cy} L ${center} ${center}`} 
                                        className="stroke-green-400 animate-shimmer" 
                                        strokeWidth="2" 
                                        strokeDasharray="10 20"
                                    />
                                )}
                            </g>
                        );
                    })}
                    
                    {/* Agent Nodes */}
                    {nodes.map(node => {
                        const status = agentStatuses[node.key as string];
                        const isLoading = status?.isLoading;
                        const isError = !!status?.error;
                        const isComplete = status && !isLoading && !isError;

                        let strokeColor = "stroke-slate-300 dark:stroke-slate-600";
                        if (isLoading) strokeColor = "stroke-blue-500";
                        else if (isError) strokeColor = "stroke-red-500";
                        else if (isComplete) strokeColor = "stroke-green-500";

                        return (
                            <g key={`node-${node.key}`} transform={`translate(${node.cx}, ${node.cy})`}>
                                <circle r={nodeRadius} className={`fill-white dark:fill-slate-800 ${strokeColor}`} strokeWidth="2" />
                                {isLoading && <circle r={nodeRadius} className={`fill-none ${strokeColor} animate-pulse-node`} strokeWidth="4" />}
                                <foreignObject x={-nodeRadius} y={-nodeRadius} width={nodeRadius*2} height={nodeRadius*2}>
                                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-1">
                                        <div className={`text-slate-600 dark:text-slate-300 ${isError && 'text-red-500'} ${isComplete && 'text-green-500'}`}>{node.icon}</div>
                                        <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 leading-tight mt-1">{node.name}</div>
                                    </div>
                                </foreignObject>
                            </g>
                        );
                    })}
                    
                    {/* Central Node */}
                     <g transform={`translate(${center}, ${center})`} className={isCentralNodeActive ? 'animate-pulse-central-node' : ''}>
                        <circle r={nodeRadius + 10} className="fill-blue-50 dark:fill-blue-900/30" />
                        <circle r={nodeRadius + 10} className="stroke-blue-200 dark:stroke-blue-500/50" strokeWidth="2" fill="none" />
                        <foreignObject x={-nodeRadius-10} y={-nodeRadius-10} width={(nodeRadius+10)*2} height={(nodeRadius+10)*2}>
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-1">
                                <div className="text-blue-600 dark:text-blue-400"><FinancialAdvisorIcon className="h-8 w-8"/></div>
                                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 leading-tight mt-1">Financial<br/>Analyst</div>
                            </div>
                        </foreignObject>
                    </g>
                </svg>
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