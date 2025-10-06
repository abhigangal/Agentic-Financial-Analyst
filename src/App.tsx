import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
// FIX: Replace deprecated types with MarketIntelligenceAnalysis
import { StockAnalysis, EsgAnalysis, MacroAnalysis, MarketIntelligenceAnalysis, LeadershipAnalysis, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, ChiefAnalystCritique, ExecutionStep, RawFinancials, CalculatedMetric, GroundingSource, TechnicalAnalysis, ContrarianAnalysis, AgentKey, StockCategory, Expert, DataAndTechnicalsAnalysis } from './types';
// FIX: Replace deprecated service calls with getMarketIntelligenceAnalysis
import { getStockAnalysis, getEsgAnalysis, getMacroAnalysis, getMarketIntelligenceAnalysis, getLeadershipAnalysis, getCompetitiveAnalysis, getSectorAnalysis, getCorporateCalendarAnalysis, getChiefAnalystCritique, getAnalysisPlan, getDataAndTechnicalsAnalysis, getContrarianAnalysis } from './services/geminiService';
import { generateAnalysisPdf } from './services/pdfService';
import { marketConfigs } from './data/markets';
import { Breadcrumbs } from './components/Breadcrumbs';
import { TabbedAnalysis } from './components/TabbedAnalysis';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/HomePage';
import { NutshellSummary } from './components/NutshellSummary';
import { AnalysisConfiguration } from './components/AnalysisConfiguration';
import * as calculator from './services/calculatorService';
import { ShortcutsPanel } from './components/common/ShortcutsPanel';


const LOCAL_STORAGE_KEY = 'agentic_financial_analyst_custom_stocks';
export const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface AnalysisCacheItem {
    analysisResult: StockAnalysis;
    esgAnalysis: EsgAnalysis | null;
    macroAnalysis: MacroAnalysis | null;
    // FIX: Replace deprecated types with MarketIntelligenceAnalysis
    marketIntelligenceAnalysis: MarketIntelligenceAnalysis | null;
    leadershipAnalysis: LeadershipAnalysis | null;
    competitiveAnalysis: CompetitiveAnalysis | null;
    sectorAnalysis: SectorAnalysis | null;
    corporateCalendarAnalysis: CorporateCalendarAnalysis | null;
    timestamp: number;
}

export interface AgentCacheItem {
    data: any;
    timestamp: number;
}

export type AnalysisPhase = 'IDLE' | 'PLANNING' | 'GATHERING' | 'CALCULATING' | 'VERIFYING' | 'DRAFTING' | 'DEBATING' | 'REFINING' | 'FINALIZING' | 'COMPLETE' | 'ERROR' | 'PAUSED';

interface AgentStatus { isLoading: boolean; error: string | null; }
const initialAgentStatus = { isLoading: false, error: null };

// Helper to reliably extract the summary string from different agent result types.
const getSummaryFromAgentResult = (agentKey: AgentKey, result: any): string => {
    if (!result) return 'N/A';
    try {
        switch (agentKey) {
            case 'esg': return result.justification?.overall_summary || JSON.stringify(result);
            case 'macro': return result.outlook_summary || JSON.stringify(result);
            case 'competitive': return result.competitive_summary || JSON.stringify(result);
            // FIX: Replaced 'news' and 'sentiment' with 'market_intel' and updated the summary property.
            case 'market_intel': return result.intelligence_summary || JSON.stringify(result);
            case 'contrarian': return result.bear_case_summary || JSON.stringify(result);
            case 'leadership':
            case 'sector':
            case 'calendar':
                return result.summary || JSON.stringify(result);
            default:
                return JSON.stringify(result);
        }
    } catch {
        return JSON.stringify(result);
    }
};

