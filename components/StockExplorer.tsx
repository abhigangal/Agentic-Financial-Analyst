import React, { useState, useMemo } from 'react';
import { StockCategory } from '../types';
import { SearchIcon, PlusIcon, SpinnerIcon, XMarkIcon } from './IconComponents';
import { AnalysisCacheItem } from '../../App';
import { Tooltip } from './Tooltip';

interface StockExplorerProps {
  categories: StockCategory[];
  currentSymbol: string | null;
  onSelectStock: (symbol: string) => void;
  onAddStock: (symbol: string) => void;
  onRemoveStock: (symbol: string) => void;
  isAdding: boolean;
  addError: string | null;
  onClearAddError: () => void;
  disabled: boolean;
  analysisCache: Record<string, AnalysisCacheItem>;
}

const getRecommendationIndicator = (recommendation: string | undefined) => {
    if (!recommendation) return null;
    switch (recommendation) {
        case 'Strong Buy':
        case 'Buy':
            return { color: 'bg-green-500', tooltip: `Recommendation: ${recommendation}` };
        case 'Strong Sell':
        case 'Sell':
            return { color: 'bg-red-500', tooltip: `Recommendation: ${recommendation}` };
        case 'Hold':
            return { color: 'bg-slate-500', tooltip: `Recommendation: ${recommendation}` };
        default:
            return null;
    }
}

export const StockExplorer: React.FC<StockExplorerProps> = ({
  categories,
  currentSymbol,
  onSelectStock,
  onAddStock,
  onRemoveStock,
  isAdding,
  addError,
  onClearAddError,
  disabled,
  analysisCache,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || '');

  const allSymbols = useMemo(() => {
    const symbols = new Set<string>();
    categories.forEach(cat => cat.symbols.forEach(sym => symbols.add(sym)));
    return Array.from(symbols);
  }, [categories]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return allSymbols.filter(sym => sym.toUpperCase().includes(searchQuery.toUpperCase()));
  }, [searchQuery, allSymbols]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if(addError) {
        onClearAddError();
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isAdding) {
      onAddStock(searchQuery.trim());
      setSearchQuery('');
    }
  };
  
  const handleSelectCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    setSearchQuery('');
  }

  const symbolsToShow = useMemo(() => {
    const category = categories.find(c => c.name === activeCategory);
    return category ? category.symbols : [];
  }, [activeCategory, categories]);

  const isCustomStock = (symbol: string) => {
      const customStocks = categories.find(c => c.name === 'My Stocks')?.symbols || [];
      return customStocks.includes(symbol);
  }

  return (
    <div className="py-4">
      {/* Search Bar */}
      <form onSubmit={handleAddSubmit} className="relative mb-4">
        <label htmlFor="stock-search" className="sr-only">Search for a stock or add a new symbol</label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon />
        </div>
        <input
          id="stock-search"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={disabled}
          placeholder="Search for a stock or add a new symbol..."
          className="w-full bg-gray-100/70 border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-slate-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
          data-test="stock-search-input"
        />
        {addError && <p className="text-red-500 text-xs mt-2 px-1">{addError}</p>}
      </form>

      {/* Content Area */}
      <div className="min-h-[150px]">
        {searchQuery ? (
          // Search Results View
          <div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {searchResults.map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => onSelectStock(symbol)}
                    disabled={disabled}
                    className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors w-full ${currentSymbol === symbol ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-gray-100 hover:bg-gray-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300'}`}
                    data-test={`stock-button-${symbol}`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            ) : (
               <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 mb-3">Symbol '{searchQuery.toUpperCase()}' not found.</p>
                <button
                    onClick={handleAddSubmit}
                    disabled={!searchQuery.trim() || isAdding || disabled}
                    className="flex-shrink-0 flex items-center justify-center gap-2 w-auto h-9 px-4 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors duration-200 disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-slate-700 dark:disabled:text-slate-400 mx-auto"
                    data-test="add-stock-button"
                >
                    {isAdding ? <SpinnerIcon /> : <PlusIcon />}
                    Add {searchQuery.toUpperCase()}
                </button>
               </div>
            )}
          </div>
        ) : (
          // Category Browser View
          <div>
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-x-3 gap-y-2 border-b border-gray-200 dark:border-slate-700 pb-3 mb-3">
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => handleSelectCategory(cat.name)}
                  disabled={disabled}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeCategory === cat.name ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'}`}
                  data-test={`category-tab-${cat.name.replace(/\s+/g, '-')}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {/* Symbol Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {symbolsToShow.map(symbol => {
                    const cachedData = analysisCache[symbol];
                    const indicator = cachedData ? getRecommendationIndicator(cachedData.analysisResult.recommendation) : null;
                    
                    return (
                        <div key={symbol} className="relative group">
                             <button
                                onClick={() => onSelectStock(symbol)}
                                disabled={disabled}
                                className={`w-full h-full px-3 py-2 text-sm font-semibold rounded-md transition-colors text-center border flex items-center justify-center gap-2 ${currentSymbol === symbol ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300 dark:bg-blue-500 dark:border-blue-500 dark:ring-blue-500/50' : 'bg-white hover:bg-gray-50 text-slate-700 border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:border-slate-700'}`}
                                data-test={`stock-button-${symbol}`}
                            >
                                {symbol}
                                {indicator && isCustomStock(symbol) && (
                                    <Tooltip text={indicator.tooltip}>
                                        <span className={`h-2 w-2 rounded-full ${indicator.color} block`}></span>
                                    </Tooltip>
                                )}
                            </button>
                            {isCustomStock(symbol) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveStock(symbol);
                                    }}
                                    className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full text-gray-400 bg-white hover:text-red-500 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all border border-gray-300 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-red-900/50 dark:hover:text-red-400 dark:border-slate-600"
                                    aria-label={`Remove ${symbol}`}
                                    data-test={`remove-stock-button-${symbol}`}
                                >
                                    <XMarkIcon />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};