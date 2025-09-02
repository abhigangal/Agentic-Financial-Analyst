import React from 'react';
import { StockAnalysis, EsgAnalysis, MacroAnalysis, NewsAnalysis, LeadershipAnalysis, CalculatedMetric } from '../types';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ScaleIcon, DocumentTextIcon, LightBulbIcon, ExclamationTriangleIcon, LinkIcon, SparklesIcon, LeafIcon, GlobeAltIcon, ClockIcon, UserGroupIcon, NewspaperIcon, InformationCircleIcon, ClipboardDocumentListIcon } from './IconComponents';
import { Tooltip } from './Tooltip';
import { VisualGauge } from './VisualGauge';
import { KeyTakeaways } from './KeyTakeaways';
import { RiskDashboard } from './risk/RiskDashboard';
import { Tabs } from './Tabs';
import { CollapsibleSection } from './CollapsibleSection';
import { DebateLog } from './DebateLog';
import { MetricWithProof } from './MetricWithProof';

interface ResultDisplayProps {
  result: StockAnalysis;
  esgAnalysis: EsgAnalysis | null;
  macroAnalysis: MacroAnalysis | null;
  newsAnalysis: NewsAnalysis | null;
  leadershipAnalysis: LeadershipAnalysis | null;
  currencySymbol: string;
  calculatedMetrics: Record<string, CalculatedMetric>;
}

const sentimentColors = {
  'Strong Bullish': 'text-green-800 bg-green-100 border border-green-200 dark:text-green-300 dark:bg-green-900/50 dark:border-green-700/50',
  'Bullish': 'text-emerald-800 bg-emerald-100 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/50 dark:border-emerald-700/50',
  'Neutral': 'text-slate-700 bg-slate-200 border border-slate-300 dark:text-slate-200 dark:bg-slate-700 dark:border-slate-600',
  'Bearish': 'text-amber-800 bg-amber-100 border border-amber-200 dark:text-amber-300 dark:bg-amber-900/50 dark:border-amber-700/50',
  'Strong Bearish': 'text-red-800 bg-red-100 border border-red-200 dark:text-red-300 dark:bg-red-900/50 dark:border-red-700/50',
  'Strong Buy': 'text-green-800 bg-green-100 border border-green-200 dark:text-green-300 dark:bg-green-900/50 dark:border-green-700/50',
  'Buy': 'text-emerald-800 bg-emerald-100 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/50 dark:border-emerald-700/50',
  'Hold': 'text-slate-700 bg-slate-200 border border-slate-300 dark:text-slate-200 dark:bg-slate-700 dark:border-slate-600',
  'Sell': 'text-amber-800 bg-amber-100 border border-amber-200 dark:text-amber-300 dark:bg-amber-900/50 dark:border-amber-700/50',
  'Strong Sell': 'text-red-800 bg-red-100 border border-red-200 dark:text-red-300 dark:bg-red-900/50 dark:border-red-700/50',
  'N/A': 'text-slate-600 bg-slate-100 border border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700',
};

const confidenceColors: Record<string, string> = {
    high: 'text-green-800 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/50 dark:border-green-700/50',
    moderate: 'text-yellow-800 bg-yellow-100 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-700/50',
    low: 'text-red-800 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/50 dark:border-red-700/50',
}

const getSentimentColor = (sentiment: keyof typeof sentimentColors | 'N/A') => {
  return sentimentColors[sentiment] || sentimentColors['N/A'];
};

const getConfidenceColor = (confidence: string) => {
    return confidenceColors[confidence] || sentimentColors['N/A'];
};


const formatPrice = (price: number | null, currencySymbol: string) => {
    return price === null ? 'N/A' : `${currencySymbol}${price.toFixed(2)}`;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null; 
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return null;
    }
};

const KeyInsight: React.FC<{ title: string; value: React.ReactNode; sentiment?: keyof typeof sentimentColors | 'N/A'; isProminent?: boolean; naReason?: string; tooltipText?: string }> = ({ title, value, sentiment, isProminent = false, naReason, tooltipText }) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-gray-200 text-center h-full dark:bg-slate-700/50 dark:border-slate-600`}>
        <div className="flex items-center gap-1 mb-1">
            <p className="text-xs sm:text-sm text-slate-500 whitespace-nowrap dark:text-slate-400">{title}</p>
            {tooltipText && (
                <Tooltip text={tooltipText}>
                    <InformationCircleIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 cursor-help" />
                </Tooltip>
            )}
        </div>
        <div className={`font-bold ${sentiment ? getSentimentColor(sentiment) + ' px-2.5 py-1 rounded-md text-base sm:text-lg' : 'text-slate-800 dark:text-slate-200'} ${isProminent ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
            {value}
        </div>
        {value === 'N/A' && naReason && (
            <Tooltip text={naReason}>
                <p className="text-xs text-blue-600 hover:text-blue-500 mt-1 cursor-help underline decoration-dotted dark:text-blue-400 dark:hover:text-blue-300">(Why?)</p>
            </Tooltip>
        )}
    </div>
);


