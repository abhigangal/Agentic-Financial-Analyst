
import React from 'react';
import { ChiefAnalystCritique } from '../../types';

interface DebateLogProps {
  critique: ChiefAnalystCritique & { refined_answer?: string };
}

const DetailCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-700/50 dark:border-slate-600">
        <h4 className="font-semibold text-sm text-slate-500 dark:text-slate-400 mb-2">{title}</h4>
        <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-200">{children}</div>
    </div>
);


export const DebateLog: React.FC<DebateLogProps> = ({ critique }) => {
  return (
    <div className="space-y-4">
        <DetailCard title="Identified Conflict">
            <p>{critique.conflict_summary}</p>
        </DetailCard>
        <DetailCard title="Remediation Question Sent To Specialist">
            <p><em>To the {critique.target_agent} Agent:</em> "{critique.remediation_question}"</p>
        </DetailCard>
        {critique.refined_answer && (
            <DetailCard title="Refined Answer from Specialist">
                <pre className="whitespace-pre-wrap font-mono text-xs p-3 bg-gray-100 dark:bg-slate-800 rounded-md">
                    {critique.refined_answer}
                </pre>
            </DetailCard>
        )}
    </div>
  );
};
