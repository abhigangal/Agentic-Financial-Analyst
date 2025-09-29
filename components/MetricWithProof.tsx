import React from 'react';
import { CalculatedMetric } from '../../types';
import { Tooltip } from './Tooltip';
import { InformationCircleIcon } from './IconComponents';

interface MetricWithProofProps {
    metric: CalculatedMetric | number | string | null;
    currencySymbol?: string;
    className?: string;
}

const formatNumber = (num: number | null | string): string => {
    if (num === null || num === undefined) return 'N/A';
    if (typeof num === 'string') return num;
    if (!isFinite(num)) return 'N/A';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const MetricWithProof: React.FC<MetricWithProofProps> = ({ metric, currencySymbol = '', className = '' }) => {
    if (metric === null || metric === undefined) {
        return <span className={className}>N/A</span>;
    }

    if (typeof metric === 'string' || typeof metric === 'number') {
        const value = typeof metric === 'number' ? `${currencySymbol}${formatNumber(metric)}` : metric;
        return <span className={className}>{value}</span>;
    }
    
    // It's a CalculatedMetric
    const { value, formula, inputs, proof } = metric;
    
    const displayValue = value === null ? 'N/A' : (
        metric.formula.toLowerCase().includes('price') || currencySymbol ? `${currencySymbol}${formatNumber(value)}` : `${formatNumber(value)}x`
    );

    const proofText = proof || Object.entries(inputs)
        .map(([key, val]) => `${key}: ${formatNumber(val)}`)
        .join(' | ');

    return (
        <div className={`flex items-center gap-1.5 justify-center ${className}`}>
            <span>{displayValue}</span>
            <Tooltip text={`${formula} = ${proofText}`}>
                <InformationCircleIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 cursor-help" />
            </Tooltip>
        </div>
    );
};