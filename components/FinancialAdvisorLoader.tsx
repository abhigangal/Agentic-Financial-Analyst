import React, { useMemo } from 'react';
import { AnalysisPhase } from '../../App';
import { ExecutionStep } from '../../types';
import { AgentKey } from '../types';
import { LeafIcon, GlobeAltIcon, NewspaperIcon, UserGroupIcon, TrophyIcon, BuildingOfficeIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, ManWalkingIcon, FinancialBuildingIcon, ScaleIcon, ShieldExclamationIcon } from './IconComponents';

// --- Scene Primitives ---

const SceneContainer: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`animate-scene-fade-in flex flex-col items-center justify-center text-center ${className} min-h-[200px]`}>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
        {children}
    </div>
);

// Reusable human-like agent figure for the Gathering scene
const AgentFigure: React.FC<{
    label: string;
    IconComponent: React.FC<{ className?: string }>;
    color: string;
    animationClass: string;
    animationDelay?: string;
}> = ({ label, IconComponent, color, animationClass, animationDelay }) => (
    <div
        className={`flex flex-col items-center gap-2 ${animationClass}`}
        style={{ animationDelay: animationDelay || '0s' }}
    >
        <div className="relative">
            <ManWalkingIcon className="h-12 w-12" style={{ color: color }} />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-700 border-2 rounded-full flex items-center justify-center" style={{ borderColor: color }}>
                <IconComponent className="h-3 w-3 text-white" />
            </div>
        </div>
        <span className="text-xs font-semibold text-slate-300">{label}</span>
    </div>
);

// FIX: Updated agent map to reflect the refactoring from news/sentiment/technical to market_intel.
const agentIconMap: Record<AgentKey, { icon: React.FC<{ className?: string }>, color: string, name: string }> = {
    esg: { icon: LeafIcon, color: '#22c55e', name: 'ESG' },
    macro: { icon: GlobeAltIcon, color: '#0ea5e9', name: 'Macro' },
    market_intel: { icon: NewspaperIcon, color: '#3b82f6', name: 'Market Intel' },
    leadership: { icon: UserGroupIcon, color: '#a855f7', name: 'Leadership' },
    competitive: { icon: TrophyIcon, color: '#f59e0b', name: 'Competition' },
    sector: { icon: BuildingOfficeIcon, color: '#6366f1', name: 'Sector' },
    calendar: { icon: CalendarDaysIcon, color: '#f43f5e', name: 'Calendar' },
    contrarian: { icon: ShieldExclamationIcon, color: '#ef4444', name: 'Contrarian' },
};

// --- Individual Scene Components ---

const PlanningScene = () => (
    <SceneContainer title="Planning Analysis">
        <div className="flex items-end gap-4">
            <div className="animate-agent-slide-in-left">
                <ManWalkingIcon className="h-20 w-20 text-blue-500" />
            </div>
            {/* Whiteboard */}
            <div className="w-48 h-32 bg-slate-700 border-2 border-slate-600 rounded-md p-2 animate-agent-slide-in-right">
                <div className="w-full h-1 bg-slate-500 rounded-full mb-2 animate-light-flicker" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3/4 h-1 bg-slate-500 rounded-full mb-2 animate-light-flicker" style={{animationDelay: '0.4s'}}></div>
                <div className="w-full h-1 bg-slate-500 rounded-full mb-2 animate-light-flicker" style={{animationDelay: '0.6s'}}></div>
                <div className="w-1/2 h-1 bg-slate-500 rounded-full animate-light-flicker" style={{animationDelay: '0.8s'}}></div>
            </div>
        </div>
    </SceneContainer>
);

