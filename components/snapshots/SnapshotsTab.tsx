import React, { useState } from 'react';
import { Snapshot } from '../../types';
import { DiffView } from './DiffView';
import { InformationCircleIcon } from '../IconComponents';

interface SnapshotsTabProps {
  snapshots: Snapshot[];
  currencySymbol: string;
}

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const SnapshotsTab: React.FC<SnapshotsTabProps> = ({ snapshots, currencySymbol }) => {
    const [selectedIds, setSelectedIds] = useState<[string | null, string | null]>([null, null]);

    const handleSelect = (id: string, position: 0 | 1) => {
        setSelectedIds(prev => {
            // FIX: Add type assertion to ensure the spread array is treated as a tuple.
            const newSelection = [...prev] as [string | null, string | null];
            // If selecting the same ID in the other slot, clear the other slot
            if (position === 0 && id === newSelection[1]) newSelection[1] = null;
            if (position === 1 && id === newSelection[0]) newSelection[0] = null;
            
            newSelection[position] = id;
            return newSelection;
        });
    };

    const snapshotA = snapshots.find(s => s.id === selectedIds[0]);
    const snapshotB = snapshots.find(s => s.id === selectedIds[1]);

    if (snapshots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 h-full">
                <InformationCircleIcon className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">No Snapshots Saved</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs dark:text-slate-400">
                    You can save a snapshot of a completed analysis using the "Save Snapshot" button in the header.
                </p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
             <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Analysis Snapshot Comparison</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Select two snapshots to see what's changed over time.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white border border-gray-200/80 rounded-xl shadow-sm dark:bg-slate-800/50 dark:border-slate-700/80">
                {([0, 1] as const).map(position => (
                    <div key={position}>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            {position === 0 ? 'Compare From (Older)' : 'Compare To (Newer)'}
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {snapshots.map(snapshot => (
                                <label
                                    key={snapshot.id}
                                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedIds[position] === snapshot.id
                                            ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500'
                                            : 'bg-gray-50 border-gray-200 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`snapshot-select-${position}`}
                                        checked={selectedIds[position] === snapshot.id}
                                        onChange={() => handleSelect(snapshot.id, position)}
                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="ml-3 text-sm">
                                        <span className="font-medium text-slate-900 dark:text-slate-100">{formatDate(snapshot.timestamp)}</span>
                                        <p className="text-slate-500 dark:text-slate-400">{snapshot.analysisResult.recommendation}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {snapshotA && snapshotB ? (
                <DiffView
                    snapshotA={snapshotA}
                    snapshotB={snapshotB}
                    currencySymbol={currencySymbol}
                />
            ) : (
                <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400">Please select two snapshots to generate a comparison.</p>
                </div>
            )}
        </div>
    );
};
