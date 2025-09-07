import React from 'react';
import { XMarkIcon } from '../IconComponents';

interface ShortcutsPanelProps {
  show: boolean;
  onClose: () => void;
}

const shortcuts = [
    { key: '?', description: 'Toggle this shortcuts panel' },
    { key: 'Cmd/Ctrl + K', description: 'Open global search command palette' },
];

export const ShortcutsPanel: React.FC<ShortcutsPanelProps> = ({ show, onClose }) => {
    if (!show) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-fast"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 border border-slate-200 dark:border-slate-700 animate-slide-in-bottom"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Keyboard Shortcuts</h2>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                        aria-label="Close shortcuts panel"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <ul className="space-y-3">
                        {shortcuts.map(shortcut => (
                            <li key={shortcut.key} className="flex justify-between items-center">
                                <p className="text-slate-600 dark:text-slate-300">{shortcut.description}</p>
                                <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-slate-900 dark:text-gray-300 dark:border-slate-600">
                                    {shortcut.key}
                                </kbd>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};