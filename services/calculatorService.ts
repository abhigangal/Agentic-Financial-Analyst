import { CalculatedMetric, RawFinancials } from '../types';

const formatNumber = (num: number | null): string => {
    if (num === null || !isFinite(num)) return 'N/A';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


export const calculateDebtToEquity = (totalDebt: number | null, totalEquity: number | null): CalculatedMetric => {
    const inputs = { 'Total Debt': totalDebt, 'Total Equity': totalEquity };
    const formula = '(Total Debt / Total Equity)';
    
    if (totalDebt === null || totalEquity === null || totalEquity === 0) {
        return { value: null, formula, inputs };
    }

    const value = totalDebt / totalEquity;
    return { value, formula, inputs };
};

export const calculatePERatio = (price: number | null, eps: number | null): CalculatedMetric => {
    const inputs = { 'Current Price': price, 'Earnings Per Share (EPS)': eps };
    const formula = '(Current Price / EPS)';

    if (price === null || eps === null || eps === 0) {
        return { value: null, formula, inputs };
    }

    const value = price / eps;
    return { value, formula, inputs, proof: `(${formatNumber(price)} / ${formatNumber(eps)})` };
};

export const calculatePBRatio = (price: number | null, bookValuePerShare: number | null): CalculatedMetric => {
    const inputs = { 'Current Price': price, 'Book Value Per Share': bookValuePerShare };
    const formula = '(Current Price / Book Value Per Share)';

    if (price === null || bookValuePerShare === null || bookValuePerShare === 0) {
        return { value: null, formula, inputs };
    }
    
    const value = price / bookValuePerShare;
    return { value, formula, inputs, proof: `(${formatNumber(price)} / ${formatNumber(bookValuePerShare)})` };
};

export const calculateROE = (eps: number | null, bookValuePerShare: number | null): CalculatedMetric => {
    const inputs = { 'Earnings Per Share (EPS)': eps, 'Book Value Per Share': bookValuePerShare };
    const formula = '(EPS / Book Value Per Share) * 100';

    if (eps === null || bookValuePerShare === null || bookValuePerShare === 0) {
        return { value: null, formula, inputs };
    }

    const value = (eps / bookValuePerShare) * 100;
    return { value, formula, inputs, proof: `(${formatNumber(eps)} / ${formatNumber(bookValuePerShare)}) * 100` };
};

// FIX: Add calculateAllMetrics function to fix module augmentation error in useAnalysisWorkflow
export const calculateAllMetrics = (rawFinancials: RawFinancials | null): Record<string, CalculatedMetric> => {
    const metrics: Record<string, CalculatedMetric> = {};
    if (rawFinancials) {
        metrics.debtToEquity = rawFinancials.debt_to_equity_ratio !== undefined && rawFinancials.debt_to_equity_ratio !== null
            ? { value: rawFinancials.debt_to_equity_ratio, formula: 'Direct from source', inputs: { 'Debt/Eq': rawFinancials.debt_to_equity_ratio } }
            : calculateDebtToEquity(rawFinancials.total_debt, rawFinancials.total_equity);

        metrics.peRatio = rawFinancials.pe_ratio !== undefined && rawFinancials.pe_ratio !== null
            ? { value: rawFinancials.pe_ratio, formula: 'Direct from source', inputs: { 'P/E': rawFinancials.pe_ratio } }
            : calculatePERatio(rawFinancials.current_price, rawFinancials.eps);

        metrics.pbRatio = rawFinancials.pb_ratio !== undefined && rawFinancials.pb_ratio !== null
            ? { value: rawFinancials.pb_ratio, formula: 'Direct from source', inputs: { 'P/B': rawFinancials.pb_ratio } }
            : calculatePBRatio(rawFinancials.current_price, rawFinancials.book_value_per_share);

        metrics.roe = rawFinancials.roe !== undefined && rawFinancials.roe !== null
            ? { value: rawFinancials.roe, formula: 'Direct from source', inputs: { 'ROE': rawFinancials.roe } }
            : calculateROE(rawFinancials.eps, rawFinancials.book_value_per_share);
    }
    return metrics;
}