const GatheringScene = () => (
    <SceneContainer title="Gathering Intel">
        <div className="w-full flex justify-center items-center gap-8">
            <AgentFigure
                label={agentIconMap.esg.name}
                IconComponent={agentIconMap.esg.icon}
                color={agentIconMap.esg.color}
                animationClass="animate-agent-slide-in-left"
                animationDelay="0s"
            />
             <AgentFigure
                label={agentIconMap.macro.name}
                IconComponent={agentIconMap.macro.icon}
                color={agentIconMap.macro.color}
                animationClass="animate-agent-slide-in-left"
                animationDelay="0.2s"
            />
            <FinancialBuildingIcon className="h-20 w-20 text-slate-500 animate-scene-fade-in" style={{ animationDelay: '0.5s' }} />
             <AgentFigure
                label={agentIconMap.competitive.name}
                IconComponent={agentIconMap.competitive.icon}
                color={agentIconMap.competitive.color}
                animationClass="animate-agent-slide-in-right"
                animationDelay="0.2s"
            />
            {/* FIX: Replaced 'news' agent with the new 'market_intel' agent. */}
            <AgentFigure
                label={agentIconMap.market_intel.name}
                IconComponent={agentIconMap.market_intel.icon}
                color={agentIconMap.market_intel.color}
                animationClass="animate-agent-slide-in-right"
                animationDelay="0s"
            />
        </div>
    </SceneContainer>
);

const SynthesizingScene = () => (
     <SceneContainer title="Synthesize Draft Report">
        <div className="flex items-center gap-4">
             <div className="animate-agent-slide-in-left flex flex-col gap-2">
                <div className="w-16 h-2 bg-slate-600 rounded-full animate-light-flicker" style={{animationDelay: '0.2s'}}></div>
                <div className="w-16 h-2 bg-slate-600 rounded-full animate-light-flicker" style={{animationDelay: '0.4s'}}></div>
                <div className="w-16 h-2 bg-slate-600 rounded-full animate-light-flicker" style={{animationDelay: '0.6s'}}></div>
            </div>
            <ManWalkingIcon className="h-20 w-20 text-blue-500 animate-scene-fade-in" />
            <div className="animate-agent-slide-in-right">
                <FinancialBuildingIcon className="h-20 w-20 text-blue-500" />
            </div>
        </div>
    </SceneContainer>
);

const DebatingScene = () => (
    <SceneContainer title="Debating & Refining">
       <div className="flex items-center justify-center gap-10">
            <div className="animate-agent-slide-in-left text-center">
                 <ManWalkingIcon className="h-20 w-20 text-blue-500" />
                 <p className="text-xs font-bold text-slate-300 mt-1">Chief Analyst</p>
            </div>
            <div className="flex flex-col gap-1">
                <div className="w-8 h-1 bg-red-500 rounded-full animate-light-flicker" style={{animationDelay: '0.5s'}}></div>
                <div className="w-8 h-1 bg-green-500 rounded-full animate-light-flicker" style={{animationDelay: '0.2s'}}></div>
            </div>
            <div className="animate-agent-slide-in-right text-center">
                <ManWalkingIcon className="h-20 w-20 text-orange-500" />
                <p className="text-xs font-bold text-slate-300 mt-1">Specialist</p>
            </div>
       </div>
    </SceneContainer>
);

const FinalizingScene = () => (
    <SceneContainer title="Finalizing Report">
        <div className="flex items-center gap-4">
            <ManWalkingIcon className="h-20 w-20 text-blue-500 animate-agent-slide-in-left" />
            <FinancialBuildingIcon className="h-20 w-20 text-green-500 animate-agent-slide-in-right" />
        </div>
    </SceneContainer>
);

const CompleteScene = () => (
    <SceneContainer title="Analysis Complete">
        <div className="relative animate-glow">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#4ade80" strokeWidth="4"/>
                <path d="M30 50 l15 15 l30 -30"
                    stroke="#4ade80"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="80"
                    strokeDashoffset="80"
                    className="animate-draw-checkmark"
                />
            </svg>
        </div>
    </SceneContainer>
);

const PausedScene = () => (
    <SceneContainer title="Analysis Paused">
        <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="#f59e0b" strokeWidth="4" />
            <path d="M30 25 V55 M50 25 V55" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
        </svg>
    </SceneContainer>
);

