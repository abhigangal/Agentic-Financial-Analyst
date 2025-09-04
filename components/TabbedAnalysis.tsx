import React, { useMemo } from 'react';
import { StockAnalysis, EsgAnalysis, MacroAnalysis, NewsAnalysis, LeadershipAnalysis, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, ExecutionStep, CalculatedMetric, GroundingSource, MarketSentimentAnalysis, InstitutionalHolder } from '../types';
import { FinancialAdvisorIcon, LeafIcon, GlobeAltIcon, NewspaperIcon, UserGroupIcon, ChatBubbleLeftRightIcon, TrophyIcon, BuildingOfficeIcon, CalendarDaysIcon, SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon, LinkIcon, UserCircleIcon as UserIcon } from './IconComponents';
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
import { VisualGauge } from './VisualGauge';

const sentimentGaugeSegments = [
    { label: 'Negative', color: 'bg-red-200', textColor: 'text-red-800 dark:text-red-300' },
    { label: 'Neutral', color: 'bg-gray-200', textColor: 'text-gray-800 dark:text-gray-300' },
    { label: 'Positive', color: 'bg-green-200', textColor: 'text-green-800 dark:text-green-300' },
];

const sentimentGaugeMap: { [key: string]: number } = {
    'Negative': 0, 'Neutral': 1, 'Positive': 2
};

const MarketSentimentResultDisplay: React.FC<{ result: MarketSentimentAnalysis }> = ({ result }) => {
    const { overall_sentiment, sentiment_summary, key_positive_points, key_negative_points, major_holders, sources } = result;
    const sentimentValue = sentimentGaugeMap[overall_sentiment];

    return (
        <div className="animate-fade-in space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Market Sentiment</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Analysis of investor sentiment and ownership.</p>
                {sentimentValue !== undefined && overall_sentiment !== 'N/A' && (
                    <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-200/80 dark:bg-slate-700/50 dark:border-slate-600/80">
                        <VisualGauge label="Overall Sentiment" value={sentimentValue} segments={sentimentGaugeSegments} />
                    </div>
                )}
            </div>
            <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
                <p>{sentiment_summary}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Key Positive Points</h4>
                    <ul className="space-y-2">
                        {key_positive_points.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Key Negative Points</h4>
                    <ul className="space-y-2">
                        {key_negative_points.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
             {major_holders && major_holders.length > 0 && (
                <CollapsibleSection title="Major Institutional Holders" icon={<UserIcon />}>
                    <div className="columns-1 md:columns-2 gap-x-6">
                    {major_holders.map((holder: InstitutionalHolder, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700/50 break-inside-avoid">
                            <span className="text-sm text-slate-700 dark:text-slate-300">{holder.name}</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{holder.stake}</span>
                        </div>
                    ))}
                    </div>
                </CollapsibleSection>
             )}
            {sources && sources.length > 0 && (
                <CollapsibleSection title="Sources" icon={<LinkIcon />}>
                    <ul className="list-disc pl-5 space-y-2 prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
                    {sources.map((source, index) => (
                        <li key={index}>
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 hover:underline break-all dark:text-blue-400 dark:hover:text-blue-300" title={source.uri}>
                                {source.title || source.uri}
                            </a>
                        </li>
                    ))}
                    </ul>
                </CollapsibleSection>
            )}
        </div>
    );
};

const MarketSentimentAgentCard: React.FC<{ result: MarketSentimentAnalysis | null }> = ({ result }) => {
  if (result) {
    return <MarketSentimentResultDisplay result={result} />;
  }
  return null;
};

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
  marketSentimentAnalysis: MarketSentimentAnalysis | null;
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
    SENTIMENT: 'Sentiment',
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
                <Tabs.Tab id={TABS.SENTIMENT} data-test="analysis-tab-sentiment">
                    <div className="flex items-center gap-2"><ChatBubbleLeftRightIcon className="h-5 w-5" /> Sentiment</div>
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panels>
                <Tabs.Panel id={TABS.ANALYSIS}>
                    {isLoading && !analysisResult ? (
                         <FinancialAdvisorLoader
                            stockSymbol={currentSymbol}
                            analysisPhase={analysisPhase}
                            executionLog={executionLog}
                        />
                    ) : analysisResult ? (
                        <>
                            <ResultDisplay
                                result={analysisResult}
                                esgAnalysis={props.esgAnalysis}
                                macroAnalysis={props.macroAnalysis}
                                newsAnalysis={props.newsAnalysis}
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
                <Tabs.Panel id={TABS.SENTIMENT}>
                    <SidekickAgentCard title="Market Sentiment" icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />} isLoading={agentStatuses.sentiment.isLoading} error={agentStatuses.sentiment.error}>
                        <MarketSentimentAgentCard result={props.marketSentimentAnalysis} />
                    </SidekickAgentCard>
                </Tabs.Panel>
            </Tabs.Panels>
        </Tabs.Group>
    </div>
  );
};