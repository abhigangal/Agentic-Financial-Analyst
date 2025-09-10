import React from 'react';

export interface ChartPriceData {
    date: Date;
    value: number;
}

export interface ChartFundamentalData {
    period: string;
    value: number;
}

interface SimpleChartProps {
    priceData: ChartPriceData[];
    fundamentalData: ChartFundamentalData[] | null;
    fundamentalLabel: string;
}

const AXIS_COLOR = "#94a3b8"; // slate-400
const TEXT_COLOR = "#64748b"; // slate-500
const PRICE_LINE_COLOR = "#3b82f6"; // blue-500
const FUNDAMENTAL_BAR_COLOR = "rgba(100, 116, 139, 0.3)"; // slate-500 with opacity

export const SimpleChart: React.FC<SimpleChartProps> = ({ priceData, fundamentalData, fundamentalLabel }) => {
    const width = 800;
    const height = 450;
    const margin = { top: 20, right: 60, bottom: 50, left: 60 };

    const xMin = margin.left;
    const xMax = width - margin.right;
    const yMin = margin.top;
    const yMax = height - margin.bottom;

    // Price data scaling
    const priceValues = priceData.map(d => d.value);
    const priceDomain = [Math.min(...priceValues) * 0.98, Math.max(...priceValues) * 1.02];
    const dateDomain = [priceData[0].date, priceData[priceData.length - 1].date];
    const timeRange = dateDomain[1].getTime() - dateDomain[0].getTime();

    const getX = (date: Date) => xMin + ((date.getTime() - dateDomain[0].getTime()) / timeRange) * (xMax - xMin);
    const getY = (value: number) => yMax - ((value - priceDomain[0]) / (priceDomain[1] - priceDomain[0])) * (yMax - yMin);
    
    // Fundamental data scaling
    const fundamentalValues = fundamentalData ? fundamentalData.map(d => d.value) : [0];
    const fundamentalMax = Math.max(...fundamentalValues, 0) * 1.2;

    const getFundamentalY = (value: number) => yMax - (Math.max(value, 0) / fundamentalMax) * (yMax - yMin);
    
    const pricePath = priceData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.date)} ${getY(d.value)}`).join(' ');

    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = priceDomain[0] + (i / 4) * (priceDomain[1] - priceDomain[0]);
        return { value, y: getY(value) };
    });

    const fundamentalYAxisLabels = fundamentalMax > 0 ? Array.from({ length: 3 }, (_, i) => {
        const value = (i / 2) * fundamentalMax;
        return { value, y: getFundamentalY(value) };
    }) : [];

    const xAxisLabels = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(dateDomain[0].getTime() + (i / 5) * timeRange);
        return { date, x: getX(date) };
    });

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Y-Axis Grid Lines */}
            {yAxisLabels.map(({ y }, i) => (
                <line key={i} x1={xMin} y1={y} x2={xMax} y2={y} stroke={AXIS_COLOR} strokeWidth="0.5" strokeDasharray="3,3" />
            ))}
            
            {/* Fundamental Bars */}
            {fundamentalData && fundamentalMax > 0 && (
                <g>
                    {fundamentalData.map((d, i) => {
                        const barWidth = (xMax - xMin) / (fundamentalData.length * 1.5);
                        const barX = xMin + (i / fundamentalData.length) * (xMax-xMin) + barWidth / 2;
                        return <rect key={i} x={barX} y={getFundamentalY(d.value)} width={barWidth} height={yMax - getFundamentalY(d.value)} fill={FUNDAMENTAL_BAR_COLOR} />;
                    })}
                </g>
            )}

             {/* Price Line */}
            <path d={pricePath} fill="none" stroke={PRICE_LINE_COLOR} strokeWidth="2" />

             {/* Axes Lines */}
            <line x1={xMin} y1={yMax} x2={xMax} y2={yMax} stroke={AXIS_COLOR} strokeWidth="1" />
            <line x1={xMin} y1={yMin} x2={xMin} y2={yMax} stroke={AXIS_COLOR} strokeWidth="1" />
            <line x1={xMax} y1={yMin} x2={xMax} y2={yMax} stroke={AXIS_COLOR} strokeWidth="1" />

            {/* Y-Axis Labels (Price) */}
            {yAxisLabels.map(({ value, y }, i) => (
                <text key={i} x={xMin - 10} y={y} textAnchor="end" alignmentBaseline="middle" fill={PRICE_LINE_COLOR} fontSize="12">{Math.round(value)}</text>
            ))}

            {/* Y-Axis Labels (Fundamental) */}
            {fundamentalYAxisLabels.map(({ value, y }, i) => (
                 <text key={i} x={xMax + 10} y={y} textAnchor="start" alignmentBaseline="middle" fill={TEXT_COLOR} fontSize="12">
                     {value >= 1e9 ? `${(value/1e9).toFixed(1)}B` : value >= 1e6 ? `${(value/1e6).toFixed(1)}M` : value.toFixed(2)}
                </text>
            ))}
            {fundamentalData && <text x={xMax + 10} y={yMin} textAnchor="start" alignmentBaseline="hanging" fill={TEXT_COLOR} fontSize="12" fontWeight="bold">{fundamentalLabel}</text>}
            
            {/* X-Axis Labels (Date) */}
            {xAxisLabels.map(({ date, x }, i) => (
                 <text key={i} x={x} y={yMax + 20} textAnchor="middle" fill={TEXT_COLOR} fontSize="12">
                    {date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </text>
            ))}

        </svg>
    );
};
