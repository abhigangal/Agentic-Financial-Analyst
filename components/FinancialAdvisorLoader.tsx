import React, { useMemo } from 'react';
import { AnalysisPhase } from '../../App';
import { ExecutionStep } from '../../types';

// --- Scene Components ---

const SceneContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="animate-scene-fade-in">
        <svg width="400" height="250" viewBox="0 0 400 250">
            {children}
        </svg>
    </div>
);

const PlanningScene = () => (
    <SceneContainer>
        <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{ stopColor: '#facc15', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#facc15', stopOpacity: 0 }} />
            </radialGradient>
        </defs>
        {/* Desk */}
        <path d="M50 200 H350" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 200 V230" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        <path d="M300 200 V230" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        {/* Analyst */}
        <circle cx="200" cy="150" r="15" fill="#3b82f6" />
        <path d="M200 165 V185 H220 L220 200" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Monitor */}
        <rect x="230" y="150" width="60" height="40" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <path d="M240 160 L255 175 L265 165 L280 170" stroke="#22c55e" strokeWidth="1.5" fill="none" />
        {/* Lightbulb */}
        <g transform="translate(140, 130)">
            <circle cx="0" cy="0" r="25" fill="url(#grad1)" className="animate-light-flicker" />
            <path d="M0 -15 C -10 -25, 10 -25, 0 -15" fill="#facc15" />
            <rect x="-5" y="-3" width="10" height="6" fill="#facc15" />
        </g>
        <text x="200" y="50" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">PLANNING</text>
    </SceneContainer>
);

const GatheringScene = () => (
    <SceneContainer>
        {/* Desk */}
        <path d="M50 200 H350" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 200 V230" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        <path d="M300 200 V230" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        {/* Main Analyst */}
        <circle cx="200" cy="150" r="15" fill="#3b82f6" />
        <path d="M200 165 V200" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Document Stack */}
        <rect x="185" y="185" width="30" height="15" rx="2" fill="#475569" />
        <rect x="182" y="182" width="30" height="15" rx="2" fill="#64748b" />
        <rect x="188" y="179" width="30" height="15" rx="2" fill="#94a3b8" />

        {/* Agent 1 */}
        <g className="animate-agent-slide-in-left" style={{ animationDelay: '0.2s' }}>
            <circle cx="80" cy="155" r="10" fill="#22c55e" />
            <path d="M80 165 V185" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
            <rect x="90" y="160" width="10" height="12" rx="1" fill="#94a3b8" />
        </g>
        {/* Agent 2 */}
        <g className="animate-agent-slide-in-left" style={{ animationDelay: '0.5s' }}>
            <circle cx="120" cy="120" r="10" fill="#a855f7" />
            <path d="M120 130 V150" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
            <rect x="130" y="135" width="10" height="12" rx="1" fill="#94a3b8" />
        </g>
        {/* Agent 3 */}
        <g className="animate-agent-slide-in-right" style={{ animationDelay: '0.3s' }}>
            <circle cx="320" cy="155" r="10" fill="#f59e0b" />
            <path d="M320 165 V185" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <rect x="300" y="160" width="10" height="12" rx="1" fill="#94a3b8" />
        </g>
        {/* Agent 4 */}
        <g className="animate-agent-slide-in-right" style={{ animationDelay: '0.6s' }}>
            <circle cx="280" cy="120" r="10" fill="#ef4444" />
            <path d="M280 130 V150" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <rect x="260" y="135" width="10" height="12" rx="1" fill="#94a3b8" />
        </g>

        <text x="200" y="50" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">GATHERING INTEL</text>
    </SceneContainer>
);

const DebatingScene = () => (
     <SceneContainer>
        {/* Desk */}
        <path d="M50 200 H350" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        {/* Analyst 1 */}
        <circle cx="150" cy="150" r="15" fill="#3b82f6" />
        <path d="M150 165 V185 L170 170" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Analyst 2 (Chief) */}
        <circle cx="250" cy="150" r="15" fill="#f59e0b" />
        <path d="M250 165 V185 L230 170" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Monitor */}
        <rect x="175" y="150" width="50" height="40" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <circle cx="190" cy="165" r="3" fill="#ef4444" />
        <circle cx="210" cy="165" r="3" fill="#22c55e" />
        <text x="200" y="50" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">DEBATING & REFINING</text>
    </SceneContainer>
);

const FinalizingScene = () => (
    <SceneContainer>
        {/* Desk */}
        <path d="M50 200 H350" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        {/* Analyst */}
        <circle cx="200" cy="150" r="15" fill="#3b82f6" />
        <path d="M200 165 V185 H220 L220 200" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Monitor */}
        <rect x="230" y="150" width="80" height="50" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <path d="M240 162 H290 M240 172 H300 M240 182 H280" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Documents */}
        <rect x="100" y="185" width="40" height="15" rx="2" fill="#475569" />
        <text x="200" y="50" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">FINALIZING REPORT</text>
    </SceneContainer>
);

