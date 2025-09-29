import React, { useMemo } from 'react';
import { AnalysisPhase } from '../App';
import { ExecutionStep } from '../types';
import { AgentKey } from '../types';
import { LeafIcon, GlobeAltIcon, NewspaperIcon, UserGroupIcon, TrophyIcon, BuildingOfficeIcon, CalendarDaysIcon, ShieldExclamationIcon } from './IconComponents';

const agentNodeConfig: { key: AgentKey; name: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { key: 'esg', name: 'ESG', icon: LeafIcon },
    { key: 'macro', name: 'Macro', icon: GlobeAltIcon },
    { key: 'market_intel', name: 'Market', icon: NewspaperIcon },
    { key: 'leadership', name: 'Leadership', icon: UserGroupIcon },
    { key: 'competitive', name: 'Competition', icon: TrophyIcon },
    { key: 'sector', name: 'Sector', icon: BuildingOfficeIcon },
    { key: 'calendar', name: 'Calendar', icon: CalendarDaysIcon },
    { key: 'contrarian', name: 'Bear Case', icon: ShieldExclamationIcon },
];

const dataStreamConfig: { key: AgentKey, name: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, color: string }[] = [
    { key: 'esg', name: 'ESG', icon: LeafIcon, color: '#22c55e' },
    { key: 'macro', name: 'Macro', icon: GlobeAltIcon, color: '#0ea5e9' },
    { key: 'market_intel', name: 'Market Intel', icon: NewspaperIcon, color: '#3b82f6' },
    { key: 'leadership', name: 'Leadership', icon: UserGroupIcon, color: '#8b5cf6' },
    { key: 'competitive', name: 'Competition', icon: TrophyIcon, color: '#f59e0b' },
    { key: 'sector', name: 'Sector', icon: BuildingOfficeIcon, color: '#4f46e5' },
    { key: 'calendar', name: 'Calendar', icon: CalendarDaysIcon, color: '#f43f5e' },
    { key: 'contrarian', name: 'Bear Case', icon: ShieldExclamationIcon, color: '#ef4444' },
];

const phaseMap: Record<AnalysisPhase, { index: number; title: string; }> = {
    IDLE: { index: -1, title: 'Initializing' },
    PLANNING: { index: 0, title: 'Planning' },
    GATHERING: { index: 1, title: 'Gathering Intel' },
    CALCULATING: { index: 1, title: 'Calculating Metrics' },
    VERIFYING: { index: 1, title: 'Verifying Financials' },
    DRAFTING: { index: 2, title: 'Drafting Initial Report' },
    DEBATING: { index: 3, title: 'Debating & Critiquing' },
    REFINING: { index: 4, title: 'Refining Analysis' },
    FINALIZING: { index: 5, title: 'Finalizing Report' },
    COMPLETE: { index: 6, title: 'Complete' },
    ERROR: { index: 6, title: 'Error' },
    PAUSED: { index: 6, title: 'Paused' },
};

