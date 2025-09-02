import React, { useMemo } from 'react';
import { StockAnalysis, EsgAnalysis, MacroAnalysis, NewsAnalysis, LeadershipAnalysis, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, ExecutionStep, CalculatedMetric, GroundingSource } from '../types';
import { FinancialAdvisorIcon, LeafIcon, GlobeAltIcon, NewspaperIcon, UserGroupIcon, ChatBubbleLeftRightIcon, TrophyIcon, BuildingOfficeIcon, CalendarDaysIcon, SparklesIcon } from './IconComponents';
import { ResultDisplay } from './ResultDisplay';
import { FinancialAdvisorLoader } from './FinancialAdvisorLoader';
import { SidekickAgentCard } from './SidekickAgentCard';
import { EsgAgentCard } from './esg/EsgAgentCard';
import { MacroAgentCard } from './macro/MacroAgentCard';
import { NewsAgentCard } from './news/NewsAgentCard';
import { LeadershipAgentCard } from './leadership/LeadershipAgentCard';
import { CompetitiveAgentCard } from './competitive/CompetitiveAgentCard';
import { SectorAgentCard } from './sector/SectorAgentCard';
import { CorporateCalendarAgentCard } from './calendar/CorporateCalendarAgentCard';
import { ScenarioPlanner } from './scenario/ScenarioPlanner';
import { CollapsibleSection } from './CollapsibleSection';
import { Tabs } from './Tabs';
import { AgentKey } from './AnalysisConfiguration';
import { AnalysisPhase } from '../../App';
import { PlanAndSteps } from './PlanAndSteps';

interface AgentStatus { isLoading: boolean; error: string | null; }

interface TabbedAnalysisProps {
  currentSymbol: string;
  analysisResult: StockAnalysis | null;
  esgAnalysis: EsgAnalysis | null;
  macroAnalysis: MacroAnalysis | null;
  newsAnalysis: NewsAnalysis | null;
  leadershipAnalysis: LeadershipAnalysis | null;
  competitiveAnalysis: CompetitiveAnalysis | null;
  sectorAnalysis: SectorAnalysis | null;
  corporateCalendarAnalysis: CorporateCalendarAnalysis | null;
  currencySymbol: string;
  onRetry: () => void;
  enabledAgents: Record<AgentKey, boolean> | null;
  analysisPhase: AnalysisPhase;
  agentStatuses: Record<string, AgentStatus>;
  executionLog: ExecutionStep[];
  analysisPlan: string | null;
  onRetryStep: () => void;
  calculatedMetrics: Record<string, CalculatedMetric>;
}

const TABS = {
    ANALYSIS: 'Analysis',
    METHODOLOGY: 'Methodology & Sources',
    ESG: 'ESG',
    MACRO: 'Macro',
    NEWS: 'News',
    LEADERSHIP: 'Leadership',
    COMPETITION: 'Competition',
    SECTOR: 'Sector',
    CALENDAR: 'Calendar',
};

export const TabbedAnalysis: React.FC<TabbedAnalysisProps> = (props) => {
  const { currentSymbol, analysisResult, currencySymbol, onRetry, analysisPhase, agentStatuses, enabledAgents, executionLog, analysisPlan, onRetryStep, calculatedMetrics } = props;
  
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

  return (
    <div className="animate-fade-in mt-6">
        <Tabs.Group defaultTab={TABS.ANALYSIS}>
            <Tabs.List>
                <Tabs.Tab id={TABS.ANALYSIS} data-test="analysis-tab-main">
                    <div className="flex items-center gap-2"><FinancialAdvisorIcon className="h-5 w-5" /> Overall Analysis</div>
                </Tabs.Tab>
                <Tabs.Tab id={TABS.METHODOLOGY} data-test="analysis-tab-methodology">
                    <div className="flex items-center gap-2"><SparklesIcon className="h-5 w-5" /> Methodology & Sources</div>
                </Tabs.Tab>
                 <Tabs.Tab id={TABS.ESG} data-test="analysis-tab-esg">
                    <div className="flex items-center gap-2"><LeafIcon className="h-5 w-5" /> ESG</div>
                </Tabs.Tab>
                <Tabs.Tab id={TABS.MACRO} data-test="analysis-tab-macro">
                    <div className="flex items-center gap-2"><GlobeAltIcon className="h-5 w-5" /> Macroeconomic</div>
                </Tabs.Tab>
                <Tabs.Tab id={TABS.NEWS} data-test="analysis-tab-news">
                    <div className="flex items-center gap-2"><NewspaperIcon className="h-5 w-5" /> Recent News</div>
                </Tabs.Tab>
                <Tabs.Tab id={TABS.LEADERSHIP} data-test="analysis-tab-leadership">
                    <div className="flex items-center gap-2"><UserGroupIcon className="h-5 w-5" /> Leadership</div>
                </Tabs.Tab>
                <Tabs.Tab id={TABS.COMPETITION} data-test="analysis-tab-competition">
                    <div className="flex items-center gap-2"><TrophyIcon className="h-5 w-5" /> Competition</div>
                </Tabs.Tab>
                <Tabs.Tab id={TABS.SECTOR} data-test="analysis-tab-sector">
                    <div className="flex items-center gap-2"><BuildingOfficeIcon className="h-5 w-5" /> Sector</div>
                </Tabs.Tab>
                <Tabs.Tab id={TABS.CALENDAR} data-test="analysis-tab-calendar">
                    <div className="flex items-center gap-2"><CalendarDaysIcon className="h-5 w-5" /> Calendar</div>
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panels>
                <Tabs.Panel id={TABS.ANALYSIS}>
                    {isLoading && !analysisResult ? (
                         <FinancialAdvisorLoader
                            stockSymbol={currentSymbol}
                            analysisPhase={analysisPhase}
                            agentStatuses={agentStatuses}
                            enabledAgents={enabledAgents}
                        />
                    ) : analysisResult ? (
                        <>
                            <ResultDisplay
                                result={analysisResult}
                                esgAnalysis={props.esgAnalysis}
                                macroAnalysis={props.macroAnalysis}
                                newsAnalysis={props.newsAnalysis}
                                leadershipAnalysis={props.leadershipAnalysis}
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
                     {anyError && analysisResult && (
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
                <Tabs.Panel id={TABS.METHODOLOGY}>
                    <PlanAndSteps 
                        stockSymbol={currentSymbol}
                        plan={analysisPlan} 
                        steps={executionLog}
                        onRetry={onRetryStep}
                        consolidatedSources={consolidatedSources}
                    />
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
                <Tabs.Panel id={TABS.NEWS}>
                     <SidekickAgentCard title="Recent News" icon={<NewspaperIcon className="h-5 w-5" />} isLoading={agentStatuses.news.isLoading} error={agentStatuses.news.error}>
                        <NewsAgentCard result={props.newsAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                <Tabs.Panel id={TABS.LEADERSHIP}>
                    <SidekickAgentCard title="Leadership Team" icon={<UserGroupIcon className="h-5 w-5" />} isLoading={agentStatuses.leadership.isLoading} error={agentStatuses.leadership.error}>
                        <LeadershipAgentCard result={props.leadershipAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
                <Tabs.Panel id={TABS.COMPETITION}>
                    <SidekickAgentCard title="Competitive Landscape" icon={<TrophyIcon className="h-5 w-5" />} isLoading={agentStatuses.competitive.isLoading} error={agentStatuses.competitive.error}>
                        <CompetitiveAgentCard result={props.competitiveAnalysis} stockSymbol={currentSymbol} calculatedMetrics={calculatedMetrics} />
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