const DetailSection: React.FC<{ title: string, content: string | null | undefined, icon?: React.ReactNode }> = ({ title, content, icon }) => {
    if (!content) return null;
    return (
        <div className="mt-6">
            <h3 className="flex items-center text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                <span className="mr-2.5">{icon}</span>
                {title}
            </h3>
            <div className="prose prose-sm text-slate-600 max-w-none space-y-3 leading-relaxed whitespace-pre-line dark:text-slate-300">
                <p>{content}</p>
            </div>
        </div>
    );
};

const sentimentSegments = [
    { label: 'Strong Bearish', color: 'bg-red-300', textColor: 'text-red-800' },
    { label: 'Bearish', color: 'bg-orange-300', textColor: 'text-orange-800' },
    { label: 'Neutral', color: 'bg-gray-300', textColor: 'text-gray-800' },
    { label: 'Bullish', color: 'bg-teal-300', textColor: 'text-teal-800' },
    { label: 'Strong Bullish', color: 'bg-green-300', textColor: 'text-green-800' },
];

const sentimentMap: {[key: string]: number} = {
    'Strong Bearish': 0, 'Bearish': 1, 'Neutral': 2, 'Bullish': 3, 'Strong Bullish': 4
};

const PriceChange: React.FC<{ change: number | null; percentage: string | null; currencySymbol: string; }> = ({ change, percentage, currencySymbol }) => {
    if (change === null || percentage === null) return null;
    const isPositive = change >= 0;
    const colorClass = isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

    return (
        <div className={`flex items-center gap-2 text-sm font-semibold ${colorClass}`}>
            {isPositive ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" /> }
            <span>{isPositive ? '+' : ''}{formatPrice(change, currencySymbol)} ({percentage})</span>
        </div>
    );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, esgAnalysis, macroAnalysis, newsAnalysis, leadershipAnalysis, currencySymbol, calculatedMetrics }) => {
  const formattedDate = formatDate(result.last_updated);
  const sentimentValue = sentimentMap[result.overall_sentiment];
  
  const TABS = {
      OVERVIEW_RISK: 'Overview & Risk',
      FINANCIALS: 'Financials',
      STRATEGY: 'Strategy',
      CONTEXT_SOURCES: 'AI Context & Sources'
  };
  
  return (
    <div className="animate-fade-in-fast">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
            {/* These details are now shown in the App.tsx header for the tabbed view */}
        </div>
        <div className="text-right shrink-0">
             <p className="text-4xl font-bold text-slate-900 dark:text-slate-50">{formatPrice(result.current_price, currencySymbol)}</p>
             <div className="flex justify-end mt-1.5">
                <PriceChange change={result.price_change} percentage={result.price_change_percentage} currencySymbol={currencySymbol}/>
             </div>
             {formattedDate && (
                 <div className="flex items-center justify-end gap-1.5 mt-1 text-xs text-gray-500 dark:text-slate-400">
                     <ClockIcon className="h-3 w-3" />
                     <span>Last Updated: {formattedDate}</span>
                 </div>
             )}
        </div>
      </div>
      
      <Tabs.Group>
        <Tabs.List>
            <Tabs.Tab data-test="tab-overview-risk" id={TABS.OVERVIEW_RISK}><div className="flex items-center gap-2"><DocumentTextIcon /> Overview & Risk</div></Tabs.Tab>
            <Tabs.Tab data-test="tab-financials" id={TABS.FINANCIALS}><div className="flex items-center gap-2"><ScaleIcon /> Financials</div></Tabs.Tab>
            <Tabs.Tab data-test="tab-strategy" id={TABS.STRATEGY}><div className="flex items-center gap-2"><LightBulbIcon /> Strategy</div></Tabs.Tab>
            <Tabs.Tab data-test="tab-context-sources" id={TABS.CONTEXT_SOURCES}><div className="flex items-center gap-2"><SparklesIcon /> AI Context & Sources</div></Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
            <Tabs.Panel id={TABS.OVERVIEW_RISK}>
                <KeyTakeaways 
                    financialAnalysis={result}
                    esgAnalysis={esgAnalysis}
                    newsAnalysis={newsAnalysis}
                    leadershipAnalysis={leadershipAnalysis}
                    currencySymbol={currencySymbol}
                />
                
                {result.chiefAnalystCritique && (
                    <div className="my-6">
                        <CollapsibleSection title="Chief Analyst's Debate Log" icon={<SparklesIcon />}>
                            <DebateLog critique={result.chiefAnalystCritique} />
                        </CollapsibleSection>
                    </div>
                )}

                <div className="mt-6 bg-gray-50/50 border border-gray-200/80 rounded-xl p-4 dark:bg-slate-800/50 dark:border-slate-700/60">
                    <h3 className="text-base font-semibold text-center text-slate-600 dark:text-slate-300 mb-4">Key Insights</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KeyInsight 
                            title="Recommendation" 
                            value={result.recommendation} 
                            sentiment={result.recommendation} 
                            naReason={result.na_justifications?.['recommendation']} 
                            tooltipText="The overall action suggested by the AI based on its complete analysis (e.g., Buy, Hold, Sell)."
                        />
                        <KeyInsight 
                            title="Short-Term Target"
                            value={<MetricWithProof metric={result.target_price.short_term} currencySymbol={currencySymbol} />}
                            isProminent 
                            naReason={result.na_justifications?.['target_price.short_term']}
                            tooltipText="The price the AI expects the stock to reach in the short term (typically under 1 year)."
                        />
                        <KeyInsight 
                            title="Long-Term Target" 
                            value={<MetricWithProof metric={result.target_price.long_term} currencySymbol={currencySymbol} />}
                            isProminent 
                            naReason={result.na_justifications?.['target_price.long_term']}
                            tooltipText="The price the AI expects the stock to reach in the long term (typically 1-3 years)."
                        />
                        <KeyInsight 
                            title="Stop Loss" 
                            value={<MetricWithProof metric={result.stop_loss} currencySymbol={currencySymbol} />}
                            isProminent 
                            naReason={result.na_justifications?.['stop_loss']}
                            tooltipText="A suggested price to sell the stock to limit potential losses if the price moves against you."
                        />
                        <div className="col-span-2 lg:col-span-4 p-3 rounded-lg bg-white border border-gray-200 text-center h-full dark:bg-slate-700/50 dark:border-slate-600">
                             <div className="flex items-center justify-center gap-1 mb-1">
                                <p className="text-xs sm:text-sm text-slate-500 whitespace-nowrap dark:text-slate-400">Confidence</p>
                                <Tooltip text={result.justification.confidence_rationale}>
                                    <InformationCircleIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 cursor-help" />
                                </Tooltip>
                             </div>
                             <div className={`font-bold capitalize ${getConfidenceColor(result.confidence_score)} px-2.5 py-1 rounded-md text-base sm:text-lg`}>
                                {result.confidence_score}
                             </div>
                        </div>

                        {sentimentValue !== undefined && result.overall_sentiment !== 'N/A' && (
                            <div className="col-span-2 lg:col-span-4 p-4 rounded-lg bg-white border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600">
                                <VisualGauge label="Overall Sentiment" value={sentimentValue} segments={sentimentSegments} />
                            </div>
                        )}
                    </div>
                </div>

                {result.risk_analysis && <RiskDashboard analysis={result.risk_analysis} />}
            </Tabs.Panel>
            
            <Tabs.Panel id={TABS.FINANCIALS}>
                <div className="space-y-6">
                    <DetailSection title="Profit & Loss Analysis" content={result.justification.profit_and_loss_summary} icon={<ClipboardDocumentListIcon />} />
                    <DetailSection title="Balance Sheet Analysis" content={result.justification.balance_sheet_summary} icon={<ClipboardDocumentListIcon />} />
                    <DetailSection title="Cash Flow Analysis" content={result.justification.cash_flow_summary} icon={<ClipboardDocumentListIcon />} />
                    <DetailSection title="Financial Ratios" content={result.justification.financial_ratios_summary} icon={<ScaleIcon />} />
                    <DetailSection title="Ownership Summary" content={result.justification.ownership_summary} icon={<UserGroupIcon />} />
                    <DetailSection title="Technical Summary" content={result.justification.technical_summary} icon={result.justification.technical_summary?.toLowerCase().includes('bullish') || result.justification.technical_summary?.toLowerCase().includes('uptrend') ? <ArrowTrendingUpIcon/> : <ArrowTrendingDownIcon/>} />
                </div>
            </Tabs.Panel>

            <Tabs.Panel id={TABS.STRATEGY}>
                <div className="space-y-6">
                    <DetailSection title="Overall Recommendation" content={result.justification.overall_recommendation} icon={<DocumentTextIcon />} />
                    <DetailSection title="When to Sell (Exit Strategy)" content={result.justification.exit_strategy} icon={<ExclamationTriangleIcon />} />
                </div>
            </Tabs.Panel>
            
            <Tabs.Panel id={TABS.CONTEXT_SOURCES}>
                <div className="space-y-6">
                    <DetailSection title="How to Get Better Results" content={result.justification.improvement_suggestions} icon={<LightBulbIcon />} />
                    <DetailSection title="Leadership Context" content={result.contextual_inputs.leadership_summary} icon={<UserGroupIcon />} />
                    <DetailSection title="News Context" content={result.contextual_inputs.news_summary} icon={<NewspaperIcon />} />
                    <DetailSection title="ESG Context" content={result.contextual_inputs.esg_summary} icon={<LeafIcon />} />
                    <DetailSection title="Macroeconomic Context" content={result.contextual_inputs.macroeconomic_summary} icon={<GlobeAltIcon />} />
                </div>
                {result.sources && result.sources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="flex items-center text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                        <span className="mr-2.5"><LinkIcon /></span>
                        Sources
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
                        {result.sources.map((source, index) => (
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
                  </div>
                )}
            </Tabs.Panel>
        </Tabs.Panels>
      </Tabs.Group>
    </div>
  );
};
