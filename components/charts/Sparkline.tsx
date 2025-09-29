import React from 'react';

interface SparklineProps {
    data: (number | null)[];
    width: number;
    height: number;
    color: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, width, height, color }) => {
    const validData = data.filter((d): d is number => d !== null && isFinite(d));
    if (validData.length < 2) {
        return (
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="bg-gray-50 dark:bg-slate-800 rounded">
                <text x={width/2} y={height/2} textAnchor="middle" alignmentBaseline="middle" fontSize="10" className="fill-current text-slate-400">
                    Not Enough Data
                </text>
            </svg>
        );
    }

    const min = Math.min(...validData);
    const max = Math.max(...validData);
    const range = max - min;

    const points = validData
        .map((d, i) => {
            const x = (i / (validData.length - 1)) * width;
            const y = height - ((d - min) / (range || 1)) * (height - 4) + 2; // Add padding
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};