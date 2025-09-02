import React from 'react';

interface Segment {
  label: string;
  color: string;
  textColor: string;
}

interface VisualGaugeProps {
  label:string;
  value: number; // e.g., 0 to 4 for sentiment
  segments: Segment[];
}

export const VisualGauge: React.FC<VisualGaugeProps> = ({ label, value, segments }) => {
    const totalSegments = segments.length;
    if (value < 0 || value >= totalSegments) {
        return null; // Or some fallback UI
    }
    const percentage = (value + 0.5) / totalSegments * 100;
    const activeSegment = segments[value];

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                <span className={`text-sm font-bold ${activeSegment.textColor}`}>{activeSegment.label}</span>
            </div>
            <div className="relative w-full pt-4">
                <div className="flex h-2.5 rounded-full overflow-hidden">
                    {segments.map((segment, index) => (
                        <div key={index} style={{ width: `${100 / totalSegments}%` }} className={segment.color}></div>
                    ))}
                </div>
                <div 
                    className="absolute top-1/2 -mt-0.5 transition-all duration-500"
                    style={{ left: `${percentage}%` }}
                >
                    <div className="relative transform -translate-x-1/2">
                         <div className="w-5 h-5 rounded-full bg-white border-2 border-blue-600 shadow-md dark:bg-slate-800 dark:border-blue-400"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}