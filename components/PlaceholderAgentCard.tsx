import React from 'react';

interface PlaceholderAgentCardProps {
  agentName: string;
  description: string;
  icon: React.ReactNode;
}

export const PlaceholderAgentCard: React.FC<PlaceholderAgentCardProps> = ({ agentName, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 h-full">
        <div className="p-3 bg-slate-200 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-lg text-slate-700">{agentName}</h3>
        <p className="text-sm text-slate-500 mt-1 mb-5 max-w-xs">{description}</p>
        <p className="text-xs font-mono text-slate-500 bg-slate-200/70 px-3 py-1 rounded-full">Coming Soon</p>
    </div>
  );
};