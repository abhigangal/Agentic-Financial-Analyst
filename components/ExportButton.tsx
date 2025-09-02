import React from 'react';
import { ArrowDownTrayIcon, SpinnerIcon } from './IconComponents';

interface ExportButtonProps {
  isLoading: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ isLoading, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="flex items-center justify-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shrink-0"
      title="Export the full analysis report to a PDF document."
      data-test="export-pdf-button"
    >
      {isLoading ? (
        <>
          <SpinnerIcon className="h-5 w-5" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
};