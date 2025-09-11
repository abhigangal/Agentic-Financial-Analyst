import React, { useMemo } from 'react';
import { Snapshot, StockAnalysis, RiskAnalysis, ExecutiveProfile } from '../../types';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '../IconComponents';

interface DiffViewProps {
  snapshotA: Snapshot;
  snapshotB: Snapshot;
  currencySymbol: string;
}

interface Diff {
    path: string;
    from: any;
    to: any;
    change?: number | null;
    changeType?: 'added' | 'removed' | 'modified' | 'reordered';
}

// A more robust diffing function
const generateDiff = (objA: any, objB: any, path: string = ''): Diff[] => {
    let diffs: Diff[] = [];
    if (objA === objB) return [];
    if (objA === null || objB === null || objA === undefined || objB === undefined) {
        if (objA !== objB) {
            return [{ path, from: objA, to: objB, changeType: 'modified' }];
        }
        return [];
    }

    const keys = Array.from(new Set([...Object.keys(objA), ...Object.keys(objB)]));
    
    for (const key of keys) {
        const currentPath = path ? `${path}.${key}` : key;
        const valA = objA[key];
        const valB = objB[key];

        if (valA === undefined) {
            diffs.push({ path: currentPath, from: undefined, to: valB, changeType: 'added' });
            continue;
        }
        if (valB === undefined) {
            diffs.push({ path: currentPath, from: valA, to: undefined, changeType: 'removed' });
            continue;
        }

        if (Array.isArray(valA) && Array.isArray(valB)) {
            const added = valB.filter(itemB => !valA.some(itemA => JSON.stringify(itemA) === JSON.stringify(itemB)));
            const removed = valA.filter(itemA => !valB.some(itemB => JSON.stringify(itemB) === JSON.stringify(itemA)));
            if (added.length > 0) diffs.push({ path: currentPath, from: null, to: added, changeType: 'added' });
            if (removed.length > 0) diffs.push({ path: currentPath, from: removed, to: null, changeType: 'removed' });

        } else if (typeof valA === 'object' && valA !== null && typeof valB === 'object' && valB !== null) {
            diffs = diffs.concat(generateDiff(valA, valB, currentPath));
        } else if (valA !== valB) {
            const change: Diff = { path: currentPath, from: valA, to: valB, changeType: 'modified' };
            if (typeof valA === 'number' && typeof valB === 'number') {
                change.change = valB - valA;
            }
            diffs.push(change);
        }
    }
    return diffs;
};


const formatValue = (value: any, path: string, currency: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (path.includes('price') || path.includes('stop_loss')) {
        return `${currency}${Number(value).toFixed(2)}`;
    }
    if (path.includes('percentage')) return `${value}`;
    if (typeof value === 'number') return value.toFixed(2);
    return String(value);
};

const getPathLabel = (path: string): string => {
    return path.split('.')
        .map(part => part.replace(/_/g, ' '))
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' > ');
}

const DiffItem: React.FC<{ diff: Diff, currency: string }> = ({ diff, currency }) => {
    const { path, from, to, change, changeType } = diff;
    
    let fromFormatted = formatValue(from, path, currency);
    let toFormatted = formatValue(to, path, currency);
    let changeIndicator: React.ReactNode = null;
    let changeColor = 'text-slate-700 dark:text-slate-200';
    
    if (typeof from === 'number' && typeof to === 'number' && change !== undefined && change !== null) {
        const isPositiveChangeGood = !path.includes('risk'); // Lower risk score is better
        const isPositive = change > 0;
        
        if ((isPositive && isPositiveChangeGood) || (!isPositive && !isPositiveChangeGood)) {
            changeColor = 'text-green-600 dark:text-green-400';
            changeIndicator = <ArrowTrendingUpIcon className="h-4 w-4" />;
        } else {
            changeColor = 'text-red-600 dark:text-red-400';
            changeIndicator = <ArrowTrendingDownIcon className="h-4 w-4" />;
        }
    }
    
    const renderArrayChange = (items: any[], type: 'added' | 'removed') => {
        const color = type === 'added' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const sign = type === 'added' ? '+' : '-';
        return (
            <ul className="list-disc pl-5 mt-1">
                {items.map((item, index) => (
                    <li key={index} className={`text-sm ${color}`}>
                        <span className="font-bold mr-1">{sign}</span>
                        {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                    </li>
                ))}
            </ul>
        );
    };


    return (
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{getPathLabel(path)}</p>
            {changeType === 'added' && to && Array.isArray(to) && renderArrayChange(to, 'added')}
            {changeType === 'removed' && from && Array.isArray(from) && renderArrayChange(from, 'removed')}
            {changeType !== 'added' && changeType !== 'removed' && (
                 <div className="flex items-center gap-4 mt-1">
                    <span className="text-base text-slate-500 dark:text-slate-400 line-through">{fromFormatted}</span>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        &rarr; {toFormatted}
                    </span>
                    {changeIndicator && (
                        <span className={`flex items-center gap-1 font-bold text-sm ${changeColor}`}>
                            {changeIndicator}
                            ({change > 0 ? '+' : ''}{change.toFixed(2)})
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export const DiffView: React.FC<DiffViewProps> = ({ snapshotA, snapshotB, currencySymbol }) => {
    const diffs = useMemo(() => {
        if (!snapshotA || !snapshotB) return [];
        
        const [older, newer] = [snapshotA, snapshotB].sort((a, b) => a.timestamp - b.timestamp);

        // Define paths to ignore in the diff
        const ignoredPaths = ['last_updated', 'price_change', 'price_change_percentage'];
        
        const rawDiffs = generateDiff(older.analysisResult, newer.analysisResult);
        
        return rawDiffs.filter(diff => !ignoredPaths.some(ignored => diff.path.startsWith(ignored)));

    }, [snapshotA, snapshotB]);
    
    if (diffs.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="font-semibold text-slate-700 dark:text-slate-200">No significant changes found between these two snapshots.</p>
            </div>
        );
    }
    
    return (
        <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Comparison Results</h3>
            <div className="space-y-3">
                {diffs.map(diff => (
                    <DiffItem key={diff.path} diff={diff} currency={currencySymbol} />
                ))}
            </div>
        </div>
    );
};