const renderScene = (phase: AnalysisPhase) => {
    switch (phase) {
        case 'PLANNING': return <PlanningScene />;
        case 'GATHERING': return <GatheringScene />;
        case 'CALCULATING':
        case 'VERIFYING':
        case 'DRAFTING': return <SynthesizingScene />;
        case 'DEBATING':
        case 'REFINING': return <DebatingScene />;
        case 'FINALIZING': return <FinalizingScene />;
        case 'COMPLETE': return <CompleteScene />;
        case 'ERROR':
        case 'PAUSED': return <PausedScene />;
        default: return <PlanningScene />;
    }
};

const LiveLog: React.FC<{ log: ExecutionStep[] }> = ({ log }) => {
    const lastThree = log.filter(step => step.status === 'complete').slice(-3);
    if (lastThree.length === 0) return null;
    
    return (
        <div className="mt-8 w-full max-w-2xl mx-auto p-4 bg-slate-800/60 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <h4 className="text-sm font-bold text-slate-300 mb-3 text-center tracking-wider uppercase">Live Activity Log</h4>
            <div className="space-y-2 font-mono">
                {lastThree.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 text-xs text-slate-400 animate-slide-in-bottom">
                        <span className="text-slate-500">{new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span className="font-semibold text-slate-300">{step.agentKey.toUpperCase()}:</span>
                        <span className="truncate">{step.stepName}</span>
                        <span className="ml-auto font-bold text-green-400">
                            [COMPLETE]
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BackgroundCircles: React.FC = () => (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/5 rounded-full"></div>
    </div>
);

const mainPhases: { text: string }[] = [
    { text: 'Planning' },
    { text: 'Gathering' },
    { text: 'Synthesizing' },
    { text: 'Debating' },
    { text: 'Finalizing' },
];

const phaseOrder: Record<AnalysisPhase, number> = {
    IDLE: -1, PLANNING: 0, GATHERING: 1, CALCULATING: 1, VERIFYING: 1,
    DRAFTING: 2, DEBATING: 3, REFINING: 3, FINALIZING: 4, COMPLETE: 5, ERROR: 5, PAUSED: 5
};

interface FinancialAdvisorLoaderProps {
    stockSymbol: string;
    analysisPhase: AnalysisPhase;
    executionLog: ExecutionStep[];
}

export const FinancialAdvisorLoader: React.FC<FinancialAdvisorLoaderProps> = ({ stockSymbol, analysisPhase, executionLog }) => {
    const currentPhaseIndex = useMemo(() => phaseOrder[analysisPhase] ?? -1, [analysisPhase]);

    const currentStatusText = useMemo(() => {
        const runningStep = executionLog.find(s => s.status === 'running');
        if (runningStep) return `Status: ${runningStep.stepName}...`;
        if (analysisPhase === 'COMPLETE') return 'Status: Analysis Complete!';
        if (analysisPhase === 'ERROR' || analysisPhase === 'PAUSED') return 'Status: Analysis Halted.';
        return 'Status: Initializing Workflow...';
    }, [executionLog, analysisPhase]);

    return (
        <div className="py-6 animate-fade-in relative overflow-hidden" aria-live="polite" aria-label={`Analyzing ${stockSymbol}...`}>
            <BackgroundCircles />
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-100">
                    <span className="text-blue-500">Agentic Workflow</span> in Progress...
                </h2>
                <p className="text-slate-400 mt-1">
                    AI agents are collaborating to analyze <span className="font-semibold text-slate-200">{stockSymbol}</span>.
                </p>
            </div>

            <div className="w-full max-w-2xl mx-auto mb-4 px-4">
                <div className="flex items-start">
                    {mainPhases.map((phase, index) => (
                        <React.Fragment key={phase.text}>
                            <div className="flex flex-col items-center z-10">
                                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${index <= currentPhaseIndex ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                                <p className="text-xs text-slate-400 mt-2 text-center">{phase.text}</p>
                            </div>
                            {index < mainPhases.length - 1 && (
                                <div className={`flex-1 h-0.5 mt-1.5 transition-colors duration-300 ${index < currentPhaseIndex ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
            <p className="text-center text-sm font-semibold text-slate-300 h-5 mb-6">{currentStatusText}</p>
            
            <div className="relative flex justify-center items-center min-h-[200px]">
               {renderScene(analysisPhase)}
            </div>
            
            <LiveLog log={executionLog} />
        </div>
    );
};
