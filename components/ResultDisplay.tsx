import React from 'react';
import { StockAnalysis, EsgAnalysis, MacroAnalysis, LeadershipAnalysis, CalculatedMetric, CompetitiveAnalysis, MarketIntelligenceAnalysis } from '../types';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ScaleIcon, DocumentTextIcon, LightBulbIcon, ExclamationTriangleIcon, LinkIcon, SparklesIcon, LeafIcon, GlobeAltIcon, ClockIcon, UserGroupIcon, NewspaperIcon, InformationCircleIcon, ClipboardDocumentListIcon, ChatBubbleLeftRightIcon } from './IconComponents';
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
  marketIntelligenceAnalysis: MarketIntelligenceAnalysis | null;
  leadershipAnalysis: LeadershipAnalysis | null;
  competitiveAnalysis: CompetitiveAnalysis | null;
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

const confidenceBarColors: Record<string, string> = {
    high: 'border-green-400 text-green-400 bg-green-500/10',
    moderate: 'border-yellow-400 text-yellow-400 bg-yellow-500/10',
    low: 'border-red-400 text-red-400 bg-red-500/10',
};

const getSentimentColor = (sentiment: keyof typeof sentimentColors | 'N/A') => {
  return sentimentColors[sentiment] || sentimentColors['N/A'];
};

const formatPrice = (price: number | null, currencySymbol: string) => {
    if (price === null || isNaN(price)) return 'N/A';
    // The Rupee symbol '₹' can render incorrectly in jsPDF's default fonts.
    // While this component is React, we apply the same logic for consistency with the PDF export.
    const symbolToShow = currencySymbol === '₹' ? '₹' : currencySymbol; // Keep it for display
    return `${symbolToShow}${price.toFixed(2)}`;
}

const formatPriceRange = (low: number | null, high: number | null, currency: string) => {
    if (low === null || high === null) return 'N/A';
    // Use an en dash for number ranges
    return `${formatPrice(low, currency)} – ${formatPrice(high, currency)}`;
};


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
    <div className={`flex flex-col items-center justify-center p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center h-full`}>
        <div className="flex items-center gap-1 mb-1">
            <p className="text-sm text-slate-500 whitespace-nowrap dark:text-slate-400">{title}</p>
            {tooltipText && (
                <Tooltip text={tooltipText}>
                    <InformationCircleIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 cursor-help" />
                </Tooltip>
            )}
        </div>
        <div className={`font-bold ${sentiment ? getSentimentColor(sentiment) + ' px-3 py-1.5 rounded-md text-lg' : 'text-slate-800 dark:text-slate-200'} ${isProminent ? 'text-xl' : 'text-lg'}`}>
            {value}
        </div>
        {value === 'N/A' && naReason && (
            <Tooltip text={naReason}>
                <p className="text-xs text-blue-600 hover:text-blue-500 mt-1 cursor-help underline decoration-dotted dark:text-blue-400 dark:hover:text-blue-300">(Why?)</p>
            </Tooltip>
        )}
    </div>
);


