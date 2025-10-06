import React from 'react';
import { QuantitativeAnalysis } from '../../types';

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
    forecast?: QuantitativeAnalysis['forecast'];
}

const AXIS_COLOR = "#94a3b8"; // slate-400
const TEXT_COLOR = "#64748b"; // slate-500
const PRICE_LINE_COLOR = "#3b82f6"; // blue-500
const FORECAST_LINE_COLOR = "#8b5cf6"; // violet-500
const CONFIDENCE_AREA_COLOR = "rgba(139, 92, 246, 0.1)"; // violet-500 with opacity
const FUNDAMENTAL_BAR_COLOR = "rgba(100, 116, 139, 0.3)"; // slate-500 with opacity

export const SimpleChart: React.FC<SimpleChartProps> = ({ priceData, fundamentalData, fundamentalLabel, forecast }) => {
    const width = 800;
    const height = 450;
    const margin = { top: 20, right: 60, bottom: 50, left: 60 };

    // Guard Clause: Prevent rendering and potential errors if there's no price data.
    if (!priceData || priceData.length === 0) {
        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <text x={width/2} y={height/2} textAnchor="middle" fill={TEXT_COLOR} fontSize="14">
                    No Price Data to Display
                </text>
            </svg>
        );
    }

    const xMin = margin.left;
    const xMax = width - margin.right;
    const yMin = margin.top;
    const yMax = height - margin.bottom;
    
    // --- Date/X-axis setup ---
    const historicalEndDate = priceData[priceData.length - 1].date;
    const forecastEndDate = new Date(historicalEndDate);
    forecastEndDate.setDate(forecastEndDate.getDate() + 30); // Assume a 30-day forecast horizon
    
    const dateDomain = [
        priceData[0].date, 
        forecast?.price_target != null ? forecastEndDate : historicalEndDate
    ];
    const timeRange = dateDomain[1].getTime() - dateDomain[0].getTime();
    
    const getX = (date: Date) => xMin + ((date.getTime() - dateDomain[0].getTime()) / timeRange) * (xMax - xMin);

    // --- Price/Y-axis setup ---
    const priceValues = priceData.map(d => d.value);
    let minPrice = Math.min(...priceValues);
    let maxPrice = Math.max(...priceValues);

    if (forecast?.price_target != null && forecast.confidence_interval) {
        const [low, high] = forecast.confidence_interval;
        if(low != null) minPrice = Math.min(minPrice, low);
        if(high != null) maxPrice = Math.max(maxPrice, high);
        if(forecast.price_target != null) maxPrice = Math.max(maxPrice, forecast.price_target);
    }

    const priceDomain = [minPrice * 0.98, maxPrice * 1.02];
    const getY = (value: number) => yMax - ((value - priceDomain[0]) / (priceDomain[1] - priceDomain[0])) * (yMax - yMin);
    
    // --- Fundamental data scaling ---
    const fundamentalValues = fundamentalData ? fundamentalData.map(d => d.value) : [0];
    const fundamentalMax = Math.max(...fundamentalValues, 0) * 1.2;
    const getFundamentalY = (value: number) => yMax - (Math.max(value, 0) / fundamentalMax) * (yMax - yMin);
    
    // --- Path and coordinate calculations ---
    const pricePath = priceData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.date)} ${getY(d.value)}`).join(' ');
    
    const lastPricePoint = priceData[priceData.length - 1];
    const forecastPath = forecast?.price_target != null
        ? `M ${getX(lastPricePoint.date)} ${getY(lastPricePoint.value)} L ${getX(forecastEndDate)} ${getY(forecast.price_target)}`
        : '';
        
    const confidencePolygonPoints = (forecast?.confidence_interval && forecast.confidence_interval[0] != null && forecast.confidence_interval[1] != null) 
        ? `${getX(lastPricePoint.date)},${getY(forecast.confidence_interval[0])} ${getX(forecastEndDate)},${getY(forecast.confidence_interval[0])} ${getX(forecastEndDate)},${getY(forecast.confidence_interval[1])} ${getX(lastPricePoint.date)},${getY(forecast.confidence_interval[1])}`
        : '';

    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = priceDomain[0] + (i / 4) * (priceDomain[1] - priceDomain[0]);
        return { value, y: getY(value) };
    });

    const fundamentalYAxisLabels = fundamentalMax > 0 ? Array.from({ length: 3 }, (_, i) => {
        const value = (i / 2) * fundamentalMax;
        return { value, y: getFundamentalY(value) };
    }) : [];

    const xAxisLabels = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(dateDomain[0].getTime() + (i / 5) * (historicalEndDate.getTime() - dateDomain[0].getTime()));
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
                        const barWidth = (getX(historicalEndDate) - xMin) / (fundamentalData.length * 1.5);
                        const barX = xMin + (i / fundamentalData.length) * (getX(historicalEndDate)-xMin) + barWidth / 2;
                        return <rect key={i} x={barX} y={getFundamentalY(d.value)} width={barWidth} height={yMax - getFundamentalY(d.value)} fill={FUNDAMENTAL_BAR_COLOR} />;
                    })}
                </g>
            )}

            {/* Forecast Confidence Area */}
            {confidencePolygonPoints && <polygon points={confidencePolygonPoints} fill={CONFIDENCE_AREA_COLOR} />}

             {/* Price Line */}
            <path d={pricePath} fill="none" stroke={PRICE_LINE_COLOR} strokeWidth="2" />

            {/* Forecast Line */}
            {forecastPath && <path d={forecastPath} fill="none" stroke={FORECAST_LINE_COLOR} strokeWidth="2" strokeDasharray="5,5" />}


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
            {forecast && (
                 <text x={getX(forecastEndDate)} y={yMax + 20} textAnchor="middle" fill={FORECAST_LINE_COLOR} fontSize="12" fontWeight="bold">
                    Forecast
                </text>
            )}

        </svg>
    );
};