import React, { useState, useMemo } from 'react';
import { RawFinancials, FinancialStatement, QuantitativeAnalysis } from '../../types';
import { SimpleChart, ChartFundamentalData } from './SimpleChart';

interface ChartsTabProps {
  rawFinancials: RawFinancials | null;
  quantitativeAnalysis: QuantitativeAnalysis | null;
}

const fundamentalOptions = [
    { key: 'revenue', label: 'Revenue', statement: 'income_statement', rowLabel: 'Sales', type: 'quarterly' },
    { key: 'net_income', label: 'Net Profit', statement: 'income_statement', rowLabel: 'Net Profit', type: 'quarterly' },
    { key: 'eps', label: 'EPS', statement: 'income_statement', rowLabel: 'EPS in Rs', type: 'quarterly' },
    { key: 'total_assets', label: 'Total Assets', statement: 'balance_sheet', rowLabel: 'Total Assets', type: 'annual' },
    { key: 'total_equity', label: 'Total Equity', statement: 'balance_sheet', rowLabel: 'Total Liabilities', type: 'annual' }, // Assuming Equity = Assets - Liabilities
];

const extractFundamentalData = (statement: FinancialStatement | undefined, rowLabel: string): ChartFundamentalData[] | null => {
    if (!statement || !statement.periods || !statement.rows) return null;

    const row = statement.rows.find(r => r.label.toLowerCase().includes(rowLabel.toLowerCase()));
    if (!row) return null;

    return statement.periods.map((period, index) => ({
        period,
        value: row.values[index] ?? 0,
    })).filter(d => d.value !== null).slice(-12); // Show last 12 periods
};


export const ChartsTab: React.FC<ChartsTabProps> = ({ rawFinancials, quantitativeAnalysis }) => {
    const [selectedFundamentalKey, setSelectedFundamentalKey] = useState<string>('revenue');

    const priceData = useMemo(() => {
        if (!rawFinancials?.historical_price_data) return [];
        return rawFinancials.historical_price_data.map(d => ({
            date: new Date(d.date),
            value: d.close
        })).sort((a, b) => a.date.getTime() - b.date.getTime()); // Ensure data is sorted
    }, [rawFinancials]);

    const selectedFundamental = useMemo(() => {
        return fundamentalOptions.find(opt => opt.key === selectedFundamentalKey);
    }, [selectedFundamentalKey]);

    const fundamentalData = useMemo(() => {
        if (!rawFinancials || !selectedFundamental) return null;

        const statementKey = `${selectedFundamental.type}_${selectedFundamental.statement}` as keyof RawFinancials;
        const statement = rawFinancials[statementKey] as FinancialStatement | undefined;

        return extractFundamentalData(statement, selectedFundamental.rowLabel);

    }, [rawFinancials, selectedFundamental]);

    if (!rawFinancials) {
        return (
            <div className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 h-full text-slate-500">
                Run an analysis to view historical charts.
            </div>
        );
    }
    
    // Specific check for price data after confirming rawFinancials exists
    if (priceData.length === 0) {
         return (
            <div className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 h-full text-slate-500 text-center">
                Historical price data could not be retrieved for this stock.
            </div>
        );
    }

    return (
        <div className="p-4 bg-white border border-gray-200/80 rounded-xl shadow-sm dark:bg-slate-800/50 dark:border-slate-700/80">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Historical Performance</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Visualize price history against key financial metrics.</p>
            </div>

            <div className="mb-4">
                <label htmlFor="fundamental-select" className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">Overlay Metric:</label>
                <select 
                    id="fundamental-select"
                    value={selectedFundamentalKey}
                    onChange={(e) => setSelectedFundamentalKey(e.target.value)}
                    className="p-2 rounded-md border border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    {fundamentalOptions.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label} ({opt.type})</option>
                    ))}
                </select>
            </div>

            <div className="h-[450px] w-full">
                 <SimpleChart 
                    priceData={priceData} 
                    fundamentalData={fundamentalData} 
                    fundamentalLabel={selectedFundamental?.label || ''}
                    forecast={quantitativeAnalysis?.forecast}
                />
            </div>
        </div>
    );
};