const DetailSection: React.FC<{ title: string, content?: string | null | undefined, icon?: React.ReactNode, children?: React.ReactNode }> = ({ title, content, icon, children }) => {
    if (!content && !children) return null;
    return (
        <div className="mt-6">
            <h3 className="flex items-center text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                <span className="mr-2.5">{icon}</span>
                {title}
            </h3>
            {content && (
                <div className="prose prose-sm text-slate-600 max-w-none space-y-3 leading-relaxed whitespace-pre-line dark:text-slate-300">
                    <p>{content}</p>
                </div>
            )}
            {children}
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

const parseMetricValue = (metric: any): number | null => {
    if (metric === null || metric === undefined) return null;
    if (typeof metric === 'number' && !isNaN(metric)) return metric;
    
    let valueSource = metric;
    if (typeof metric === 'object' && 'value' in metric) {
        valueSource = metric.value;
    }
    
    if (valueSource === null || valueSource === undefined) return null;
    
    const strValue = String(valueSource);
    if (strValue === 'N/A') return null;
    
    const cleaned = strValue.replace(/[^\d.-]/g, '');
    if (cleaned === '') return null;

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
};

const getRatioTooltipText = (label: string, companyValue: number | null, industryValue: number | null): string => {
    const whatItIs: Record<string, string> = {
        'P/E Ratio': 'Price-to-Earnings ratio shows how much investors are willing to pay per dollar of earnings.',
        'P/B Ratio': 'Price-to-Book ratio compares a company\'s market value to its book value.',
        'Debt/Equity': 'Debt-to-Equity ratio measures a company\'s financial leverage by dividing its total liabilities by shareholder equity.',
        'Return on Equity (%)': 'Return on Equity (ROE) measures how effectively management is using a company’s assets to create profits.',
    };

    const whyItMatters: Record<string, string> = {
        'P/E Ratio': 'A lower P/E can indicate a stock is undervalued compared to its peers.',
        'P/B Ratio': 'A lower P/B can suggest undervaluation, especially for value stocks.',
        'Debt/Equity': 'A high ratio indicates more debt, which can be risky. A lower ratio is generally safer.',
        'Return on Equity (%)': 'A higher ROE indicates more efficient use of shareholder equity to generate profits.',
    };

    let text = `What it is: ${whatItIs[label] || ''}\n\nWhy it matters: ${whyItMatters[label] || ''}`;

    if (companyValue !== null && industryValue !== null) {
        text += `\n\nContext: This company's ratio is ${companyValue.toFixed(2)}, compared to the industry average of ${industryValue.toFixed(2)}.`;
    }
    return text;
};


const FinancialRatioChart: React.FC<{
  label: string;
  companyValue: number | null;
  industryValue: number | null;
  isLowerBetter?: boolean;
}> = ({ label, companyValue, industryValue, isLowerBetter = false }) => {
    const hasData = companyValue !== null && industryValue !== null;
    const maxValue = hasData ? Math.max(Math.abs(companyValue), Math.abs(industryValue), 0) * 1.25 : 1;
    const companyWidth = hasData ? (Math.abs(companyValue) / maxValue) * 100 : 0;
    const industryWidth = hasData ? (Math.abs(industryValue) / maxValue) * 100 : 0;
    
    let companyColor = 'bg-blue-500';
    if(hasData) {
        if (isLowerBetter) {
            companyColor = companyValue < industryValue ? 'bg-green-500' : 'bg-amber-500';
        } else { // higher is better (e.g. ROE)
            companyColor = companyValue > industryValue ? 'bg-green-500' : 'bg-amber-500';
        }
    }
    
    const tooltipText = getRatioTooltipText(label, companyValue, industryValue);

    return (
        <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                 <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                    <Tooltip text={tooltipText}>
                        <InformationCircleIcon className="h-4 w-4 text-slate-400 cursor-help" />
                    </Tooltip>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Company vs. Industry Avg.</span>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="w-16 text-xs text-right font-medium text-slate-600 dark:text-slate-400">You</span>
                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                        <div className={`h-4 rounded-full transition-all duration-500 ${companyColor}`} style={{ width: `${companyWidth}%` }}></div>
                    </div>
                    <span className="w-12 text-left text-sm font-bold text-slate-800 dark:text-slate-200">{companyValue?.toFixed(2) ?? 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-16 text-xs text-right font-medium text-slate-600 dark:text-slate-400">Industry</span>
                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                        <div className="h-4 rounded-full bg-slate-400 dark:bg-slate-500 transition-all duration-500" style={{ width: `${industryWidth}%` }}></div>
                    </div>
                    <span className="w-12 text-left text-sm font-bold text-slate-800 dark:text-slate-200">{industryValue?.toFixed(2) ?? 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

const ThesisBreakdown: React.FC<{ breakdown: StockAnalysis['justification']['thesis_breakdown'] }> = ({ breakdown }) => {
    if (!breakdown) return null;
    return (
        <CollapsibleSection title="Thesis Breakdown" icon={<SparklesIcon />}>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">Quantitative View</h4>
                    <p className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300">{breakdown.quantitative_view}</p>
                </div>
                 <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">Qualitative View</h4>
                    <p className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300">{breakdown.qualitative_view}</p>
                </div>
                 <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">Relative View</h4>
                    <p className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300">{breakdown.relative_view}</p>
                </div>
            </div>
        </CollapsibleSection>
    )
}


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, esgAnalysis, macroAnalysis, marketIntelligenceAnalysis, leadershipAnalysis, competitiveAnalysis, currencySymbol, calculatedMetrics }) => {
  const formattedDate = formatDate(result.last_updated);
  const sentimentValue = sentimentMap[result.overall_sentiment];

  const companyPERatio = calculatedMetrics.peRatio?.value;
  const industryPERatio = parseMetricValue(competitiveAnalysis?.industry_average_metrics?.pe_ratio);
  const companyPBRatio = calculatedMetrics.pbRatio?.value;
  const industryPBRatio = parseMetricValue(competitiveAnalysis?.industry_average_metrics?.pb_ratio);
  const companyDebtToEquity = calculatedMetrics.debtToEquity?.value;
  const industryDebtToEquity = parseMetricValue(competitiveAnalysis?.industry_average_metrics?.debt_to_equity);
  const companyROE = calculatedMetrics.roe?.value;
  const industryROE = parseMetricValue(competitiveAnalysis?.industry_average_metrics?.roe);
  
  const TABS = {
      OVERVIEW_RISK: 'Overview & Risk',
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
            <Tabs.Tab data-test="tab-strategy" id={TABS.STRATEGY}><div className="flex items-center gap-2"><LightBulbIcon /> Strategy</div></Tabs.Tab>
            <Tabs.Tab data-test="tab-context-sources" id={TABS.CONTEXT_SOURCES}><div className="flex items-center gap-2"><SparklesIcon /> AI Context & Sources</div></Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
            <Tabs.Panel id={TABS.OVERVIEW_RISK}>
                <KeyTakeaways 
                    financialAnalysis={result}
                    esgAnalysis={esgAnalysis}
                    marketIntelligenceAnalysis={marketIntelligenceAnalysis}
                    leadershipAnalysis={leadershipAnalysis}
                    currencySymbol={currencySymbol}
                />
                
                <div className="my-6 space-y-6">
                    {result.justification.thesis_breakdown && (
                        <ThesisBreakdown breakdown={result.justification.thesis_breakdown} />
                    )}

                    {result.chiefAnalystCritique && (
                        <CollapsibleSection title="Chief Analyst's Debate Log" icon={<SparklesIcon />}>
                            <DebateLog critique={result.chiefAnalystCritique} />
                        </CollapsibleSection>
                    )}
                </div>

                <div className="my-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">Key Insights</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KeyInsight 
                            title="Recommendation" 
                            value={result.recommendation} 
                            sentiment={result.recommendation} 
                            naReason={result.na_justifications?.['recommendation']} 
                            tooltipText="What it is: The overall action suggested by the AI based on its complete analysis (e.g., Buy, Hold, Sell)."
                        />
                        <KeyInsight 
                            title="Short-Term Target"
                            value={formatPriceRange(result.target_price.short_term.low, result.target_price.short_term.high, currencySymbol)}
                            isProminent 
                            naReason={result.na_justifications?.['target_price.short_term']}
                            tooltipText="The price range the AI expects the stock to reach in the short term (typically under 1 year)."
                        />
                        <KeyInsight 
                            title="Long-Term Target" 
                             value={formatPriceRange(result.target_price.long_term.low, result.target_price.long_term.high, currencySymbol)}
                            isProminent 
                            naReason={result.na_justifications?.['target_price.long_term']}
                            tooltipText="The price range the AI expects the stock to reach in the long term (typically 1-3 years)."
                        />
                        <KeyInsight 
                            title="Stop Loss" 
                            value={<MetricWithProof metric={result.stop_loss} currencySymbol={currencySymbol} />}
                            isProminent 
                            naReason={result.na_justifications?.['stop_loss']}
                            tooltipText="A suggested price to sell the stock to limit potential losses if the price moves against you."
                        />
                    </div>
                     <div className="mt-4 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Confidence</p>
                            <Tooltip text={result.justification.confidence_rationale}>
                                <InformationCircleIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 cursor-help" />
                            </Tooltip>
                        </div>
                        <div className={`p-2 border rounded-md text-center ${confidenceBarColors[result.confidence_score] || confidenceBarColors.moderate}`}>
                            <p className="font-bold capitalize">{result.confidence_score}</p>
                        </div>
                    </div>
                </div>

                {result.risk_analysis && <RiskDashboard analysis={result.risk_analysis} />}

                <DetailSection title="Financial Ratios" icon={<ScaleIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FinancialRatioChart label="P/E Ratio" companyValue={companyPERatio} industryValue={industryPERatio} isLowerBetter={true} />
                        <FinancialRatioChart label="P/B Ratio" companyValue={companyPBRatio} industryValue={industryPBRatio} isLowerBetter={true} />
                        <FinancialRatioChart label="Debt/Equity" companyValue={companyDebtToEquity} industryValue={industryDebtToEquity} isLowerBetter={true} />
                        <FinancialRatioChart label="Return on Equity (%)" companyValue={companyROE} industryValue={industryROE} />
                    </div>
                </DetailSection>

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
                    <DetailSection title="Market Intelligence Context" content={result.contextual_inputs.market_intelligence_summary} icon={<ChatBubbleLeftRightIcon />} />
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