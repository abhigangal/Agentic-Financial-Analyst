import React, { useMemo } from 'react';
import { CompetitiveAnalysis, FinancialMetrics, Competitor, CalculatedMetric } from '../../types';
import { CollapsibleSection } from '../CollapsibleSection';
import { TrophyIcon, CheckCircleIcon, ExclamationTriangleIcon, LinkIcon, InformationCircleIcon } from '../IconComponents';
import { Tooltip } from '../Tooltip';
import { MetricWithProof } from '../MetricWithProof';

interface CompetitiveResultDisplayProps {
  result: CompetitiveAnalysis;
  stockSymbol: string;
  calculatedMetrics: Record<string, CalculatedMetric>;
  currencySymbol: string;
}

const parseMetricValue = (metric: FinancialMetrics[keyof FinancialMetrics]): number | null => {
    if (!metric) return null;
    if (typeof metric === 'string') {
        if (metric === 'N/A') return null;
        const cleaned = metric.replace(/[^\d.-]/g, '');
        if (cleaned === '') return null;
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }
    // It's a CalculatedMetric object
    return metric.value;
};


const MetricCell: React.FC<{
    metric: FinancialMetrics[keyof FinancialMetrics];
    benchmark: FinancialMetrics[keyof FinancialMetrics];
    metricType: keyof FinancialMetrics;
    currencySymbol: string;
}> = ({ metric, benchmark, metricType, currencySymbol }) => {
    const numericValue = parseMetricValue(metric);
    const numericBenchmark = parseMetricValue(benchmark);
    let colorClass = 'text-slate-800 dark:text-slate-100';
    let tooltipText = '';

    if (numericValue !== null && numericBenchmark !== null) {
        const isLowerBetter = ['pe_ratio', 'pb_ratio', 'debt_to_equity'].includes(metricType);
        const isHigherBetter = ['roe'].includes(metricType);

        if (isLowerBetter) {
            if (numericValue < numericBenchmark * 0.9) {
                colorClass = 'text-green-600 dark:text-green-400';
                tooltipText = 'Favorable vs. Industry';
            } else if (numericValue > numericBenchmark * 1.1) {
                colorClass = 'text-red-600 dark:text-red-400';
                tooltipText = 'Unfavorable vs. Industry';
            }
        } else if (isHigherBetter) {
            if (numericValue > numericBenchmark * 1.1) {
                colorClass = 'text-green-600 dark:text-green-400';
                tooltipText = 'Favorable vs. Industry';
            } else if (numericValue < numericBenchmark * 0.9) {
                colorClass = 'text-red-600 dark:text-red-400';
                tooltipText = 'Unfavorable vs. Industry';
            }
        }
    }

    const cellContent = (
         <MetricWithProof metric={metric} currencySymbol={currencySymbol} className={colorClass} />
    );

    return (
        <td className="px-4 py-3 text-center text-sm">
            {tooltipText ? <Tooltip text={tooltipText}>{cellContent}</Tooltip> : cellContent}
        </td>
    );
};


const metricsConfig: { key: keyof FinancialMetrics, label: string, tooltip: string, isCurrency: boolean }[] = [
    { key: 'market_cap', label: 'Market Cap', tooltip: 'The total market value of a company\'s outstanding shares.', isCurrency: true },
    { key: 'pe_ratio', label: 'P/E Ratio', tooltip: 'Price-to-Earnings ratio; a lower P/E can indicate a stock is undervalued.', isCurrency: false },
    { key: 'pb_ratio', label: 'P/B Ratio', tooltip: 'Price-to-Book ratio; used to compare a company\'s market value to its book value.', isCurrency: false },
    { key: 'debt_to_equity', label: 'Debt/Equity', tooltip: 'Measures a company\'s financial leverage; a higher ratio indicates more debt.', isCurrency: false },
    { key: 'roe', label: 'ROE (%)', tooltip: 'Return on Equity; measures how effectively management is using a company’s assets to create profits.', isCurrency: false },
];

const StrengthsWeaknesses: React.FC<{ competitor: Competitor }> = ({ competitor }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-slate-600/50">
        <div>
            <h4 className="text-xs font-bold text-green-700 dark:text-green-400 mb-1.5">Strengths</h4>
            <ul className="space-y-1">
            {competitor.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0 mt-0.5" /> <span>{s}</span>
                </li>
            ))}
            </ul>
        </div>
        <div>
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 mb-1.5">Weaknesses</h4>
            <ul className="space-y-1">
            {competitor.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <ExclamationTriangleIcon className="h-3 w-3 text-red-500 shrink-0 mt-0.5" /> <span>{w}</span>
                </li>
            ))}
            </ul>
        </div>
    </div>
);


