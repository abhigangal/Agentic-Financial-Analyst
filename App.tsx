import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { marketConfigs } from './data/markets';
import { Breadcrumbs } from './components/Breadcrumbs';
import { TabbedAnalysis } from './components/TabbedAnalysis';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/HomePage';
import { NutshellSummary } from './components/NutshellSummary';
import { AnalysisConfiguration } from './components/AnalysisConfiguration';
import { ShortcutsPanel } from './components/common/ShortcutsPanel';
import { useAnalysis } from './contexts/AnalysisContext';
import { useAnalysisWorkflow } from './hooks/useAnalysisWorkflow';
import { generateAnalysisPdf } from './services/pdfService';
import { AgentKey, StockCategory } from './types';

export const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const App: React.FC = () => {
  const { state, dispatch, isAnalysisRunning } = useAnalysis();
  const { runAnalysis } = useAnalysisWorkflow();
  const {
    currentSymbol,
    isConfiguring,
    analysisResult,
    customStockList,
    selectedMarketId,
    analysisCache,
    isAddingStock,
    addError,
  } = state;
  
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const activeMarketConfig = useMemo(() => marketConfigs[selectedMarketId], [selectedMarketId]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '?') { e.preventDefault(); setShowShortcuts(s => !s); }
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); console.log("Trigger global search (not implemented)"); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectStock = (symbol: string) => {
    const cachedItem = analysisCache[symbol];
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL_MS)) {
        dispatch({ type: 'LOAD_CACHED_ANALYSIS', payload: { symbol, cachedItem } });
    } else {
        dispatch({ type: 'SET_CURRENT_SYMBOL', payload: symbol });
        dispatch({ type: 'SET_IS_CONFIGURING', payload: true });
        dispatch({ type: 'SET_IS_CACHED_VIEW', payload: false });
    }
  };

  const handleRunAnalysis = (enabledAgentsConfig: Record<AgentKey, boolean>) => {
    if (currentSymbol) {
      dispatch({ type: 'SET_ENABLED_AGENTS', payload: enabledAgentsConfig });
      dispatch({ type: 'SET_IS_CONFIGURING', payload: false });
      runAnalysis(currentSymbol, enabledAgentsConfig);
    }
  };

  const handleAddStock = async (symbol: string) => {
    dispatch({ type: 'SET_ADD_ERROR', payload: null });
    dispatch({ type: 'SET_IS_ADDING_STOCK', payload: true });
    try {
        let symbolToAdd = symbol.toUpperCase();
        if (activeMarketConfig.id === 'IN' && !symbolToAdd.endsWith('.NS') && !symbolToAdd.endsWith('.BO')) symbolToAdd = `${symbolToAdd}.NS`;
        if ((activeMarketConfig.id === 'UK' || activeMarketConfig.id === 'BF') && !symbolToAdd.endsWith('.L')) symbolToAdd = `${symbolToAdd}.L`;

        const isValid = await activeMarketConfig.validateSymbol(symbolToAdd);
        if (isValid) {
            if (![...activeMarketConfig.stockCategories.flatMap(c => c.symbols), ...customStockList].includes(symbolToAdd)) {
                dispatch({ type: 'ADD_CUSTOM_STOCK', payload: symbolToAdd });
            }
            handleSelectStock(symbolToAdd);
        } else {
            let errorMsg = `Symbol '${symbol.toUpperCase()}' not found or is invalid for the ${activeMarketConfig.name} market.`;
            if (activeMarketConfig.id === 'IN') errorMsg += " Try adding '.NS' for NSE stocks.";
            if (activeMarketConfig.id === 'UK' || activeMarketConfig.id === 'BF') errorMsg += " Try adding '.L' for LSE stocks.";
            dispatch({ type: 'SET_ADD_ERROR', payload: errorMsg });
        }
    } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : 'An unexpected error occurred.';
        dispatch({ type: 'SET_ADD_ERROR', payload: errorMsg });
    } finally {
        dispatch({ type: 'SET_IS_ADDING_STOCK', payload: false });
    }
  };

  const handleRemoveStock = (symbol: string) => {
    if (currentSymbol === symbol) {
        dispatch({ type: 'SET_CURRENT_SYMBOL', payload: null });
        dispatch({ type: 'SET_IS_CONFIGURING', payload: false });
    }
    dispatch({ type: 'REMOVE_CUSTOM_STOCK', payload: symbol });
  };
  
  const handleNavigateHome = () => {
    dispatch({ type: 'SET_CURRENT_SYMBOL', payload: null });
    dispatch({ type: 'SET_IS_CONFIGURING', payload: false });
    dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 'IDLE' });
  };

  const handleExportPdf = useCallback(async () => {
    if (!analysisResult) return;
    try {
        await generateAnalysisPdf(
            analysisResult, state.esgAnalysis, state.macroAnalysis, state.marketIntelligenceAnalysis,
            state.leadershipAnalysis, state.competitiveAnalysis, state.sectorAnalysis, state.corporateCalendarAnalysis,
            state.technicalAnalysis, state.contrarianAnalysis, state.quantitativeAnalysis, state.selectedCurrency
        );
    } catch (error) { console.error("PDF Export failed", error); }
  }, [analysisResult, state]);

  const categoriesForComponents = useMemo(() => {
    const allCategories: StockCategory[] = [...activeMarketConfig.stockCategories];
    if (customStockList.length > 0) {
        return [{ name: 'My Stocks', symbols: customStockList, description: 'Your saved stocks.', key_influencers: [] }, ...allCategories];
    }
    return allCategories;
  }, [activeMarketConfig.stockCategories, customStockList]);

  const renderContent = () => {
    if (isConfiguring && currentSymbol) {
      return <AnalysisConfiguration onRunAnalysis={handleRunAnalysis} onCancel={handleNavigateHome} />;
    }
    
    if (!currentSymbol) {
        return (
            <HomePage
                categories={categoriesForComponents}
                onSelectStock={handleSelectStock}
                onRemoveStock={handleRemoveStock}
                onAddStock={handleAddStock}
                isAdding={isAddingStock}
                addError={addError}
                onClearAddError={() => dispatch({ type: 'SET_ADD_ERROR', payload: null })}
                disabled={isAnalysisRunning}
                marketName={activeMarketConfig.name}
                experts={activeMarketConfig.experts || []}
            />
        );
    }

    return <div className="animate-fade-in"><main><TabbedAnalysis onRetry={handleRunAnalysis} /></main></div>;
  };

  return (
    <ErrorBoundary>
      <div className="bg-gray-50 min-h-screen dark:bg-slate-900 flex flex-col">
        <div className="flex-grow">
          <Header onSearchSelect={handleSelectStock} onSearchSubmit={handleAddStock} onExport={handleExportPdf} />
          <div className="container mx-auto px-2 sm:px-4 md:px-6 py-6">
              <Breadcrumbs onNavigateHome={handleNavigateHome} />
              <NutshellSummary />
              {renderContent()}
          </div>
        </div>
        <footer className="text-center py-4 px-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 shrink-0">
            AI-generated analysis for informational purposes only. Not investment advice. All financial data is subject to change and may contain inaccuracies.
        </footer>
        <ShortcutsPanel show={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </div>
    </ErrorBoundary>
  );
};

export default App;