import React, { useState } from 'react';
import { ExecutionStep, GroundingSource } from '../../types';
import { CollapsibleSection } from './CollapsibleSection';
import { CheckCircleIcon, ExclamationTriangleIcon, LinkIcon, PlayCircleIcon, SparklesIcon, SpinnerIcon, DocumentTextIcon, ArrowDownTrayIcon } from './IconComponents';
import { generateMethodologyPdf } from '../../services/pdfService';

interface PlanAndStepsProps {
    stockSymbol: string;
    plan: string | null;
    steps: ExecutionStep[];
    onRetry: () => void;
    consolidatedSources: GroundingSource[];
}

const getStatusIcon = (status: ExecutionStep['status']) => {
    switch (status) {
        case 'running':
            return <SpinnerIcon className="h-5 w-5 text-blue-500" />;
        case 'complete':
            return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
        case 'error':
            return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
        case 'paused':
            return <PlayCircleIcon className="h-5 w-5 text-yellow-500" />;
        default:
            return null;
    }
}

export const PlanAndSteps: React.FC<PlanAndStepsProps> = ({ stockSymbol, plan, steps, onRetry, consolidatedSources }) => {
    const [isExporting, setIsExporting] = useState(false);

    if (steps.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-slate-500">Analysis has not started yet.</p>
            </div>
        )
    }
    
    const handleExport = async () => {
        setIsExporting(true);
        try {
            await generateMethodologyPdf(stockSymbol, plan, steps, consolidatedSources);
        } catch (error) {
            console.error("Methodology PDF Export failed", error);
            alert("There was an error generating the methodology PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    const renderPayload = (payload: string) => {
        try {
            const prettyJson = JSON.stringify(JSON.parse(payload), null, 2);
            return (
                 <pre className="whitespace-pre-wrap font-mono text-xs p-3 bg-gray-100 dark:bg-slate-900 rounded-md max-h-96 overflow-auto scrollbar-hide">
                    {prettyJson}
                </pre>
            )
        } catch (e) {
            return (
                 <pre className="whitespace-pre-wrap font-mono text-xs p-3 bg-gray-100 dark:bg-slate-900 rounded-md max-h-96 overflow-auto scrollbar-hide">
                    {payload}
                </pre>
            )
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Methodology & Sources</h2>
                 <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-2 h-9 px-4 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed shrink-0"
                    title="Export the methodology and execution steps to a PDF document."
                    data-test="export-methodology-pdf-button"
                    >
                    {isExporting ? (
                        <>
                        <SpinnerIcon className="h-5 w-5" />
                        <span>Exporting...</span>
                        </>
                    ) : (
                        <>
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        <span>Export Methodology</span>
                        </>
                    )}
                </button>
            </div>
             {consolidatedSources && consolidatedSources.length > 0 && (
                <div className="pt-2">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Consolidated Sources</h3>
                    <div className="p-4 bg-gray-50 border rounded-lg dark:bg-slate-800/50 dark:border-slate-700/50">
                        <ul className="list-disc pl-5 space-y-2 prose prose-sm text-slate-600 max-w-none dark:text-slate-300 columns-1 md:columns-2">
                            {consolidatedSources.map((source, index) => (
                                <li key={index} className="break-inside-avoid">
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-600 hover:text-blue-500 hover:underline break-words dark:text-blue-400 dark:hover:text-blue-300"
                                        title={source.uri}
                                    >
                                        {source.title || source.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {plan && (
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Analysis Plan</h3>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-500/30">
                        <p className="prose prose-sm text-blue-800 dark:text-blue-200 max-w-none whitespace-pre-line">{plan}</p>
                    </div>
                </div>
            )}
            
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Execution Log</h3>
                <div className="space-y-3">
                    {steps.map(step => (
                        <div key={step.id} className="border border-gray-200/80 rounded-lg bg-white/50 dark:border-slate-700/80 dark:bg-slate-800/50">
                             <div className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{step.stepName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Agent: {step.agentKey.toUpperCase()}</p>
                                    </div>
                                </div>
                             </div>
                             {(step.input || step.output) && (
                                 <div className="px-4 pb-4">
                                     <CollapsibleSection
                                        title="View Details"
                                        icon={<DocumentTextIcon />}
                                        uniqueKey={`step-details-${step.id}`}
                                      >
                                        <div className="space-y-4">
                                            {step.input && (
                                                <div>
                                                    <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-2">Input Payload</h4>
                                                    {renderPayload(step.input)}
                                                </div>
                                            )}
                                            {step.output && (
                                                <div>
                                                    <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-2">Output Payload</h4>
                                                    {renderPayload(step.output)}
                                                </div>
                                            )}
                                        </div>
                                     </CollapsibleSection>
                                 </div>
                             )}
                             {step.status === 'paused' && step.remediation && (
                                 <div className="px-4 pb-4">
                                     <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-500/30">
                                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Analysis Paused</h4>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 mb-3">{step.remediation.message}</p>

                                        <button 
                                            onClick={onRetry}
                                            className="px-3 py-1.5 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 text-sm"
                                        >
                                            {step.remediation.action} Analysis
                                        </button>
                                     </div>
                                 </div>
                             )}
                              {step.sources && step.sources.length > 0 && (
                                <div className="px-4 pb-4">
                                <CollapsibleSection title="Sources" icon={<LinkIcon />} uniqueKey={`step-sources-${step.id}`}>
                                    <ul className="list-disc pl-5 space-y-2 prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
                                        {step.sources.map((source, index) => (
                                            <li key={index}>
                                                <a 
                                                    href={source.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-blue-600 hover:text-blue-500 hover:underline break-all dark:text-blue-400 dark:hover:text-blue-300"
                                                    title={source.uri}
                                                >
                                                    {source.title || source.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </CollapsibleSection>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
