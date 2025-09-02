import React, { useEffect, useState } from 'react';

interface RiskGaugeProps {
  score: number;
  level: 'Low' | 'Moderate' | 'High' | 'Very High';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level }) => {
  const safeScore = Math.min(Math.max(score, 0), 100);

  const levelColorClasses: Record<string, string> = {
    'Low': 'text-green-500 dark:text-green-400',
    'Moderate': 'text-yellow-500 dark:text-yellow-400',
    'High': 'text-orange-500 dark:text-orange-400',
    'Very High': 'text-red-500 dark:text-red-400',
  };
  const colorClass = levelColorClasses[level] || levelColorClasses['Moderate'];

  const radius = 76;
  const strokeWidth = 16;
  const circumference = Math.PI * radius; // Circumference of a semi-circle

  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useEffect(() => {
    // Timeout to allow initial render before starting the animation
    const timer = setTimeout(() => {
      const offset = circumference - (safeScore / 100) * circumference;
      setStrokeDashoffset(offset);
    }, 100);
    return () => clearTimeout(timer);
  }, [safeScore, circumference]);

  return (
    <div className="relative w-44 h-22 flex items-center justify-center mx-auto">
      <svg width="176" height="88" viewBox="0 0 176 88">
        <defs>
          <linearGradient id="riskGradientGauge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" />      {/* green-400 */}
            <stop offset="33%" stopColor="#facc15" />     {/* yellow-400 */}
            <stop offset="66%" stopColor="#fb923c" />     {/* orange-400 */}
            <stop offset="100%" stopColor="#f87171" />    {/* red-400 */}
          </linearGradient>
        </defs>
        {/* Background Track */}
        <path
          d={`M ${strokeWidth / 2 + 2} 80 A ${radius} ${radius} 0 0 1 ${176 - (strokeWidth / 2 + 2)} 80`}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeLinecap="round"
        />
        {/* Foreground Progress */}
        <path
          d={`M ${strokeWidth / 2 + 2} 80 A ${radius} ${radius} 0 0 1 ${176 - (strokeWidth / 2 + 2)} 80`}
          fill="none"
          stroke="url(#riskGradientGauge)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pt-4">
        <span className={`text-4xl font-bold ${colorClass}`}>{safeScore}</span>
        <p className={`-mt-1 text-sm font-semibold ${colorClass}`}>{level}</p>
      </div>
    </div>
  );
};