const LiveLog: React.FC<{ log: ExecutionStep[] }> = ({ log }) => {
    const completedSteps = log.filter(step => step.status === 'complete').slice(-4);
    if (completedSteps.length === 0) return null;
    
    return (
        <div className="absolute bottom-4 left-4 w-full max-w-sm p-4 bg-black/30 rounded-lg border border-white/10 backdrop-blur-sm">
            <h4 className="text-sm font-bold text-slate-100 mb-3 text-left tracking-wider uppercase">Live Activity Log</h4>
            <div className="space-y-2 font-mono text-left">
                {completedSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 text-xs text-slate-300 animate-nexus-log-entry-appear" style={{ animationDelay: `${(completedSteps.indexOf(step) * 0.1)}s` }}>
                        <span className="text-slate-400">{new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span className="truncate flex-1">{step.stepName}</span>
                        <span className="font-bold text-green-400 ml-auto">
                            [OK]
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const GatheringAnimation: React.FC = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        {dataStreamConfig.map((source, i) => {
            const angle = (i / dataStreamConfig.length) * 360 - 90;
            const delay = i * 0.4; // Slower start
            const pathId = `path-${source.key}`;
            const pathD = i % 2 === 0 
                ? `M ${120 * Math.cos(angle * Math.PI / 180)}, ${120 * Math.sin(angle * Math.PI / 180)} Q ${60 * Math.cos((angle + 45) * Math.PI / 180)},${60 * Math.sin((angle + 45) * Math.PI / 180)} 0,0`
                : `M ${120 * Math.cos(angle * Math.PI / 180)}, ${120 * Math.sin(angle * Math.PI / 180)} Q ${60 * Math.cos((angle - 45) * Math.PI / 180)},${60 * Math.sin((angle - 45) * Math.PI / 180)} 0,0`;
            
            return (
                <div key={source.key} className="absolute" style={{ transform: `translate(-50%, -50%)` }}>
                    <div className="absolute" style={{ top: '50%', left: '50%', transform: `translate(${140 * Math.cos(angle * Math.PI / 180)}px, ${140 * Math.sin(angle * Math.PI / 180)}px)` }}>
                        <div className="flex flex-col items-center gap-1 opacity-0" style={{ animation: `fadeIn 0.5s ${delay + 0.5}s forwards` }}>
                            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: source.color, background: 'rgba(0,0,0,0.3)'}}>
                                <source.icon className="w-4 h-4" style={{ color: source.color }}/>
                            </div>
                            <span className="text-xs font-semibold" style={{ color: source.color }}>{source.name}</span>
                        </div>
                    </div>
                    <svg width="300" height="300" viewBox="-150 -150 300 300" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible">
                        <path id={pathId} d={pathD} fill="none" />
                        {[...Array(5)].map((_, p) => (
                            <circle key={p} r="2" fill={source.color} className="animate-nexus-particle-flow" style={{ animationDelay: `${delay + p * 0.5}s` }}>
                                <animateMotion dur="2.5s" repeatCount="indefinite" rotate="auto">
                                    <mpath href={`#${pathId}`} />
                                </animateMotion>
                            </circle>
                        ))}
                    </svg>
                </div>
            )
        })}
    </div>
);

interface AgenticNexusLoaderProps {
    stockSymbol: string;
    analysisPhase: AnalysisPhase;
    executionLog: ExecutionStep[];
}

export const AgenticNexusLoader: React.FC<AgenticNexusLoaderProps> = ({ stockSymbol, analysisPhase, executionLog }) => {
    const currentPhase = useMemo(() => phaseMap[analysisPhase] ?? phaseMap.IDLE, [analysisPhase]);
    const runningStep = useMemo(() => executionLog.find(s => s.status === 'running'), [executionLog]);
    
    const activeGatheringAgentKey = useMemo(() => {
        if (analysisPhase !== 'GATHERING') return null;
        return executionLog.find(s => s.status === 'running')?.agentKey;
    }, [analysisPhase, executionLog]);

    const statusText = runningStep?.stepName ?? currentPhase.title;

    return (
        <div 
          className="py-6 relative overflow-hidden flex flex-col items-center justify-center rounded-lg nexus-background"
          style={{ height: '550px', background: 'radial-gradient(circle, #1e293b 0%, #0f172a 70%), linear-gradient(270deg, #0f172a, #1d4ed8, #4f46e5, #0f172a)', backgroundSize: '200% 200%', animation: 'nexus-background-gradient 15s ease infinite' }}
          aria-live="polite"
        >
            <div className="text-center mb-4 z-10">
                <h2 className="text-2xl font-bold text-slate-100">
                    Agentic Workflow in Progress
                </h2>
                <p className="text-slate-300 mt-1">
                    AI agents are collaborating on <span className="font-semibold text-white">{stockSymbol}</span>.
                </p>
            </div>

            <div className="relative w-96 h-96 flex items-center justify-center">
                {/* Glassmorphism Panel */}
                <div className="absolute w-80 h-80 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"></div>
                
                {analysisPhase === 'GATHERING' && <GatheringAnimation />}
                
                {/* Central Node */}
                <div className="relative w-24 h-24 rounded-full bg-slate-900 border-2 border-blue-400 flex flex-col items-center justify-center shadow-lg z-10">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-nexus-pulse-glow" style={{ boxShadow: '0 0 10px #60a5fa, 0 0 20px #60a5fa' }}></div>
                    <span className="text-xs font-bold text-slate-300 mt-1">Chief</span>
                </div>

                {/* Orbiting Agent Nodes */}
                {agentNodeConfig.map((agent, i) => {
                    const isPulsing = activeGatheringAgentKey === agent.key;
                    return (
                        <div
                            key={agent.key}
                            className="absolute w-16 h-16 top-1/2 left-1/2 -mt-8 -ml-8 animate-nexus-orbit"
                            style={{ animationDelay: `${i * 0.5}s`, animationDuration: `${15 + i * 2.5}s` }}
                        >
                             {/* Synaptic Line and Particles */}
                             <div
                                className="absolute top-8 left-8 w-px h-[120px] bg-blue-500/50 origin-top animate-nexus-line-shimmer"
                                style={{ transform: 'rotate(180deg)', animationDuration: '6s', animationDelay: `${i * 0.3}s`}}
                            >
                                <div 
                                    className="absolute -left-px top-0 w-1 h-2 bg-sky-300 rounded-full animate-nexus-particle-travel"
                                    style={{ animationDuration: '5s', animationDelay: `${i * 0.4 + 1}s` }}
                                ></div>
                                <div 
                                    className="absolute -left-px top-0 w-1 h-2 bg-sky-300 rounded-full animate-nexus-particle-travel"
                                    style={{ animationDuration: '5s', animationDelay: `${i * 0.4 + 3}s` }}
                                ></div>
                            </div>
                            
                            {/* The node itself */}
                            <div className={`w-full h-full rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 ${isPulsing ? 'bg-sky-500/30 border-sky-400 shadow-lg animate-nexus-pulse-glow' : 'bg-slate-800/50 border-slate-600'}`}>
                                <agent.icon className={`w-6 h-6 ${isPulsing ? 'text-sky-300' : 'text-slate-400'}`} />
                                <span className={`text-xs font-semibold mt-0.5 ${isPulsing ? 'text-white' : 'text-slate-400'}`}>{agent.name}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="z-10 mt-4 h-6">
                <div className="text-slate-300 nexus-status-ticker overflow-hidden whitespace-nowrap border-r-2" style={{ animation: `nexus-typewriter 1s steps(${statusText.length}, end), nexus-blink-caret .75s step-end infinite`}}>
                    {statusText}
                </div>
            </div>

            <LiveLog log={executionLog} />
        </div>
    );
};