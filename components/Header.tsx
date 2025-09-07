import React, { useState, useEffect, useRef } from 'react';
import { FinancialAdvisorIcon, SearchIcon } from './IconComponents';
import { MarketSwitcher, CurrencySwitcher } from './MarketSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { StockAnalysis } from '../types';
import { ExportButton } from './ExportButton';

// A simple search/autocomplete component built directly into the header
const SearchBar: React.FC<{
    allSymbols: string[];
    onSelect: (symbol: string) => void;
    onSubmit: (symbol: string) => void;
    addError: string | null;
    onClearAddError: () => void;
    disabled: boolean;
}> = ({ allSymbols, onSelect, onSubmit, addError, onClearAddError, disabled }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const filteredSymbols = query ? allSymbols.filter(s => s.toUpperCase().startsWith(query.toUpperCase())).slice(0, 7) : [];
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (symbol: string) => {
        setQuery('');
        setIsOpen(false);
        onSelect(symbol);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            onSubmit(query.trim());
            setQuery('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (e.target.value) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
        if (addError) {
            onClearAddError();
        }
    }

    return (
        <div className="relative w-full max-w-lg" ref={searchRef}>
            <form onSubmit={handleSubmit}>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query && setIsOpen(true)}
                    disabled={disabled}
                    placeholder="Search or add a stock symbol (e.g., RELIANCE)..."
                    className="w-full bg-gray-100/70 border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-slate-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 dark:bg-slate-700/80 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                />
            </form>
            {isOpen && (
                <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-20 border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                    <ul className="max-h-60 overflow-auto p-1">
                        {filteredSymbols.length > 0 ? (
                            filteredSymbols.map(symbol => (
                                <li key={symbol}>
                                    <button
                                        onClick={() => handleSelect(symbol)}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        {symbol}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-center text-slate-500 dark:text-slate-400">
                                No matching symbols found. Press Enter to add.
                            </li>
                        )}
                    </ul>
                </div>
            )}
             {addError && <p className="text-red-500 text-xs mt-1 px-1 absolute">{addError}</p>}
        </div>
    );
};


// Fix: Update HeaderProps to accept all props passed from App.tsx.
export interface HeaderProps {
  selectedMarketId: string;
  onMarketChange: (marketId: string) => void;
  selectedCurrency: string;
  onCurrencyChange: (symbol: string) => void;
  allSymbols: string[];
  onSearchSelect: (symbol: string) => void;
  onSearchSubmit: (symbol: string) => void;
  addError: string | null;
  onClearAddError: () => void;
  isAnalysisRunning: boolean;
  analysisResult: StockAnalysis | null;
  onExport: () => void;
}


// Fix: Update the Header component to include the SearchBar and ExportButton.
export const Header: React.FC<HeaderProps> = (props) => {
  const { 
    selectedMarketId, onMarketChange, selectedCurrency, onCurrencyChange, 
    analysisResult, onExport, isAnalysisRunning
  } = props;
  
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
        await onExport();
    } finally {
        setIsExporting(false);
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="text-blue-500">
             <FinancialAdvisorIcon className="h-9 w-9" />
          </div>
          <div title="Agentic Financial Analyst" className="text-3xl font-bold tracking-tighter text-slate-900 flex items-center dark:text-slate-100">
            A<span className="text-gray-400 dark:text-gray-600">G</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-4">
            <SearchBar 
                allSymbols={props.allSymbols}
                onSelect={props.onSearchSelect}
                onSubmit={props.onSearchSubmit}
                addError={props.addError}
                onClearAddError={props.onClearAddError}
                disabled={props.isAnalysisRunning}
            />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
            {analysisResult && (
                <ExportButton 
                    isLoading={isExporting}
                    onClick={handleExport}
                    disabled={!analysisResult || isAnalysisRunning}
                />
            )}
            <div className="hidden sm:flex items-center gap-2">
              <CurrencySwitcher selectedCurrency={selectedCurrency} onCurrencyChange={onCurrencyChange} />
              <MarketSwitcher selectedMarketId={selectedMarketId} onMarketChange={onMarketChange} />
            </div>
            <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};