const CompleteScene = () => (
     <SceneContainer>
        {/* Desk */}
        <path d="M50 200 H350" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        {/* Analyst */}
        <circle cx="200" cy="150" r="15" fill="#3b82f6" />
        <path d="M200 165 V185 H220 L220 200" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Monitor with Checkmark */}
        <rect x="230" y="150" width="80" height="50" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <g className="animate-glow">
            <path d="M255 175 l10 10 l20 -20" 
                stroke="#4ade80" 
                strokeWidth="5" 
                fill="none" 
                strokeLinecap="round"
                strokeDasharray="50"
                strokeDashoffset="50"
                className="animate-draw-checkmark"
            />
        </g>
        <text x="200" y="50" textAnchor="middle" fill="#4ade80" fontSize="14" fontWeight="bold">ANALYSIS COMPLETE</text>
    </SceneContainer>
);

const PausedScene = () => (
    <SceneContainer>
        <rect x="150" y="100" width="100" height="100" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
        <path d="M190 125 V175 M210 125 V175" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"/>
        <text x="200" y="50" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">ANALYSIS PAUSED</text>
    </SceneContainer>
);


const renderScene = (phase: AnalysisPhase) => {
    switch (phase) {
        case 'PLANNING': return <PlanningScene />;
        case 'GATHERING':
        case 'CALCULATING':
        case 'VERIFYING': return <GatheringScene />;
        case 'DRAFTING':
        case 'DEBATING':
        case 'REFINING': return <DebatingScene />;
        case 'FINALIZING': return <FinalizingScene />;
        case 'COMPLETE': return <CompleteScene />;
        case 'ERROR':
        case 'PAUSED': return <PausedScene />;
        default: return <PlanningScene />;
    }
};

interface FinancialAdvisorLoaderProps {
    stockSymbol: string;
    analysisPhase: AnalysisPhase;
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
    IDLE: 0, PLANNING: 1, GATHERING: 2, CALCULATING: 2, VERIFYING: 2,
    DRAFTING: 3, DEBATING: 4, REFINING: 4, FINALIZING: 5, COMPLETE: 6, ERROR: 6, PAUSED: 6
};

const BackgroundBubbles: React.FC = () => (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        {[...Array(10)].map((_, i) => {
            const size = Math.random() * 200 + 50;
            const duration = Math.random() * 20 + 15;
            const delay = Math.random() * 10;
            return (
                <div
                    key={i}
                    className="absolute bottom-0 rounded-full bg-blue-500/10"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${Math.random() * 100}%`,
                        animation: `background-bubbles ${duration}s linear ${delay}s infinite`,
                    }}
                />
            );
        })}
    </div>
);

const LiveLog: React.FC<{ log: ExecutionStep[] }> = ({ log }) => {
    const lastThree = log.filter(step => step.status === 'complete').slice(-3);
    if (lastThree.length === 0) return null;
    
    return (
        <div className="mt-8 w-full max-w-2xl mx-auto p-4 bg-gray-900/50 rounded-lg border border-slate-700/50 backdrop-blur-sm">
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

export const FinancialAdvisorLoader: React.FC<FinancialAdvisorLoaderProps> = (props) => {
    const { stockSymbol, analysisPhase, executionLog } = props;
    
    const currentPhaseIndex = useMemo(() => {
        const order = phaseOrder[analysisPhase] || 0;
        if (order >= 5) return 4;
        if (order >= 4) return 3;
        if (order >= 3) return 2;
        if (order >= 2) return 1;
        if (order >= 1) return 0;
        return -1;
    }, [analysisPhase]);

    const currentStatusText = useMemo(() => {
        const runningStep = executionLog.find(s => s.status === 'running');
        if (runningStep) return `Status: ${runningStep.stepName}...`;
        if (analysisPhase === 'COMPLETE') return 'Status: Analysis Complete!';
        if (analysisPhase === 'ERROR' || analysisPhase === 'PAUSED') return 'Status: Analysis Halted.';
        return 'Status: Initializing Workflow...';
    }, [executionLog, analysisPhase]);

    return (
        <div className="py-6 animate-fade-in relative overflow-hidden" aria-live="polite" aria-label={`Analyzing ${stockSymbol}...`}>
            <BackgroundBubbles />
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-100">
                    <span className="text-blue-500">Agentic Workflow</span> in Progress...
                </h2>
                <p className="text-slate-400 mt-1">
                    AI agents are collaborating to analyze <span className="font-semibold text-slate-200">{stockSymbol}</span>.
                </p>
            </div>

            <div className="w-full max-w-2xl mx-auto mb-4">
                <div className="relative flex justify-between items-center">
                    {mainPhases.map((phase, index) => (
                        <div key={phase.key} className="text-center text-xs text-slate-400 flex-1 relative z-10">
                             <div className={`w-4 h-4 rounded-full mx-auto mb-1 transition-colors duration-300 ${index <= currentPhaseIndex ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                            {phase.text}
                        </div>
                    ))}
                    <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-slate-600 w-full">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-500 ease-in-out" 
                            style={{ width: `${(currentPhaseIndex / (mainPhases.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
            
            <p className="text-center text-sm font-semibold text-slate-300 h-5 mb-6">{currentStatusText}</p>
            
            <div className="relative flex justify-center items-center min-h-[250px]">
               {renderScene(analysisPhase)}
            </div>
            
            <LiveLog log={executionLog} />
        </div>
    );
};
