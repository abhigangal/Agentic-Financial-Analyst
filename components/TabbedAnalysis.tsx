import React, { useMemo, useCallback } from 'react';
import { GroundingSource, AgentKey } from '../types';
import { FinancialAdvisorIcon, LeafIcon, GlobeAltIcon, UserGroupIcon, ChatBubbleLeftRightIcon, TrophyIcon, BuildingOfficeIcon, CalendarDaysIcon, SparklesIcon, ScaleIcon, ShieldExclamationIcon, PresentationChartLineIcon, ClipboardDocumentListIcon, ClockIcon, InformationCircleIcon, ArrowPathIcon, ChartBarIcon } from './IconComponents';
import { ResultDisplay } from './ResultDisplay';
import { AgenticNexusLoader } from './AgenticNexusLoader';
import { SidekickAgentCard } from './SidekickAgentCard';
import { EsgAgentCard } from './esg/EsgAgentCard';
import { MacroAgentCard } from './macro/MacroAgentCard';
import { MarketIntelligenceAgentCard } from './news/NewsAgentCard';
import { LeadershipAgentCard } from './leadership/LeadershipAgentCard';
import { CompetitiveAgentCard } from './competitive/CompetitiveAgentCard';
import { SectorAgentCard } from './sector/SectorAgentCard';
import { CorporateCalendarAgentCard } from './calendar/CorporateCalendarAgentCard';
import { ScenarioPlanner } from './scenario/ScenarioPlanner';
import { CollapsibleSection } from './CollapsibleSection';
import { Tabs } from './Tabs';
import { PlanAndSteps } from './PlanAndSteps';
import { ChartsTab } from './charts/ChartsTab';
import { FinancialsTab } from './financials/FinancialsTab';
import { SnapshotsTab } from './snapshots/SnapshotsTab';
import { QuantitativeAgentCard } from './quantitative/QuantitativeAgentCard';
import { useAnalysis } from '../contexts/AnalysisContext';
import { TechnicalResultDisplay } from './TechnicalResultDisplay';
import { ContrarianResultDisplay } from './ContrarianResultDisplay';

const TechnicalAgentCard: React.FC = () => {
    const { state } = useAnalysis();
    if (state.technicalAnalysis) {
        return <TechnicalResultDisplay result={state.technicalAnalysis} />;
    }
    return null;
};

const ContrarianAgentCard: React.FC = () => {
    const { state } = useAnalysis();
    if (state.contrarianAnalysis) {
        return <ContrarianResultDisplay result={state.contrarianAnalysis} />;
    }
    return null;
};

interface TabbedAnalysisProps {
  onRetry: (enabledAgentsConfig: Record<AgentKey, boolean>) => void;
}

const TABS = {
    ANALYSIS: 'Analysis',
    CHARTS: 'Charts',
    FINANCIALS: 'Financials',
    SNAPSHOTS: 'Snapshots',
    METHODOLOGY: 'Methodology',
    QUANT_FORECAST: 'Quant Forecast',
    TECHNICALS: 'Technicals',
    BEAR_CASE: 'Bear Case',
    ESG: 'ESG',
    MACRO: 'Macro',
    MARKET_INTEL: 'Market Intel',
    LEADERSHIP: 'Leadership',
    COMPETITION: 'Competition',
    SECTOR: 'Sector',
    CALENDAR: 'Calendar',
};

