import React, { ReactNode } from 'react';

interface AgentCardProps {
  agentName: string;
  agentRole: string;
  icon: ReactNode;
  status: string;
  children: ReactNode;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agentName, agentRole, icon, status, children }) => {
  const statusIsActive = status.toLowerCase() === 'active';
  
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm dark:bg-slate-800/50 dark:border-slate-700/80">
      <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between dark:bg-slate-800/70 dark:border-b dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="text-blue-500">{icon}</div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">{agentName}</h2>
            <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-sm dark:text-slate-400">{agentRole}</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            statusIsActive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          {status}
        </span>
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
};