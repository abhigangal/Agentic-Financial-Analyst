import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      className={`relative inline-block ${className || ''}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full mb-2 w-max max-w-xs p-3 bg-white text-slate-700 text-xs font-medium rounded-lg shadow-xl z-50 border border-gray-200/80 animate-fade-in-fast transform -translate-x-1/2 left-1/2 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
          {text}
        </div>
      )}
    </div>
  );
};