export const TabbedAnalysis: React.FC<TabbedAnalysisProps> = ({ onRetry }) => {
  const { state, dispatch } = useAnalysis();
  const { 
    currentSymbol, analysisResult, selectedCurrency, analysisPhase, agentStatuses, 
    executionLog, analysisPlan, rawFinancials, calculatedMetrics, 
    snapshots, isCachedView, analysisCache, enabledAgents
  } = state;
  
  const isLoading = analysisPhase !== 'IDLE' && analysisPhase !== 'COMPLETE' && analysisPhase !== 'ERROR' && analysisPhase !== 'PAUSED';
  const financialError = agentStatuses.financial.error;
  const anyError = Object.values(agentStatuses).some(s => s.error);

  const consolidatedSources = useMemo(() => {
    const allSources = executionLog.flatMap(step => step.sources || []);
    const uniqueSources = allSources.reduce((acc, current) => {
        if (!acc.find(item => item.uri === current.uri)) acc.push(current);
        return acc;
    }, [] as GroundingSource[]);
    return uniqueSources;
  }, [executionLog]);
  
  const cachedTimestamp = useMemo(() => {
      if (!isCachedView || !currentSymbol || !analysisCache[currentSymbol]) return null;
      return analysisCache[currentSymbol].timestamp;
  }, [isCachedView, analysisCache, currentSymbol]);

  const handleRetryAnalysis = useCallback(() => {
    if (currentSymbol && enabledAgents) {
      onRetry(enabledAgents);
    }
  }, [currentSymbol, enabledAgents, onRetry]);

  const onRefresh = useCallback(() => {
    if (currentSymbol) {
        dispatch({ type: 'SET_IS_CACHED_VIEW', payload: false });
        dispatch({ type: 'SET_IS_CONFIGURING', payload: true });
    }
  }, [currentSymbol, dispatch]);

  if (!currentSymbol) return null;

  return (
    <div className="animate-fade-in mt-6">
        {isCachedView && cachedTimestamp && (
            <div className="mb-6 p-4 bg-blue-50/70 border border-blue-200 rounded-xl dark:bg-blue-900/20 dark:border-blue-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <InformationCircleIcon className="h-6 w-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">Showing cached data from {new Date(cachedTimestamp).toLocaleTimeString()}.</p>
                </div>
                <button onClick={onRefresh} className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-600 font-semibold rounded-md shadow-sm hover:bg-blue-50 border border-blue-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600">
                    <ArrowPathIcon className="h-4 w-4" /> Refresh
                </button>
            </div>
        )}
        <Tabs.Group defaultTab={TABS.ANALYSIS}>
            <Tabs.List>
                <Tabs.Tab id={TABS.ANALYSIS} data-test="analysis-tab-main"><div className="flex items-center gap-2"><FinancialAdvisorIcon className="h-5 w-5" /> Overall Analysis</div></Tabs.Tab>
                <Tabs.Tab id={TABS.CHARTS} data-test="analysis-tab-charts"><div className="flex items-center gap-2"><PresentationChartLineIcon className="h-5 w-5" /> Charts</div></Tabs.Tab>
                <Tabs.Tab id={TABS.FINANCIALS} data-test="analysis-tab-financials"><div className="flex items-center gap-2"><ClipboardDocumentListIcon className="h-5 w-5" /> Financials</div></Tabs.Tab>
                <Tabs.Tab id={TABS.SNAPSHOTS} data-test="analysis-tab-snapshots"><div className="flex items-center gap-2"><ClockIcon className="h-5 w-5" /> Snapshots</div></Tabs.Tab>
                <Tabs.Tab id={TABS.METHODOLOGY} data-test="analysis-tab-methodology"><div className="flex items-center gap-2"><SparklesIcon className="h-5 w-5" /> Methodology</div></Tabs.Tab>
                <Tabs.Tab id={TABS.QUANT_FORECAST} data-test="analysis-tab-quant-forecast"><div className="flex items-center gap-2"><ChartBarIcon className="h-5 w-5" /> Quant Forecast</div></Tabs.Tab>
                <Tabs.Tab id={TABS.TECHNICALS} data-test="analysis-tab-technicals"><div className="flex items-center gap-2"><ScaleIcon className="h-5 w-5" /> Technicals</div></Tabs.Tab>
                <Tabs.Tab id={TABS.BEAR_CASE} data-test="analysis-tab-bear-case"><div className="flex items-center gap-2"><ShieldExclamationIcon className="h-5 w-5" /> Bear Case</div></Tabs.Tab>
                <Tabs.Tab id={TABS.MARKET_INTEL} data-test="analysis-tab-market-intel"><div className="flex items-center gap-2"><ChatBubbleLeftRightIcon className="h-5 w-5" /> Market Intel</div></Tabs.Tab>
                <Tabs.Tab id={TABS.COMPETITION} data-test="analysis-tab-competition"><div className="flex items-center gap-2"><TrophyIcon className="h-5 w-5" /> Competition</div></Tabs.Tab>
                <Tabs.Tab id={TABS.LEADERSHIP} data-test="analysis-tab-leadership"><div className="flex items-center gap-2"><UserGroupIcon className="h-5 w-5" /> Leadership</div></Tabs.Tab>
                <Tabs.Tab id={TABS.SECTOR} data-test="analysis-tab-sector"><div className="flex items-center gap-2"><BuildingOfficeIcon className="h-5 w-5" /> Sector</div></Tabs.Tab>
                <Tabs.Tab id={TABS.ESG} data-test="analysis-tab-esg"><div className="flex items-center gap-2"><LeafIcon className="h-5 w-5" /> ESG</div></Tabs.Tab>
                <Tabs.Tab id={TABS.MACRO} data-test="analysis-tab-macro"><div className="flex items-center gap-2"><GlobeAltIcon className="h-5 w-5" /> Macro</div></Tabs.Tab>
                <Tabs.Tab id={TABS.CALENDAR} data-test="analysis-tab-calendar"><div className="flex items-center gap-2"><CalendarDaysIcon className="h-5 w-5" /> Calendar</div></Tabs.Tab>
            </Tabs.List>
            <Tabs.Panels>
                <Tabs.Panel id={TABS.ANALYSIS}>
                    {isLoading && !analysisResult ? ( <AgenticNexusLoader stockSymbol={currentSymbol} analysisPhase={analysisPhase} executionLog={executionLog} /> ) : 
                    analysisResult ? (
                        <>
                            <ResultDisplay result={analysisResult} esgAnalysis={state.esgAnalysis} macroAnalysis={state.macroAnalysis} marketIntelligenceAnalysis={state.marketIntelligenceAnalysis} leadershipAnalysis={state.leadershipAnalysis} competitiveAnalysis={state.competitiveAnalysis} currencySymbol={selectedCurrency} calculatedMetrics={calculatedMetrics} />
                            <div className="mt-8"><CollapsibleSection title="What-If Scenario Planner" icon={<ChatBubbleLeftRightIcon />}><ScenarioPlanner stockName={analysisResult.share_name} financialSummary={analysisResult.justification.nutshell_summary} /></CollapsibleSection></div>
                        </>
                    ) : financialError ? (
                         <div className="text-center p-4"><p className="text-red-600 dark:text-red-400 font-semibold mb-2">Financial Analysis Failed</p><p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{financialError}</p><button onClick={handleRetryAnalysis} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors">Retry Full Analysis</button></div>
                    ) : null}
                    {anyError && analysisResult && !isCachedView && ( <div className="text-center p-4 border-t border-gray-200 dark:border-slate-700 mt-4"><p className="text-orange-600 dark:text-orange-400 font-semibold mb-2">Incomplete Analysis</p><p className="text-sm text-slate-600 dark:text-slate-400 mb-4">One or more sidekick agents failed. The main analysis ran with incomplete data. Check other tabs for details.</p><button onClick={handleRetryAnalysis} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors">Retry Full Analysis</button></div> )}
                </Tabs.Panel>
                <Tabs.Panel id={TABS.CHARTS}><ChartsTab rawFinancials={rawFinancials} quantitativeAnalysis={state.quantitativeAnalysis} /></Tabs.Panel>
                <Tabs.Panel id={TABS.FINANCIALS}><FinancialsTab rawFinancials={rawFinancials} stockSymbol={currentSymbol} /></Tabs.Panel>
                <Tabs.Panel id={TABS.SNAPSHOTS}><SnapshotsTab snapshots={snapshots[currentSymbol] || []} currencySymbol={selectedCurrency} /></Tabs.Panel>
                <Tabs.Panel id={TABS.METHODOLOGY}><PlanAndSteps stockSymbol={currentSymbol} plan={analysisPlan} steps={executionLog} onRetry={handleRetryAnalysis} consolidatedSources={consolidatedSources} analysisResult={analysisResult} /></Tabs.Panel>
                <Tabs.Panel id={TABS.QUANT_FORECAST}><SidekickAgentCard title="Quantitative Forecast" icon={<ChartBarIcon className="h-5 w-5" />} isLoading={agentStatuses.quantitative.isLoading} error={agentStatuses.quantitative.error}><QuantitativeAgentCard result={state.quantitativeAnalysis} /></SidekickAgentCard></Tabs.Panel>
                <Tabs.Panel id={TABS.TECHNICALS}><SidekickAgentCard title="Technical Analysis" icon={<ScaleIcon className="h-5 w-5" />} isLoading={agentStatuses.live_market_data.isLoading} error={agentStatuses.live_market_data.error}><TechnicalAgentCard /></SidekickAgentCard></Tabs.Panel>
                <Tabs.Panel id={TABS.BEAR_CASE}><SidekickAgentCard title="Contrarian Case" icon={<ShieldExclamationIcon className="h-5 w-5" />} isLoading={agentStatuses.contrarian.isLoading} error={agentStatuses.contrarian.error}><ContrarianAgentCard /></SidekickAgentCard></Tabs.Panel>
                <Tabs.Panel id={TABS.ESG}><SidekickAgentCard title="ESG Analysis" icon={<LeafIcon className="h-5 w-5" />} isLoading={agentStatuses.esg.isLoading} error={agentStatuses.esg.error}><EsgAgentCard result={state.esgAnalysis} /></SidekickAgentCard></Tabs.Panel>
                <Tabs.Panel id={TABS.MACRO}><SidekickAgentCard title="Macroeconomic Analysis" icon={<GlobeAltIcon className="h-5 w-5" />} isLoading={agentStatuses.macro.isLoading} error={agentStatuses.macro.error}><MacroAgentCard result={state.macroAnalysis} /></SidekickAgentCard></Tabs.Panel>
                <Tabs.Panel id={TABS.MARKET_INTEL}><SidekickAgentCard title="Market Intelligence" icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />} isLoading={agentStatuses.market_intel.isLoading} error={agentStatuses.market_intel.error}><MarketIntelligenceAgentCard result={state.marketIntelligenceAnalysis} /></SidekickAgentCard></Tabs.Panel>
                <Tabs.Panel id={TABS.LEADERSHIP}><SidekickAgentCard title="Leadership Team" icon={<UserGroupIcon className="h-5 w-5" />} isLoading={agentStatuses.leadership.isLoading} error={agentStatuses.leadership.error}><LeadershipAgentCard result={state.leadershipAnalysis} /></SidekickAgentCard></Tabs.Panel>
                <Tabs.Panel id={TABS.COMPETITION}><SidekickAgentCard title="Competitive Landscape" icon={<TrophyIcon className="h-5 w-5" />} isLoading={agentStatuses.competitive.isLoading} error={agentStatuses.competitive.error}><CompetitiveAgentCard result={state.competitiveAnalysis} stockSymbol={currentSymbol} calculatedMetrics={calculatedMetrics} currencySymbol={selectedCurrency} /></SidekickAgentCard></Tabs.Panel>
                <Tabs.Panel id={TABS.SECTOR}><SidekickAgentCard title="Sector Outlook" icon={<BuildingOfficeIcon className="h-5 w-5" />} isLoading={agentStatuses.sector.isLoading} error={agentStatuses.sector.error}><SectorAgentCard result={state.sectorAnalysis} /></SidekickAgentCard></Tabs.Panel>
                <Tabs.Panel id={TABS.CALENDAR}><SidekickAgentCard title="Corporate Calendar" icon={<CalendarDaysIcon className="h-5 w-5" />} isLoading={agentStatuses.calendar.isLoading} error={agentStatuses.calendar.error}><CorporateCalendarAgentCard result={state.corporateCalendarAnalysis} /></SidekickAgentCard></Tabs.Panel>
            </Tabs.Panels>
        </Tabs.Group>
    </div>
  );
};