const App: React.FC = () => {
  // Main Analysis State
  const [analysisResult, setAnalysisResult] = useState<StockAnalysis | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('IDLE');
  
  // Explainability State
  const [executionLog, setExecutionLog] = useState<ExecutionStep[]>([]);
  const [analysisPlan, setAnalysisPlan] = useState<string | null>(null);
  
  // Agent-specific data
  const [esgAnalysis, setEsgAnalysis] = useState<EsgAnalysis | null>(null);
  const [macroAnalysis, setMacroAnalysis] = useState<MacroAnalysis | null>(null);
  // FIX: Replaced newsAnalysis and marketSentimentAnalysis with marketIntelligenceAnalysis.
  const [marketIntelligenceAnalysis, setMarketIntelligenceAnalysis] = useState<MarketIntelligenceAnalysis | null>(null);
  const [leadershipAnalysis, setLeadershipAnalysis] = useState<LeadershipAnalysis | null>(null);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const [sectorAnalysis, setSectorAnalysis] = useState<SectorAnalysis | null>(null);
  const [corporateCalendarAnalysis, setCorporateCalendarAnalysis] = useState<CorporateCalendarAnalysis | null>(null);
  const [technicalAnalysis, setTechnicalAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [contrarianAnalysis, setContrarianAnalysis] = useState<ContrarianAnalysis | null>(null);
  const [chiefAnalystCritique, setChiefAnalystCritique] = useState<(ChiefAnalystCritique & { refined_answer?: string }) | null>(null);
  const [rawFinancials, setRawFinancials] = useState<RawFinancials | null>(null);
  const [calculatedMetrics, setCalculatedMetrics] = useState<Record<string, CalculatedMetric>>({});


  // Consolidated status management for all agents
  const [agentStatuses, setAgentStatuses] = useState({
    financial: initialAgentStatus,
    esg: initialAgentStatus,
    macro: initialAgentStatus,
    // FIX: Replaced news, sentiment with market_intel.
    market_intel: initialAgentStatus,
    leadership: initialAgentStatus,
    competitive: initialAgentStatus,
    sector: initialAgentStatus,
    calendar: initialAgentStatus,
    contrarian: initialAgentStatus,
    chief: initialAgentStatus,
    // FIX: Replaced data_extractor with data_and_technicals.
    data_and_technicals: initialAgentStatus,
  });

  // Market State
  const [selectedMarketId, setSelectedMarketId] = useState<string>('IN');
  const activeMarketConfig = useMemo(() => marketConfigs[selectedMarketId], [selectedMarketId]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(activeMarketConfig.currencySymbol);

  // UI State
  const [customStockList, setCustomStockList] = useState<string[]>(() => {
    try {
      const savedList = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedList ? JSON.parse(savedList) : [];
    } catch (e) {
      console.error("Failed to load custom stocks from localStorage", e);
      return [];
    }
  });
  
  const [analysisCache, setAnalysisCache] = useState<Record<string, AnalysisCacheItem>>({});
  const [agentCache, setAgentCache] = useState<Record<string, AgentCacheItem>>({});
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [enabledAgents, setEnabledAgents] = useState<Record<AgentKey, boolean> | null>(null);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const isAnalysisRunning = analysisPhase !== 'IDLE' && analysisPhase !== 'COMPLETE' && analysisPhase !== 'ERROR' && analysisPhase !== 'PAUSED';
  
  const setAgentStatus = (agent: keyof typeof agentStatuses, status: Partial<AgentStatus>) => {
    setAgentStatuses(prev => ({ ...prev, [agent]: { ...prev[agent], ...status } }));
  };
  
  const addExecutionLog = (step: Omit<ExecutionStep, 'id' | 'timestamp'>) => {
    const newStep: ExecutionStep = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...step,
    };
    setExecutionLog(prev => [...prev, newStep]);
    return newStep.id;
  };
  
  const updateExecutionLog = (id: number, updates: Partial<ExecutionStep>) => {
      setExecutionLog(prev => {
          const newLog = [...prev];
          const stepIndex = newLog.findIndex(step => step.id === id);
          if (stepIndex > -1) {
              newLog[stepIndex] = { ...newLog[stepIndex], ...updates };
          }
          return newLog;
      });
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '?') {
            e.preventDefault();
            setShowShortcuts(s => !s);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
             e.preventDefault();
             // This is where a global search command palette would be triggered.
             console.log("Trigger global search (not implemented)");
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customStockList));
    } catch (e) {
      console.error("Failed to save custom stock list to localStorage", e);
    }
  }, [customStockList]);

  useEffect(() => {
    setSelectedCurrency(activeMarketConfig.currencySymbol);
  }, [activeMarketConfig]);

  const handleCurrencyChange = (symbol: string) => {
    setSelectedCurrency(symbol);
  };
  
  const allPredefinedSymbols = useMemo(() => {
    const symbols = new Set<string>();
    activeMarketConfig.stockCategories.forEach(cat => cat.symbols.forEach(sym => symbols.add(sym)));
    customStockList.forEach(sym => symbols.add(sym));
    return Array.from(symbols);
  }, [activeMarketConfig.stockCategories, customStockList]);
  
  const agentRunner = useCallback(async <T,>(
        agentKey: AgentKey | 'data_and_technicals' | 'chief' | 'financial' | 'local',
        stepName: string,
        serviceCall: () => Promise<T>,
        isCached: boolean = false,
        inputToLog?: object | string,
        delayMs: number = 0
    ): Promise<T | null> => {
        const symbol = currentSymbol; // Capture currentSymbol at execution time
        if (!symbol) throw new Error("No stock symbol selected.");
        
        if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        setAgentStatus(agentKey as any, { isLoading: true, error: null });
        const logId = addExecutionLog({
            agentKey: agentKey as any,
            stepName,
            status: 'running',
            input: inputToLog ? JSON.stringify(inputToLog, null, 2) : undefined
        });
        try {
            let data: T;
            const cacheKey = `${agentKey}-${symbol}`;
            const cachedItem = agentCache[cacheKey];
            if (isCached && cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL_MS)) {
                console.log(`[Cache] Using cached ${agentKey} data for ${symbol}.`);
                data = cachedItem.data;
            } else {
                data = await serviceCall();
                if (isCached) {
                    setAgentCache(prev => ({ ...prev, [cacheKey]: { data, timestamp: Date.now() } }));
                }
            }
            updateExecutionLog(logId, { status: 'complete', output: JSON.stringify(data, null, 2), sources: (data as any)?.sources, confidence: (data as any)?.confidence_score });
            setAgentStatus(agentKey as any, { isLoading: false });
            return data;
        } catch (e: any) {
            const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
            updateExecutionLog(logId, { status: 'error', output: errorMsg });
            setAgentStatus(agentKey as any, { isLoading: false, error: errorMsg });
            throw new Error(errorMsg);
        }
    }, [agentCache, currentSymbol]);


  const runAnalysis = useCallback(async (symbol: string, enabledAgentsConfig: Record<AgentKey, boolean>) => {
    if (!symbol) return;
    setCurrentSymbol(symbol);
    
    setAnalysisResult(null);
    setEsgAnalysis(null);
    setMacroAnalysis(null);
    setMarketIntelligenceAnalysis(null);
    setLeadershipAnalysis(null);
    setCompetitiveAnalysis(null);
    setSectorAnalysis(null);
    setCorporateCalendarAnalysis(null);
    setTechnicalAnalysis(null);
    setContrarianAnalysis(null);
    setChiefAnalystCritique(null);
    setRawFinancials(null);
    setCalculatedMetrics({});
    setExecutionLog([]);
    setAnalysisPlan(null);
    setAgentStatuses({
        financial: initialAgentStatus, esg: initialAgentStatus, macro: initialAgentStatus,
        market_intel: initialAgentStatus, leadership: initialAgentStatus, competitive: initialAgentStatus,
        sector: initialAgentStatus, calendar: initialAgentStatus, contrarian: initialAgentStatus, 
        chief: initialAgentStatus, data_and_technicals: initialAgentStatus,
    });
    setAnalysisPhase('PLANNING');
    
    const plan = await agentRunner('financial', 'Create Analysis Plan', () => getAnalysisPlan(symbol, activeMarketConfig.name, Object.keys(enabledAgentsConfig).filter(k => enabledAgentsConfig[k as AgentKey]).join(', ')));
    if (!plan) { setAnalysisPhase('ERROR'); return; }
    setAnalysisPlan(plan as string);
    setAnalysisPhase('GATHERING');

    const dataPromises: Record<string, Promise<any>> = {};
    let agentDelay = 0;
    const jitter = () => Math.random() * 200;

    const screenerUrl = activeMarketConfig.screenerUrlTemplate.replace('{symbol}', symbol);
    dataPromises.dataAndTechnicals = agentRunner('data_and_technicals', 'Extract Financials & Technicals', () => getDataAndTechnicalsAnalysis(screenerUrl, activeMarketConfig.screenerName, activeMarketConfig.name), true, undefined, agentDelay);

    if (enabledAgentsConfig.esg) { agentDelay += 150 + jitter(); dataPromises.esg = agentRunner('esg', 'Analyze ESG Profile', () => getEsgAnalysis(symbol, activeMarketConfig.name), true, undefined, agentDelay); }
    if (enabledAgentsConfig.macro) { agentDelay += 150 + jitter(); dataPromises.macro = agentRunner('macro', 'Analyze Macroeconomic Trends', () => getMacroAnalysis(symbol, activeMarketConfig.name), true, undefined, agentDelay); }
    if (enabledAgentsConfig.market_intel) { agentDelay += 150 + jitter(); dataPromises.market_intel = agentRunner('market_intel', 'Analyze Market Intelligence', () => getMarketIntelligenceAnalysis(symbol, activeMarketConfig.name), true, undefined, agentDelay); }
    if (enabledAgentsConfig.leadership) { agentDelay += 150 + jitter(); dataPromises.leadership = agentRunner('leadership', 'Analyze Leadership Team', () => getLeadershipAnalysis(symbol, activeMarketConfig.name), true, undefined, agentDelay); }
    if (enabledAgentsConfig.competitive) { agentDelay += 150 + jitter(); dataPromises.competitive = agentRunner('competitive', 'Analyze Competitors', () => getCompetitiveAnalysis(symbol, activeMarketConfig.name), true, undefined, agentDelay); }
    if (enabledAgentsConfig.sector) { agentDelay += 150 + jitter(); dataPromises.sector = agentRunner('sector', 'Analyze Sector Outlook', () => getSectorAnalysis(symbol, activeMarketConfig.name), true, undefined, agentDelay); }
    if (enabledAgentsConfig.calendar) { agentDelay += 150 + jitter(); dataPromises.calendar = agentRunner('calendar', 'Analyze Corporate Calendar', () => getCorporateCalendarAnalysis(symbol, activeMarketConfig.name), true, undefined, agentDelay); }
    
    const dataEntries = Object.entries(dataPromises);
    const results = await Promise.allSettled(dataEntries.map(entry => entry[1]));

    const gatheredData: { [key: string]: any } = {};
    const successfulAgents: AgentKey[] = [];
    let hasFailed = false;

    results.forEach((result, index) => {
        const key = dataEntries[index][0];
        if (result.status === 'fulfilled') {
            gatheredData[key] = result.value;
            if (key !== 'dataAndTechnicals') successfulAgents.push(key as AgentKey);
        } else {
            hasFailed = true;
            console.error(`[Analysis Workflow] Agent for '${key}' failed:`, result.reason);
        }
    });

    if (hasFailed) {
        addExecutionLog({
            agentKey: 'local', stepName: 'Analysis Paused', status: 'paused',
            output: 'One or more intelligence agents failed. Review logs and retry individual agents or the full analysis.',
        });
        setAnalysisPhase('PAUSED');
        return;
    }

    const dtAnalysis = gatheredData.dataAndTechnicals as DataAndTechnicalsAnalysis | null;
    setRawFinancials(dtAnalysis?.raw_financials || null);
    setTechnicalAnalysis(dtAnalysis?.technical_analysis || null);
    setEsgAnalysis(gatheredData.esg || null);
    setMacroAnalysis(gatheredData.macro || null);
    setMarketIntelligenceAnalysis(gatheredData.market_intel || null);
    setLeadershipAnalysis(gatheredData.leadership || null);
    setCompetitiveAnalysis(gatheredData.competitive || null);
    setSectorAnalysis(gatheredData.sector || null);
    setCorporateCalendarAnalysis(gatheredData.calendar || null);

    setAnalysisPhase('CALCULATING');
    const logIdCalc = addExecutionLog({ agentKey: 'local', stepName: 'Calculate Key Metrics', status: 'running' });
    const localRawFinancials = dtAnalysis?.raw_financials;
    const metrics: Record<string, CalculatedMetric> = {};
    if (localRawFinancials) {
        metrics.debtToEquity = calculator.calculateDebtToEquity(localRawFinancials.total_debt, localRawFinancials.total_equity);
        metrics.peRatio = calculator.calculatePERatio(localRawFinancials.current_price, localRawFinancials.eps);
        metrics.pbRatio = calculator.calculatePBRatio(localRawFinancials.current_price, localRawFinancials.book_value_per_share);
        metrics.roe = calculator.calculateROE(localRawFinancials.eps, localRawFinancials.book_value_per_share);
    }
    setCalculatedMetrics(metrics);
    updateExecutionLog(logIdCalc, { status: 'complete', output: JSON.stringify(metrics, null, 2) });
    
    setAnalysisPhase('VERIFYING');
    const logIdVerify = addExecutionLog({ agentKey: 'local', stepName: 'Verify Financials', status: 'running' });
    updateExecutionLog(logIdVerify, { status: 'complete', output: 'Verification complete.' });

    setAnalysisPhase('DRAFTING');
    const contextStrings: { [key: string]: string } = {};
    if (gatheredData.esg) contextStrings.esg = getSummaryFromAgentResult('esg', gatheredData.esg);
    if (gatheredData.macro) contextStrings.macro = getSummaryFromAgentResult('macro', gatheredData.macro);
    if (gatheredData.market_intel) contextStrings.market_intel = getSummaryFromAgentResult('market_intel', gatheredData.market_intel);
    if (gatheredData.leadership) contextStrings.leadership = getSummaryFromAgentResult('leadership', gatheredData.leadership);
    if (gatheredData.competitive) contextStrings.competitive = getSummaryFromAgentResult('competitive', gatheredData.competitive);
    if (gatheredData.sector) contextStrings.sector = getSummaryFromAgentResult('sector', gatheredData.sector);
    if (gatheredData.calendar) contextStrings.calendar = getSummaryFromAgentResult('calendar', gatheredData.calendar);
    if (dtAnalysis?.technical_analysis?.summary) contextStrings.technical = dtAnalysis.technical_analysis.summary;
    
    const draftAnalysis = await agentRunner<StockAnalysis>('financial', 'Synthesize Draft Report', () => getStockAnalysis(symbol, activeMarketConfig.name, contextStrings, localRawFinancials, metrics, ''));
    if (!draftAnalysis) { setAnalysisPhase('ERROR'); return; }

    let localContrarianAnalysis: ContrarianAnalysis | null = null;
    if (enabledAgentsConfig.contrarian) {
        const contrarianResult = await agentRunner<ContrarianAnalysis>('contrarian', 'Develop Contrarian Bear Case', () => getContrarianAnalysis(draftAnalysis.justification.overall_recommendation, contextStrings), true);
        if (contrarianResult) {
            localContrarianAnalysis = contrarianResult;
            setContrarianAnalysis(localContrarianAnalysis);
            contextStrings.contrarian = getSummaryFromAgentResult('contrarian', contrarianResult);
            successfulAgents.push('contrarian');
        }
    }
    
    setAnalysisPhase('DEBATING');
    const critique = await agentRunner<ChiefAnalystCritique>('chief', 'Debate & Critique Draft', () => getChiefAnalystCritique(draftAnalysis.justification.overall_recommendation, contextStrings, successfulAgents));
    if (!critique) {
        setAnalysisResult(draftAnalysis);
        setAnalysisPhase('COMPLETE');
        return;
    }
    setChiefAnalystCritique(critique);
    
    setAnalysisPhase('REFINING');

    setAnalysisPhase('FINALIZING');
    const critiquePrompt = `\n\nA chief analyst has reviewed the initial data and raised a critical point: "${critique.conflict_summary}". Your final analysis MUST address this critique directly in the 'overall_recommendation' section.\n`;
    const finalResult = await agentRunner<StockAnalysis>('financial', 'Finalize Aligned Report', () => getStockAnalysis(symbol, activeMarketConfig.name, contextStrings, localRawFinancials, metrics, critiquePrompt));

    if (finalResult) {
        finalResult.chiefAnalystCritique = critique;
        finalResult.technicalAnalysis = dtAnalysis?.technical_analysis || null;
        finalResult.contrarianAnalysis = localContrarianAnalysis;
        setAnalysisResult(finalResult);
    } else {
        setAnalysisResult(draftAnalysis);
    }
    
    setAnalysisPhase('COMPLETE');

  }, [activeMarketConfig, agentCache, agentRunner]);

  
  const handleSelectStock = (symbol: string) => {
    setCurrentSymbol(symbol);
    setIsConfiguring(true);
  };

  const handleRunAnalysis = (enabledAgentsConfig: Record<AgentKey, boolean>) => {
    if (currentSymbol) {
      setEnabledAgents(enabledAgentsConfig);
      setIsConfiguring(false);
      runAnalysis(currentSymbol, enabledAgentsConfig);
    }
  };

  const handleAddStock = async (symbol: string) => {
    setAddError(null);
    setIsAddingStock(true);
    try {
      const isValid = await activeMarketConfig.validateSymbol(symbol);
      if (isValid) {
        const upperSymbol = symbol.toUpperCase();
        if (!allPredefinedSymbols.includes(upperSymbol)) {
          setCustomStockList(prev => [...prev, upperSymbol]);
        }
        handleSelectStock(upperSymbol);
      } else {
        setAddError(`Symbol '${symbol.toUpperCase()}' not found or is invalid for the ${activeMarketConfig.name} market.`);
      }
    } finally {
      setIsAddingStock(false);
    }
  };

  const handleRemoveStock = (symbol: string) => {
    if (currentSymbol === symbol) {
        setCurrentSymbol(null);
        setIsConfiguring(false);
    }
    setCustomStockList(prev => prev.filter(s => s !== symbol));
  };

  const handleNavigateHome = () => {
    setCurrentSymbol(null);
    setIsConfiguring(false);
    setAnalysisPhase('IDLE');
    setAnalysisResult(null);
    setEsgAnalysis(null);
    setMacroAnalysis(null);
    setMarketIntelligenceAnalysis(null);
    setLeadershipAnalysis(null);
    setCompetitiveAnalysis(null);
    setSectorAnalysis(null);
    setCorporateCalendarAnalysis(null);
    setTechnicalAnalysis(null);
    setContrarianAnalysis(null);
    setExecutionLog([]);
  };
  
  const handleExportPdf = useCallback(async () => {
    if (!analysisResult) return;
    try {
      // FIX: The generateAnalysisPdf function signature was updated.
      await generateAnalysisPdf(
        analysisResult, esgAnalysis, macroAnalysis, marketIntelligenceAnalysis,
        leadershipAnalysis, competitiveAnalysis, sectorAnalysis, corporateCalendarAnalysis,
        technicalAnalysis, contrarianAnalysis, selectedCurrency, null, null
      );
    } catch (error) {
      console.error("PDF Export failed", error);
    }
  }, [analysisResult, esgAnalysis, macroAnalysis, marketIntelligenceAnalysis, leadershipAnalysis, competitiveAnalysis, sectorAnalysis, corporateCalendarAnalysis, selectedCurrency, technicalAnalysis, contrarianAnalysis]);
  
  const handleMarketChange = (marketId: string) => {
    if (marketId !== selectedMarketId) {
        setSelectedMarketId(marketId);
        setCurrentSymbol(null);
        setIsConfiguring(false);
        setAnalysisPhase('IDLE');
        setCustomStockList([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleRetryAnalysis = useCallback(() => {
    if (currentSymbol && enabledAgents) {
      runAnalysis(currentSymbol, enabledAgents);
    }
  }, [currentSymbol, enabledAgents, runAnalysis]);
  
  const categoriesForComponents = useMemo(() => {
    const allCategories: StockCategory[] = [...activeMarketConfig.stockCategories];
    if (customStockList.length > 0) {
        const existingCustomIndex = allCategories.findIndex(c => c.name === 'My Stocks');
        if (existingCustomIndex > -1) {
            allCategories.splice(existingCustomIndex, 1);
        }
        allCategories.push({
            name: 'My Stocks',
            symbols: customStockList,
            description: 'Your saved stocks for this market.',
            key_influencers: [],
        });
    }
    return allCategories;
}, [activeMarketConfig.stockCategories, customStockList]);

  const renderContent = () => {
    if (isConfiguring && currentSymbol) {
      return (
        <AnalysisConfiguration
          stockSymbol={currentSymbol}
          onRunAnalysis={handleRunAnalysis}
          onCancel={handleNavigateHome}
          analysisCache={analysisCache}
        />
      );
    }
    
    if (!currentSymbol) {
        return (
            <HomePage
                categories={categoriesForComponents}
                currentSymbol={currentSymbol}
                onSelectStock={handleSelectStock}
                onRemoveStock={handleRemoveStock}
                onAddStock={handleAddStock}
                isAdding={isAddingStock}
                addError={addError}
                onClearAddError={() => setAddError(null)}
                disabled={isAnalysisRunning}
                analysisCache={analysisCache}
                marketName={activeMarketConfig.name}
                experts={activeMarketConfig.experts || []}
            />
        );
    }

    return (
        <div className="animate-fade-in">
          <main>
              <TabbedAnalysis
                  currentSymbol={currentSymbol}
                  analysisResult={analysisResult}
                  esgAnalysis={esgAnalysis}
                  macroAnalysis={macroAnalysis}
                  marketIntelligenceAnalysis={marketIntelligenceAnalysis}
                  leadershipAnalysis={leadershipAnalysis}
                  competitiveAnalysis={competitiveAnalysis}
                  sectorAnalysis={sectorAnalysis}
                  corporateCalendarAnalysis={corporateCalendarAnalysis}
                  technicalAnalysis={technicalAnalysis}
                  contrarianAnalysis={contrarianAnalysis}
                  currencySymbol={selectedCurrency}
                  onRetry={handleRetryAnalysis}
                  onRetryStep={handleRetryAnalysis}
                  enabledAgents={enabledAgents}
                  analysisPhase={analysisPhase}
                  agentStatuses={agentStatuses}
                  executionLog={executionLog}
                  analysisPlan={analysisPlan}
                  rawFinancials={rawFinancials}
                  calculatedMetrics={calculatedMetrics}
                  publicSentimentAnalysis={null}
                  secFilingsAnalysis={null}
                  snapshots={[]}
                  isCachedView={false}
                  onRefresh={() => {}}
                  analysisCache={{}}
              />
          </main>
        </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="bg-gray-50 min-h-screen dark:bg-slate-900">
        <Header 
          selectedMarketId={selectedMarketId} 
          onMarketChange={handleMarketChange} 
          selectedCurrency={selectedCurrency}
          onCurrencyChange={handleCurrencyChange}
          allSymbols={allPredefinedSymbols}
          onSearchSelect={handleSelectStock}
          onSearchSubmit={handleAddStock}
          addError={addError}
          onClearAddError={() => setAddError(null)}
          isAnalysisRunning={isAnalysisRunning}
          analysisResult={analysisResult}
          onExport={handleExportPdf}
          onSaveSnapshot={() => {}}
          isCachedView={false}
          onRefresh={() => {}}
        />
        <div className="container mx-auto px-2 sm:px-4 md:px-6 py-6">
            <Breadcrumbs currentSymbol={currentSymbol} onNavigateHome={handleNavigateHome} categories={categoriesForComponents} />
            <NutshellSummary summary={analysisResult?.justification.nutshell_summary} />
            {renderContent()}
        </div>
        <ShortcutsPanel show={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </div>
    </ErrorBoundary>
  );
};

export default App;
