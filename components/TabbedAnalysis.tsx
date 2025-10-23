import React, { useMemo } from 'react';
import { StockAnalysis, EsgAnalysis, MacroAnalysis, LeadershipAnalysis, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, ExecutionStep, CalculatedMetric, GroundingSource, MarketIntelligenceAnalysis, TechnicalAnalysis, ContrarianAnalysis, RawFinancials, Snapshot, QuantitativeAnalysis } from '../types';
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
import { AgentKey } from '../types';
import { AnalysisPhase, AnalysisCacheItem } from '../../App';
import { PlanAndSteps } from './PlanAndSteps';
import { ChartsTab } from './charts/ChartsTab';
import { FinancialsTab } from './financials/FinancialsTab';
import { SnapshotsTab } from './snapshots/SnapshotsTab';
import { QuantitativeAgentCard } from './quantitative/QuantitativeAgentCard';

const TechnicalResultDisplay: React.FC<{ result: TechnicalAnalysis }> = ({ result }) => {
    return (
        <div className="animate-fade-in space-y-4">
             <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Technical Analysis</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Chart patterns, indicators, and key price levels.</p>
            </div>
             <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
                <p>{result.summary}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="text-center bg-gray-100/80 border border-gray-200/80 p-3 rounded-lg dark:bg-slate-700/50 dark:border-slate-600">
                    <p className="text-xs text-slate-500 mb-1 dark:text-slate-400">Trend</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{result.trend}</p>
                </div>
                 <div className="text-center bg-gray-100/80 border border-gray-200/80 p-3 rounded-lg dark:bg-slate-700/50 dark:border-slate-600">
                    <p className="text-xs text-slate-500 mb-1 dark:text-slate-400">Support</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{result.support_level}</p>
                </div>
                 <div className="text-center bg-gray-100/80 border border-gray-200/80 p-3 rounded-lg dark:bg-slate-700/50 dark:border-slate-600">
                    <p className="text-xs text-slate-500 mb-1 dark:text-slate-400">Resistance</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">{result.resistance_level}</p>
                </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-500/30">
                <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-1">Moving Averages</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200">{result.moving_averages_summary}</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-500/30">
                <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-1">Indicators (RSI, MACD)</h4>
                <p className="text-sm text-slate-700 dark:text-slate-200">{result.indicators_summary}</p>
            </div>
        </div>
    );
};

