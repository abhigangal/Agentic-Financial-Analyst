import React from 'react';
import { ChiefAnalystCritique } from '../types';
import { UserCircleIcon, SparklesIcon } from './IconComponents';
import { AgentKey } from '../types';
import { LeafIcon, GlobeAltIcon, NewspaperIcon, UserGroupIcon, TrophyIcon, BuildingOfficeIcon, CalendarDaysIcon, ShieldExclamationIcon } from './IconComponents';


interface DebateLogProps {
  critique: ChiefAnalystCritique & { refined_answer?: string };
}

const agentIconMap: { [key in AgentKey | 'default']?: React.ReactNode } = {
    esg: <LeafIcon className="h-5 w-5 text-green-500" />,
    macro: <GlobeAltIcon className="h-5 w-5 text-sky-500" />,
    market_intel: <NewspaperIcon className="h-5 w-5 text-blue-500" />,
    leadership: <UserGroupIcon className="h-5 w-5 text-purple-500" />,
    competitive: <TrophyIcon className="h-5 w-5 text-amber-500" />,
    sector: <BuildingOfficeIcon className="h-5 w-5 text-indigo-500" />,
    calendar: <CalendarDaysIcon className="h-5 w-5 text-rose-500" />,
    contrarian: <ShieldExclamationIcon className="h-5 w-5 text-red-500" />,
    default: <SparklesIcon className="h-5 w-5 text-slate-500" />,
};

const TimelineNode: React.FC<{
    icon: React.ReactNode;
    title: string;
    isLast?: boolean;
    children: React.ReactNode;
}> = ({ icon, title, isLast = false, children }) => (
    <div className="flex gap-4">
        {/* Icon and Line */}
        <div className="flex flex-col items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center ring-4 ring-white dark:ring-slate-800">
                {icon}
            </div>
            {!isLast && <div className="w-px h-full bg-slate-200 dark:bg-slate-700"></div>}
        </div>
        {/* Content */}
        <div className="flex-1 pb-8">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h4>
            <div className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300">
                {children}
            </div>
        </div>
    </div>
);


export const DebateLog: React.FC<DebateLogProps> = ({ critique }) => {
  const targetAgentKey = critique.target_agent.toLowerCase() as AgentKey;
  const specialistIcon = agentIconMap[targetAgentKey] || agentIconMap.default;

  return (
    <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
        <TimelineNode
            icon={<UserCircleIcon className="h-6 w-6 text-slate-500" />}
            title="Chief Analyst: Identified Conflict"
            isLast={!critique.remediation_question}
        >
            <p className="italic">"{critique.conflict_summary}"</p>
        </TimelineNode>
        
        {critique.target_agent !== 'None' && (
             <TimelineNode
                icon={specialistIcon}
                title={`Question for ${critique.target_agent} Agent`}
                isLast={!critique.refined_answer}
            >
                <p className="italic">"{critique.remediation_question}"</p>
            </TimelineNode>
        )}

        {critique.refined_answer && (
             <TimelineNode
                icon={specialistIcon}
                title="Specialist: Refined Answer"
                isLast={true}
            >
                <pre className="whitespace-pre-wrap font-mono text-xs p-3 bg-gray-100 dark:bg-slate-900 rounded-md max-h-60 overflow-auto">
                    {critique.refined_answer}
                </pre>
            </TimelineNode>
        )}
    </div>
  );
};