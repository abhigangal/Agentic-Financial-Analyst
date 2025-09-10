import React, { useState } from 'react';
import { RawFinancials, FinancialStatement } from '../../types';

interface FinancialsTabProps {
  rawFinancials: RawFinancials | null;
  stockSymbol: string;
}

const formatValue = (value: number | null): string => {
    if (value === null || value === undefined) return '-';
    if (Math.abs(value) > 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) > 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) > 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
};

const FinancialStatementTable: React.FC<{ statement: FinancialStatement | undefined, title: string }> = ({ statement, title }) => {
    if (!statement || !statement.periods || !statement.rows) {
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
                                <td key={valueIndex} className="px-4 py-2 text-slate-600 dark:text-slate-300 text-right font-mono">{formatValue(value)}</td>
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
    
    const hasQuarterlyData = !!rawFinancials.quarterly_income_statement;
    const hasAnnualData = !!rawFinancials.annual_income_statement;

    const incomeStatement = view === 'annual' ? rawFinancials.annual_income_statement : rawFinancials.quarterly_income_statement;
    const balanceSheet = view === 'annual' ? rawFinancials.annual_balance_sheet : rawFinancials.quarterly_balance_sheet;
    const cashFlow = view === 'annual' ? rawFinancials.annual_cash_flow : rawFinancials.quarterly_cash_flow;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Financial Statements</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400">Historical performance data for {stockSymbol}.</p>
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

            <FinancialStatementTable statement={incomeStatement} title="Income Statement" />
            <FinancialStatementTable statement={balanceSheet} title="Balance Sheet" />
            <FinancialStatementTable statement={cashFlow} title="Cash Flow Statement" />

        </div>
    );
};