const ContrarianResultDisplay: React.FC<{ result: ContrarianAnalysis }> = ({ result }) => {
    return (
        <div className="animate-fade-in space-y-4">
             <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Contrarian Case ("Red Team")</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Challenges the consensus view and identifies overlooked risks.</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-500/30">
                <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">Bear Case Summary</h4>
                <p className="prose prose-sm max-w-none text-red-900/80 dark:text-red-200/90">{result.bear_case_summary}</p>
            </div>
             <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Key Contrarian Points</h4>
                <ul className="space-y-2">
                    {result.key_contrarian_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <ShieldExclamationIcon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


const TechnicalAgentCard: React.FC<{ result: TechnicalAnalysis | null }> = ({ result }) => {
  if (result) {
    return <TechnicalResultDisplay result={result} />;
  }
  return null;
};

const ContrarianAgentCard: React.FC<{ result: ContrarianAnalysis | null }> = ({ result }) => {
  if (result) {
    return <ContrarianResultDisplay result={result} />;
  }
  return null;
};


interface AgentStatus { isLoading: boolean; error: string | null; }

interface TabbedAnalysisProps {
  currentSymbol: string;
  analysisResult: StockAnalysis | null;
  esgAnalysis: EsgAnalysis | null;
  macroAnalysis: MacroAnalysis | null;
  marketIntelligenceAnalysis: MarketIntelligenceAnalysis | null;
  leadershipAnalysis: LeadershipAnalysis | null;
  competitiveAnalysis: CompetitiveAnalysis | null;
  sectorAnalysis: SectorAnalysis | null;
  corporateCalendarAnalysis: CorporateCalendarAnalysis | null;
  technicalAnalysis: TechnicalAnalysis | null;
  contrarianAnalysis: ContrarianAnalysis | null;
  quantitativeAnalysis: QuantitativeAnalysis | null;
  currencySymbol: string;
  onRetry: () => void;
  enabledAgents: Record<AgentKey, boolean> | null;
  analysisPhase: AnalysisPhase;
  agentStatuses: Record<string, AgentStatus>;
  executionLog: ExecutionStep[];
  analysisPlan: string | null;
  onRetryStep: () => void;
  rawFinancials: RawFinancials | null;
  calculatedMetrics: Record<string, CalculatedMetric>;
  snapshots: Snapshot[];
  isCachedView: boolean;
  onRefresh: () => void;
  analysisCache: Record<string, AnalysisCacheItem>;
}

const TABS = {
    ANALYSIS: 'Analysis',
    CHARTS: 'Charts',
    FINANCIALS: 'Financials',
    SNAPSHOTS: 'Snapshots',
    METHODOLOGY: 'Methodology',
    QUANT_FORECAST: 'Quant Forecast',
    ESG: 'ESG',
    MACRO: 'Macro',
    MARKET_INTEL: 'Market Intel',
    LEADERSHIP: 'Leadership',
    COMPETITION: 'Competition',
    SECTOR: 'Sector',
    CALENDAR: 'Calendar',
    TECHNICALS: 'Technicals',
    BEAR_CASE: 'Bear Case',
};

export const TabbedAnalysis: React.FC<TabbedAnalysisProps> = (props) => {
  const { currentSymbol, analysisResult, currencySymbol, onRetry, analysisPhase, agentStatuses, enabledAgents, executionLog, analysisPlan, onRetryStep, rawFinancials, calculatedMetrics, technicalAnalysis, snapshots, isCachedView, onRefresh, analysisCache, quantitativeAnalysis } = props;
  
  const isLoading = analysisPhase !== 'IDLE' && analysisPhase !== 'COMPLETE' && analysisPhase !== 'ERROR' && analysisPhase !== 'PAUSED';
  const financialError = agentStatuses.financial.error;
  const anyError = Object.values(agentStatuses).some(s => s.error);

  const consolidatedSources = useMemo(() => {
    const allSources = executionLog.flatMap(step => step.sources || []);
    const uniqueSources = allSources.reduce((acc, current) => {
        if (!acc.find(item => item.uri === current.uri)) {
            acc.push(current);
        }
        return acc;
    }, [] as GroundingSource[]);
    return uniqueSources;
  }, [executionLog]);
  
  const cachedTimestamp = useMemo(() => {
      if (!isCachedView || !analysisCache[currentSymbol]) return null;
      return analysisCache[currentSymbol].timestamp;
  }, [isCachedView, analysisCache, currentSymbol]);

  return (
    <div className="animate-fade-in mt-6">
        {isCachedView && cachedTimestamp && (
            <div className="mb-6 p-4 bg-blue-50/70 border border-blue-200 rounded-xl dark:bg-blue-900/20 dark:border-blue-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <InformationCircleIcon className="h-6 w-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        Showing cached data from {new Date(cachedTimestamp).toLocaleTimeString()}.
                    </p>
                </div>
                <button onClick={onRefresh} className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-600 font-semibold rounded-md shadow-sm hover:bg-blue-50 border border-blue-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600">
                    <ArrowPathIcon className="h-4 w-4" />
                    Refresh
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
                    {isLoading && !analysisResult ? (
                         <AgenticNexusLoader stockSymbol={currentSymbol} analysisPhase={analysisPhase} executionLog={executionLog} />
                    ) : analysisResult ? (
                        <>
                            <ResultDisplay
                                result={analysisResult}
                                esgAnalysis={props.esgAnalysis}
                                macroAnalysis={props.macroAnalysis}
                                marketIntelligenceAnalysis={props.marketIntelligenceAnalysis}
                                leadershipAnalysis={props.leadershipAnalysis}
                                competitiveAnalysis={props.competitiveAnalysis}
                                currencySymbol={currencySymbol}
                                calculatedMetrics={calculatedMetrics}
                            />
                             <div className="mt-8">
                                <CollapsibleSection title="What-If Scenario Planner" icon={<ChatBubbleLeftRightIcon />}>
                                    <ScenarioPlanner 
                                    stockName={analysisResult.share_name} 
                                    financialSummary={analysisResult.justification.nutshell_summary}
                                    />
                                </CollapsibleSection>
                            </div>
                        </>
                    ) : financialError ? (
                         <div className="text-center p-4">
                            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Financial Analysis Failed</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{financialError}</p>
                            <button
                                onClick={onRetry}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
                            >
                                Retry Full Analysis
                            </button>
                        </div>
                    ) : null}
                     {anyError && analysisResult && !isCachedView && (
                        <div className="text-center p-4 border-t border-gray-200 dark:border-slate-700 mt-4">
                            <p className="text-orange-600 dark:text-orange-400 font-semibold mb-2">Incomplete Analysis</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                One or more sidekick agents failed. The main analysis ran with incomplete data. Check other tabs for details.
                            </p>
                            <button
                                onClick={onRetry}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
                            >
                                Retry Full Analysis
                            </button>
                        </div>
                    )}
                </Tabs.Panel>
                 <Tabs.Panel id={TABS.CHARTS}>
                    <ChartsTab rawFinancials={rawFinancials} quantitativeAnalysis={quantitativeAnalysis} />
                </Tabs.Panel>
                <Tabs.Panel id={TABS.FINANCIALS}>
                    <FinancialsTab rawFinancials={rawFinancials} stockSymbol={currentSymbol} />
                </Tabs.Panel>
                <Tabs.Panel id={TABS.SNAPSHOTS}>
                    <SnapshotsTab snapshots={snapshots} currencySymbol={currencySymbol} />
                </Tabs.Panel>
                <Tabs.Panel id={TABS.METHODOLOGY}>
                    <PlanAndSteps 
                        stockSymbol={currentSymbol}
                        plan={analysisPlan} 
                        steps={executionLog}
                        onRetry={onRetryStep}
                        consolidatedSources={consolidatedSources}
                        analysisResult={analysisResult}
                    />
                </Tabs.Panel>
                 <Tabs.Panel id={TABS.QUANT_FORECAST}>
                    <SidekickAgentCard title="Quantitative Forecast" icon={<ChartBarIcon className="h-5 w-5" />} isLoading={agentStatuses.quantitative.isLoading} error={agentStatuses.quantitative.error}>
                        <QuantitativeAgentCard result={props.quantitativeAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                <Tabs.Panel id={TABS.TECHNICALS}>
                    {/* FIX: Removed unnecessary optional chaining `?.` as `live_market_data` is a guaranteed key in the `agentStatuses` object. */}
                    <SidekickAgentCard title="Technical Analysis" icon={<ScaleIcon className="h-5 w-5" />} isLoading={agentStatuses.live_market_data.isLoading} error={agentStatuses.live_market_data.error}>
                        <TechnicalAgentCard result={props.technicalAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                 <Tabs.Panel id={TABS.BEAR_CASE}>
                    <SidekickAgentCard title="Contrarian Case" icon={<ShieldExclamationIcon className="h-5 w-5" />} isLoading={agentStatuses.contrarian.isLoading} error={agentStatuses.contrarian.error}>
                        <ContrarianAgentCard result={props.contrarianAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                 <Tabs.Panel id={TABS.ESG}>
                    <SidekickAgentCard title="ESG Analysis" icon={<LeafIcon className="h-5 w-5" />} isLoading={agentStatuses.esg.isLoading} error={agentStatuses.esg.error}>
                        <EsgAgentCard result={props.esgAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                <Tabs.Panel id={TABS.MACRO}>
                    <SidekickAgentCard title="Macroeconomic Analysis" icon={<GlobeAltIcon className="h-5 w-5" />} isLoading={agentStatuses.macro.isLoading} error={agentStatuses.macro.error}>
                        <MacroAgentCard result={props.macroAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                <Tabs.Panel id={TABS.MARKET_INTEL}>
                     <SidekickAgentCard title="Market Intelligence" icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />} isLoading={agentStatuses.market_intel.isLoading} error={agentStatuses.market_intel.error}>
                        <MarketIntelligenceAgentCard result={props.marketIntelligenceAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                <Tabs.Panel id={TABS.LEADERSHIP}>
                    <SidekickAgentCard title="Leadership Team" icon={<UserGroupIcon className="h-5 w-5" />} isLoading={agentStatuses.leadership.isLoading} error={agentStatuses.leadership.error}>
                        <LeadershipAgentCard result={props.leadershipAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                <Tabs.Panel id={TABS.COMPETITION}>
                    <SidekickAgentCard title="Competitive Landscape" icon={<TrophyIcon className="h-5 w-5" />} isLoading={agentStatuses.competitive.isLoading} error={agentStatuses.competitive.error}>
                        <CompetitiveAgentCard 
                            result={props.competitiveAnalysis} 
                            stockSymbol={currentSymbol} 
                            calculatedMetrics={calculatedMetrics}
                            currencySymbol={currencySymbol}
                        />
                    </SidekickAgentCard>
                </Tabs.Panel>
                <Tabs.Panel id={TABS.SECTOR}>
                    <SidekickAgentCard title="Sector Outlook" icon={<BuildingOfficeIcon className="h-5 w-5" />} isLoading={agentStatuses.sector.isLoading} error={agentStatuses.sector.error}>
                        <SectorAgentCard result={props.sectorAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                 <Tabs.Panel id={TABS.CALENDAR}>
                    <SidekickAgentCard title="Corporate Calendar" icon={<CalendarDaysIcon className="h-5 w-5" />} isLoading={agentStatuses.calendar.isLoading} error={agentStatuses.calendar.error}>
                        <CorporateCalendarAgentCard result={props.corporateCalendarAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
            </Tabs.Panels>
        </Tabs.Group>
    </div>
  );
};
