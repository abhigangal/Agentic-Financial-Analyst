import React, { useState, useMemo } from 'react';
import { RawFinancials, FinancialStatement } from '../../types';
import { Sparkline } from '../charts/Sparkline';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, XMarkIcon } from '../IconComponents';

interface FinancialsTabProps {
  rawFinancials: RawFinancials | null;
  stockSymbol: string;
}

const formatValue = (value: number | null): string => {
    if (value === null || value === undefined) return '-';
    // Format to 2 decimal places and add commas for thousands
    const formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatted;
};

const FinancialCell: React.FC<{
    value: number | null;
    colIndex: number;
    rowData: (number | null)[];
    viewType: 'annual' | 'quarterly';
}> = ({ value, colIndex, rowData, viewType }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [showGrowth, setShowGrowth] = useState(false);
    
    const growth = useMemo(() => {
        const periodsAgo = viewType === 'annual' ? 1 : 4;
        if (colIndex < periodsAgo) return null;

        const currentValue = value;
        const previousValue = rowData[colIndex - periodsAgo];

        if (currentValue === null || previousValue === null || previousValue === 0) return null;

        const growthPct = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
        return {
            value: growthPct,
            period: viewType === 'annual' ? 'YoY' : 'QoQ',
        };
    }, [value, colIndex, rowData, viewType]);

    const handleCellClick = (e: React.MouseEvent) => {
        if (growth) {
            e.stopPropagation();
            setShowGrowth(true);
        }
    };
    
    const popoverClasses = "absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 p-3 bg-white text-slate-700 text-xs font-medium rounded-lg shadow-xl border border-gray-200/80 animate-fade-in-fast dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 w-48";
    
    return (
        <td
            className="px-4 py-2 text-slate-600 dark:text-slate-300 text-right font-mono relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => { setIsHovering(false); setShowGrowth(false); }}
        >
            <button
                onClick={handleCellClick}
                className={`w-full h-full text-right p-1 -m-1 ${growth ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded' : 'cursor-default'}`}
                disabled={!growth}
            >
                {formatValue(value)}
            </button>
            
            {isHovering && !showGrowth && (
                <div className={popoverClasses} style={{ pointerEvents: 'none' }}>
                    <p className="font-bold mb-1 text-center">8-Period Trend</p>
                    <Sparkline data={rowData.slice(-8)} width={150} height={40} color="#3b82f6" />
                </div>
            )}
            
            {showGrowth && growth && (
                <div className={popoverClasses}>
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-bold">{growth.period} Growth</p>
                        <button onClick={(e) => { e.stopPropagation(); setShowGrowth(false); }} className="p-1 -m-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div className={`flex items-center justify-center gap-2 text-lg font-bold ${growth.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {growth.value >= 0 ? <ArrowTrendingUpIcon className="h-5 w-5"/> : <ArrowTrendingDownIcon className="h-5 w-5"/>}
                        <span>{growth.value.toFixed(2)}%</span>
                    </div>
                </div>
            )}
        </td>
    );
};


const FinancialStatementTable: React.FC<{ statement: FinancialStatement | undefined, title: string, view: 'annual' | 'quarterly' }> = ({ statement, title, view }) => {
    if (!statement || !statement.periods || !statement.rows || statement.rows.length === 0) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Data not available.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto bg-white border border-gray-200/80 rounded-xl shadow-sm dark:bg-slate-800/50 dark:border-slate-700/80">
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 p-4 border-b border-gray-200 dark:border-slate-700">{title}</h4>
            <table className="w-full min-w-[600px] text-sm text-left">
                <thead className="bg-gray-50/70 dark:bg-slate-800/70">
                    <tr>
                        <th scope="col" className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Metric</th>
                        {statement.periods.map(period => (
                            <th key={period} scope="col" className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">{period}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700/80">
                    {statement.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.label}</td>
                            {row.values.map((value, valueIndex) => (
                                <FinancialCell
                                    key={valueIndex}
                                    value={value}
                                    colIndex={valueIndex}
                                    rowData={row.values}
                                    viewType={view}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ rawFinancials, stockSymbol }) => {
    const [view, setView] = useState<'annual' | 'quarterly'>('annual');
    
    if (!rawFinancials) {
        return (
            <div className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 h-full text-slate-500">
                Run an analysis to view historical financial statements.
            </div>
        );
    }
    
    const hasQuarterlyData = !!rawFinancials.quarterly_income_statement && rawFinancials.quarterly_income_statement.rows.length > 0;
    const hasAnnualData = !!rawFinancials.annual_income_statement && rawFinancials.annual_income_statement.rows.length > 0;
    const hasAnyData = hasAnnualData || hasQuarterlyData;

    if (!hasAnyData) {
        return (
             <div className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 h-full text-slate-500 text-center">
                Historical financial statements could not be retrieved for this stock.
            </div>
        );
    }

    const incomeStatement = view === 'annual' ? rawFinancials.annual_income_statement : rawFinancials.quarterly_income_statement;
    const balanceSheet = view === 'annual' ? rawFinancials.annual_balance_sheet : rawFinancials.quarterly_balance_sheet;
    const cashFlow = view === 'annual' ? rawFinancials.annual_cash_flow : rawFinancials.quarterly_cash_flow;

    const unitNote = useMemo(() => {
        const incomeRows = rawFinancials.annual_income_statement?.rows || rawFinancials.quarterly_income_statement?.rows || [];
        for (const row of incomeRows) {
            if (row.label.toLowerCase().includes('cr')) return "All values in Crores (₹)";
        }
        return "All values in local currency units.";
    }, [rawFinancials]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Financial Statements</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400">Hover over values for trends, click for growth analysis. {unitNote}</p>
                </div>
                <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-lg dark:bg-slate-700">
                    <button 
                        onClick={() => setView('annual')}
                        disabled={!hasAnnualData}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${view === 'annual' ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-slate-100' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Annual
                    </button>
                    <button 
                        onClick={() => setView('quarterly')}
                        disabled={!hasQuarterlyData}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${view === 'quarterly' ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-slate-100' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Quarterly
                    </button>
                </div>
            </div>

            <FinancialStatementTable statement={incomeStatement} title="Income Statement" view={view} />
            <FinancialStatementTable statement={balanceSheet} title="Balance Sheet" view={view} />
            <FinancialStatementTable statement={cashFlow} title="Cash Flow Statement" view={view} />

        </div>
    );
};