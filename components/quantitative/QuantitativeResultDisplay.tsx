import React from 'react';
import { QuantitativeAnalysis } from '../../types';
import { InformationCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '../IconComponents';
import { Tooltip } from '../Tooltip';

interface QuantitativeResultDisplayProps {
  result: QuantitativeAnalysis;
}

const formatPrice = (price: number | null): string => {
    if (price === null || isNaN(price)) return 'N/A';
    return price.toFixed(2);
};

export const QuantitativeResultDisplay: React.FC<QuantitativeResultDisplayProps> = ({ result }) => {
  const { summary, forecast, key_drivers } = result;

  const getImpactIcon = (impact: 'Positive' | 'Negative' | 'Neutral') => {
      switch(impact) {
          case 'Positive': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
          case 'Negative': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
          default: return <span className="text-gray-500 font-bold text-lg leading-none">-</span>;
      }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Quantitative Forecast</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">30-day forecast based on a simulated time-series model.</p>
      </div>
      
      <div className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300">
          <p>{summary}</p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-900/20 dark:border-blue-500/30">
        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Model Forecast</h4>
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Price Target</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatPrice(forecast.price_target)}</p>
            </div>
             <div className="w-px h-12 bg-blue-200 dark:bg-blue-500/30 hidden sm:block"></div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Confidence Interval</p>
                <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                    {formatPrice(forecast.confidence_interval[0])} – {formatPrice(forecast.confidence_interval[1])}
                </p>
            </div>
        </div>
         <Tooltip text={forecast.rationale}>
            <p className="text-xs text-blue-600 hover:text-blue-500 mt-3 cursor-help underline decoration-dotted text-center dark:text-blue-400 dark:hover:text-blue-300">
                <InformationCircleIcon className="h-4 w-4 inline-block mr-1" />
                Model Rationale
            </p>
         </Tooltip>
      </div>

       <div>
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Key Model Drivers</h4>
         <div className="space-y-2">
            {key_drivers.map((driver, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600/50">
                    <div className="flex items-center gap-3">
                        {getImpactIcon(driver.impact)}
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{driver.feature}</span>
                    </div>
                    <div className="flex items-center gap-4">
                         <span className="text-xs font-mono text-slate-600 bg-slate-200 px-2 py-1 rounded-full border border-slate-300 dark:bg-slate-600 dark:text-slate-300 dark:border-slate-500">{driver.impact}</span>
                         <span className="text-xs font-mono text-slate-600 bg-slate-200 px-2 py-1 rounded-full border border-slate-300 dark:bg-slate-600 dark:text-slate-300 dark:border-slate-500">{driver.weight} Weight</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