export const CompetitiveResultDisplay: React.FC<CompetitiveResultDisplayProps> = ({ result, stockSymbol, calculatedMetrics, currencySymbol }) => {
  const { market_leader, competitive_summary, competitors, sources } = result;
  
  const targetCompanyMetrics: FinancialMetrics = {
      market_cap: result.target_company_metrics?.market_cap ?? null,
      pe_ratio: calculatedMetrics.peRatio ?? result.target_company_metrics?.pe_ratio ?? null,
      pb_ratio: calculatedMetrics.pbRatio ?? result.target_company_metrics?.pb_ratio ?? null,
      debt_to_equity: calculatedMetrics.debtToEquity ?? result.target_company_metrics?.debt_to_equity ?? null,
      roe: calculatedMetrics.roe ?? result.target_company_metrics?.roe ?? null
  };

  const calculatedIndustryAverageMetrics = useMemo((): FinancialMetrics | null => {
    if (!result.competitors || result.competitors.length === 0) {
        return result.industry_average_metrics; // Fallback to AI-provided if no competitors are listed
    }

    const averages: { [key in keyof FinancialMetrics]: { sum: number; count: number } } = {
        market_cap: { sum: 0, count: 0 },
        pe_ratio: { sum: 0, count: 0 },
        pb_ratio: { sum: 0, count: 0 },
        debt_to_equity: { sum: 0, count: 0 },
        roe: { sum: 0, count: 0 },
    };

    for (const competitor of result.competitors) {
        if (!competitor.metrics) continue;
        
        for (const key of Object.keys(averages) as (keyof FinancialMetrics)[]) {
            const parsed = parseMetricValue(competitor.metrics[key]);
            if (parsed !== null && isFinite(parsed)) {
                averages[key].sum += parsed;
                averages[key].count++;
            }
        }
    }
    
    const formatAverage = (key: keyof FinancialMetrics): string | null => {
        const avgData = averages[key];
        if (avgData.count === 0) return 'N/A';
        const avg = avgData.sum / avgData.count;

        // Try to match the original data format for consistency
        if (key === 'market_cap') return `₹${avg.toFixed(2)} Cr`;
        if (key === 'roe') return `${avg.toFixed(2)}%`;
        return avg.toFixed(2);
    };
    
    return {
        market_cap: formatAverage('market_cap'),
        pe_ratio: formatAverage('pe_ratio'),
        pb_ratio: formatAverage('pb_ratio'),
        debt_to_equity: formatAverage('debt_to_equity'),
        roe: formatAverage('roe'),
    };
  }, [result.competitors, result.industry_average_metrics]);
  
  const allEntities = [
      { name: 'Target Co.', metrics: targetCompanyMetrics, symbol: stockSymbol, isCompetitor: false },
      ...competitors.map(c => ({ name: c.name, metrics: c.metrics, symbol: c.stock_symbol, isCompetitor: true })),
      { name: 'Industry Avg.', metrics: calculatedIndustryAverageMetrics, symbol: '', isCompetitor: false }
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Competitive Landscape</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Analysis of key market rivals and their financial standing.</p>
        
        <div className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-200/80 rounded-lg dark:bg-slate-700/50 dark:border-slate-600/80">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Identified Market Leader</span>
            <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50">
                {market_leader || 'N/A'}
            </span>
        </div>
      </div>
      
      <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
        <p>{competitive_summary}</p>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto bg-white border border-gray-200/80 rounded-xl dark:bg-slate-800/50 dark:border-slate-700/80">
          <table className="w-full min-w-[600px] divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50/70 dark:bg-slate-800/70">
                  <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider dark:text-slate-300">Metric</th>
                      {allEntities.map((entity, index) => (
                          <th key={index} scope="col" className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider dark:text-slate-300">
                              {entity.name}
                              {entity.symbol && <span className="block font-mono font-normal text-slate-500 dark:text-slate-400">({entity.symbol})</span>}
                          </th>
                      ))}
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800/50 dark:divide-slate-700/80">
                  {metricsConfig.map(metric => (
                      <tr key={metric.key}>
                          <td className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200">
                            <div className="flex items-center gap-1.5">
                                {metric.label}
                                <Tooltip text={metric.tooltip}>
                                    <InformationCircleIcon className="h-4 w-4 text-slate-400 cursor-help" />
                                </Tooltip>
                            </div>
                          </td>
                          {allEntities.map((entity, index) => (
                              <MetricCell 
                                  key={index}
                                  metric={entity.metrics?.[metric.key] ?? null}
                                  benchmark={calculatedIndustryAverageMetrics?.[metric.key] ?? null}
                                  metricType={metric.key}
                                  currencySymbol={metric.isCurrency ? currencySymbol : ''}
                              />
                          ))}
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* MOBILE CARD VIEW */}
        <div className="block md:hidden space-y-3">
            {allEntities.map((entity, index) => {
                const competitorDetails = entity.isCompetitor ? competitors.find(c => c.name === entity.name) : undefined;
                return (
                    <div key={index} className="p-3 bg-white border border-gray-200/80 rounded-lg dark:bg-slate-800/50 dark:border-slate-700/80">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">
                            {entity.name}
                            {entity.symbol && <span className="ml-2 font-mono font-normal text-sm text-slate-500 dark:text-slate-400">({entity.symbol})</span>}
                        </h4>
                        {entity.metrics && (
                            <ul className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700/50">
                                {metricsConfig.map(metric => (
                                    <li key={metric.key} className="flex justify-between items-center text-sm py-1">
                                        <span className="text-slate-500 dark:text-slate-400">{metric.label}</span>
                                        <MetricWithProof metric={entity.metrics?.[metric.key] ?? null} currencySymbol={metric.isCurrency ? currencySymbol : ''} />
                                    </li>
                                ))}
                            </ul>
                        )}
                        {competitorDetails && <StrengthsWeaknesses competitor={competitorDetails} />}
                    </div>
                );
            })}
        </div>
      
      {/* SHARED COLLAPSIBLE SECTIONS */}
      <div className="space-y-3">
        {competitors && competitors.length > 0 && (
          <CollapsibleSection title="Competitor Strengths & Weaknesses (Summary)" icon={<TrophyIcon />}>
            <div className="space-y-3">
              {competitors.map((competitor, index) => (
                <div key={index} className="p-3 bg-white border border-gray-200/80 rounded-lg dark:bg-slate-700/50 dark:border-slate-600/80">
                  <p className="font-semibold text-slate-800 text-sm leading-tight dark:text-slate-100">{competitor.name}</p>
                  <StrengthsWeaknesses competitor={competitor} />
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
        )}
      </div>
    </div>
  );
};