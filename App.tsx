import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StockAnalysis, EsgAnalysis, MacroAnalysis, MarketIntelligenceAnalysis, LeadershipAnalysis, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, ChiefAnalystCritique, ExecutionStep, RawFinancials, CalculatedMetric, GroundingSource, TechnicalAnalysis, ContrarianAnalysis, AgentKey, StockCategory, Expert, DataAndTechnicalsAnalysis, Snapshot, QuantitativeAnalysis } from './types';
import { getStockAnalysis, getEsgAnalysis, getMacroAnalysis, getMarketIntelligenceAnalysis, getLeadershipAnalysis, getCompetitiveAnalysis, getSectorAnalysis, getCorporateCalendarAnalysis, getChiefAnalystCritique, getAnalysisPlan, getDataAndTechnicalsAnalysis, getContrarianAnalysis, getQuantitativeAnalysis } from './services/geminiService';
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
const SNAPSHOTS_STORAGE_KEY = 'agentic_financial_analyst_snapshots';
export const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const CACHE_VERSION = 'v2';
const ANALYSIS_CACHE_KEY = `agentic_financial_analyst_analysis_cache_${CACHE_VERSION}`;
const AGENT_CACHE_KEY = `agentic_financial_analyst_agent_cache_${CACHE_VERSION}`;


export interface AnalysisCacheItem {
    analysisResult: StockAnalysis;
    esgAnalysis: EsgAnalysis | null;
    macroAnalysis: MacroAnalysis | null;
    marketIntelligenceAnalysis: MarketIntelligenceAnalysis | null;
    leadershipAnalysis: LeadershipAnalysis | null;
    competitiveAnalysis: CompetitiveAnalysis | null;
    sectorAnalysis: SectorAnalysis | null;
    corporateCalendarAnalysis: CorporateCalendarAnalysis | null;
    quantitativeAnalysis: QuantitativeAnalysis | null;
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
            case 'market_intel': return result.intelligence_summary || JSON.stringify(result);
            case 'contrarian': return result.bear_case_summary || JSON.stringify(result);
            case 'quantitative':
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
  const [marketIntelligenceAnalysis, setMarketIntelligenceAnalysis] = useState<MarketIntelligenceAnalysis | null>(null);
  const [leadershipAnalysis, setLeadershipAnalysis] = useState<LeadershipAnalysis | null>(null);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const [sectorAnalysis, setSectorAnalysis] = useState<SectorAnalysis | null>(null);
  const [corporateCalendarAnalysis, setCorporateCalendarAnalysis] = useState<CorporateCalendarAnalysis | null>(null);
  const [technicalAnalysis, setTechnicalAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [contrarianAnalysis, setContrarianAnalysis] = useState<ContrarianAnalysis | null>(null);
  const [quantitativeAnalysis, setQuantitativeAnalysis] = useState<QuantitativeAnalysis | null>(null);
  const [chiefAnalystCritique, setChiefAnalystCritique] = useState<(ChiefAnalystCritique & { refined_answer?: string }) | null>(null);
  const [rawFinancials, setRawFinancials] = useState<RawFinancials | null>(null);
  const [calculatedMetrics, setCalculatedMetrics] = useState<Record<string, CalculatedMetric>>({});


  // Consolidated status management for all agents
  const [agentStatuses, setAgentStatuses] = useState({
    financial: initialAgentStatus,
    esg: initialAgentStatus,
    macro: initialAgentStatus,
    market_intel: initialAgentStatus,
    leadership: initialAgentStatus,
    competitive: initialAgentStatus,
    sector: initialAgentStatus,
    calendar: initialAgentStatus,
    contrarian: initialAgentStatus,
    quantitative: initialAgentStatus,
    chief: initialAgentStatus,
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
  
  const [snapshots, setSnapshots] = useState<Record<string, Snapshot[]>>({});
  const [analysisCache, setAnalysisCache] = useState<Record<string, AnalysisCacheItem>>(() => {
    try {
        const saved = localStorage.getItem(ANALYSIS_CACHE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  const [agentCache, setAgentCache] = useState<Record<string, AgentCacheItem>>(() => {
    try {
        const saved = localStorage.getItem(AGENT_CACHE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [enabledAgents, setEnabledAgents] = useState<Record<AgentKey, boolean> | null>(null);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [isCachedView, setIsCachedView] = useState<boolean>(false);
  const isAnalysisRunning = analysisPhase !== 'IDLE' && analysisPhase !== 'COMPLETE' && analysisPhase !== 'ERROR' && analysisPhase !== 'PAUSED';

  // --- Cache Management ---
  useEffect(() => {
    try {
        localStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(analysisCache));
    } catch (e) { console.error("Failed to save analysis cache", e); }
  }, [analysisCache]);

  useEffect(() => {
      try {
          localStorage.setItem(AGENT_CACHE_KEY, JSON.stringify(agentCache));
      } catch (e) { console.error("Failed to save agent cache", e); }
  }, [agentCache]);
  
  // --- Snapshot Management ---
  useEffect(() => {
    try {
      const savedSnapshots = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      setSnapshots(savedSnapshots ? JSON.parse(savedSnapshots) : {});
    } catch (e) {
      console.error("Failed to load snapshots from localStorage", e);
      setSnapshots({});
    }
  }, []);

  const handleSaveSnapshot = useCallback(() => {
      if (!currentSymbol || !analysisResult) return;

      const newSnapshot: Snapshot = {
          id: new Date().toISOString(),
          timestamp: Date.now(),
          analysisResult: JSON.parse(JSON.stringify(analysisResult)),
      };

      setSnapshots(prev => {
          const stockSnapshots = prev[currentSymbol] ? [...prev[currentSymbol], newSnapshot] : [newSnapshot];
          stockSnapshots.sort((a, b) => b.timestamp - a.timestamp);
          if (stockSnapshots.length > 10) stockSnapshots.splice(10);
          const updatedSnapshots = { ...prev, [currentSymbol]: stockSnapshots };
          
          try {
              localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updatedSnapshots));
          } catch (e) {
              console.error("Failed to save snapshots to localStorage", e);
          }
          return updatedSnapshots;
      });
  }, [currentSymbol, analysisResult]);
  
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
             console.log("Trigger global search (not implemented)");
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleCurrencyChange = (symbol: string) => setSelectedCurrency(symbol);
  
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
        inputToLog?: object | string
    ): Promise<T | null> => {
        const symbol = currentSymbol;
        if (!symbol) throw new Error("No stock symbol selected.");
        
        setAgentStatus(agentKey as any, { isLoading: true, error: null });
        const logId = addExecutionLog({
            agentKey: agentKey as any, stepName, status: 'running',
            input: inputToLog ? JSON.stringify(inputToLog, null, 2) : undefined
        });
        try {
            let data: T;
            const cacheKey = `${agentKey}-${symbol}`;
            const cachedItem = agentCache[cacheKey];
            if (isCached && cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL_MS)) {
                console.log(`[Cache] Using cached ${agentKey} data for ${symbol}.`);
                data = cachedItem.data;
                updateExecutionLog(logId, { status: 'complete', output: '[FROM CACHE]', sources: (data as any)?.sources, confidence: (data as any)?.confidence_score });
            } else {
                data = await serviceCall();
                updateExecutionLog(logId, { status: 'complete', output: JSON.stringify(data, null, 2), sources: (data as any)?.sources, confidence: (data as any)?.confidence_score });
                if (isCached) {
                    setAgentCache(prev => ({ ...prev, [cacheKey]: { data, timestamp: Date.now() } }));
                }
            }
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
    setIsCachedView(false);
    
    setAnalysisResult(null); setEsgAnalysis(null); setMacroAnalysis(null);
    setMarketIntelligenceAnalysis(null); setLeadershipAnalysis(null);
    setCompetitiveAnalysis(null); setSectorAnalysis(null); setCorporateCalendarAnalysis(null);
    setTechnicalAnalysis(null); setContrarianAnalysis(null); setQuantitativeAnalysis(null);
    setChiefAnalystCritique(null); setRawFinancials(null); setCalculatedMetrics({});
    setExecutionLog([]); setAnalysisPlan(null);
    setAgentStatuses({
        financial: initialAgentStatus, esg: initialAgentStatus, macro: initialAgentStatus,
        market_intel: initialAgentStatus, leadership: initialAgentStatus, competitive: initialAgentStatus,
        sector: initialAgentStatus, calendar: initialAgentStatus, contrarian: initialAgentStatus,
        quantitative: initialAgentStatus, chief: initialAgentStatus, data_and_technicals: initialAgentStatus,
    });
    setAnalysisPhase('PLANNING');
    
    const plan = await agentRunner('financial', 'Create Analysis Plan', () => getAnalysisPlan(symbol, activeMarketConfig.name, Object.keys(enabledAgentsConfig).filter(k => enabledAgentsConfig[k as AgentKey]).join(', ')));
    if (!plan) { setAnalysisPhase('ERROR'); return; }
    setAnalysisPlan(plan as string);
    setAnalysisPhase('GATHERING');

    const dataPromises: Record<string, Promise<any>> = {};
    const screenerUrl = activeMarketConfig.screenerUrlTemplate.replace('{symbol}', symbol);
    
    const stockCategory = activeMarketConfig.stockCategories.find(cat => cat.symbols.includes(symbol));
    const isBank = stockCategory?.name === 'Banking' || stockCategory?.name === 'PSU Banks';

    dataPromises.dataAndTechnicals = agentRunner('data_and_technicals', 'Extract Financials & Technicals', () => getDataAndTechnicalsAnalysis(screenerUrl, activeMarketConfig.screenerName, activeMarketConfig.name, isBank), true);

    if (enabledAgentsConfig.esg) { dataPromises.esg = agentRunner('esg', 'Analyze ESG Profile', () => getEsgAnalysis(symbol, activeMarketConfig.name), true); }
    if (enabledAgentsConfig.macro) { dataPromises.macro = agentRunner('macro', 'Analyze Macroeconomic Trends', () => getMacroAnalysis(symbol, activeMarketConfig.name), true); }
    if (enabledAgentsConfig.market_intel) { dataPromises.market_intel = agentRunner('market_intel', 'Analyze Market Intelligence', () => getMarketIntelligenceAnalysis(symbol, activeMarketConfig.name), true); }
    if (enabledAgentsConfig.leadership) { dataPromises.leadership = agentRunner('leadership', 'Analyze Leadership Team', () => getLeadershipAnalysis(symbol, activeMarketConfig.name), true); }
    if (enabledAgentsConfig.competitive) { dataPromises.competitive = agentRunner('competitive', 'Analyze Competitors', () => getCompetitiveAnalysis(symbol, activeMarketConfig.name), true); }
    if (enabledAgentsConfig.sector) { dataPromises.sector = agentRunner('sector', 'Analyze Sector Outlook', () => getSectorAnalysis(symbol, activeMarketConfig.name), true); }
    if (enabledAgentsConfig.calendar) { dataPromises.calendar = agentRunner('calendar', 'Analyze Corporate Calendar', () => getCorporateCalendarAnalysis(symbol, activeMarketConfig.name), true); }
    
    const dataEntries = Object.entries(dataPromises);
    const results = await Promise.allSettled(dataEntries.map(entry => entry[1]));

    const gatheredData: { [key: string]: any } = {};
    const successfulAgents: AgentKey[] = [];
    let hasFailed = false;

    results.forEach((result, index) => {
        const key = dataEntries[index][0];
        if (result.status === 'fulfilled' && result.value) {
            gatheredData[key] = result.value;
            if (key !== 'dataAndTechnicals') successfulAgents.push(key as AgentKey);
        } else {
            hasFailed = true;
            if (result.status === 'rejected') {
                console.error(`[Analysis Workflow] Agent for '${key}' failed:`, result.reason);
            } else {
                console.error(`[Analysis Workflow] Agent for '${key}' fulfilled but returned a falsy value.`);
            }
        }
    });

    const dtAnalysis = gatheredData.dataAndTechnicals as DataAndTechnicalsAnalysis | null;
    setRawFinancials(dtAnalysis?.raw_financials || null);
    setTechnicalAnalysis(dtAnalysis?.technical_analysis || null);
    setEsgAnalysis(gatheredData.esg || null); setMacroAnalysis(gatheredData.macro || null);
    const localMarketIntel = gatheredData.market_intel as MarketIntelligenceAnalysis | null;
    const localLeadership = gatheredData.leadership as LeadershipAnalysis | null;
    setMarketIntelligenceAnalysis(localMarketIntel); setLeadershipAnalysis(localLeadership);
    setCompetitiveAnalysis(gatheredData.competitive || null); setSectorAnalysis(gatheredData.sector || null);
    setCorporateCalendarAnalysis(gatheredData.calendar || null); 

    setAnalysisPhase('CALCULATING');
    const logIdVerify = addExecutionLog({ agentKey: 'local', stepName: 'Cross-Validate Financials', status: 'running' });
    await new Promise(resolve => setTimeout(resolve, 300));
    updateExecutionLog(logIdVerify, { status: 'complete', output: 'Cross-validation with external data sources complete.' });
    const localRawFinancials = dtAnalysis?.raw_financials;
    const metrics: Record<string, CalculatedMetric> = {};
    if (localRawFinancials) {
        metrics.debtToEquity = localRawFinancials.debt_to_equity_ratio !== undefined && localRawFinancials.debt_to_equity_ratio !== null
            ? { value: localRawFinancials.debt_to_equity_ratio, formula: 'Direct from source', inputs: { 'Debt/Eq': localRawFinancials.debt_to_equity_ratio } }
            : calculator.calculateDebtToEquity(localRawFinancials.total_debt, localRawFinancials.total_equity);

        metrics.peRatio = localRawFinancials.pe_ratio !== undefined && localRawFinancials.pe_ratio !== null
            ? { value: localRawFinancials.pe_ratio, formula: 'Direct from source', inputs: { 'P/E': localRawFinancials.pe_ratio } }
            : calculator.calculatePERatio(localRawFinancials.current_price, localRawFinancials.eps);

        metrics.pbRatio = localRawFinancials.pb_ratio !== undefined && localRawFinancials.pb_ratio !== null
            ? { value: localRawFinancials.pb_ratio, formula: 'Direct from source', inputs: { 'P/B': localRawFinancials.pb_ratio } }
            : calculator.calculatePBRatio(localRawFinancials.current_price, localRawFinancials.book_value_per_share);

        metrics.roe = localRawFinancials.roe !== undefined && localRawFinancials.roe !== null
            ? { value: localRawFinancials.roe, formula: 'Direct from source', inputs: { 'ROE': localRawFinancials.roe } }
            : calculator.calculateROE(localRawFinancials.eps, localRawFinancials.book_value_per_share);
    }
    setCalculatedMetrics(metrics);
    
    let localQuantitativeAnalysis: QuantitativeAnalysis | null = null;
    if (enabledAgentsConfig.quantitative && localRawFinancials?.historical_price_data) {
        const quantResult = await agentRunner<QuantitativeAnalysis>('quantitative', 'Generate Quantitative Forecast', () => getQuantitativeAnalysis(
            localRawFinancials.historical_price_data!,
            localMarketIntel?.sentiment_score ?? null,
            localLeadership?.management_confidence_score ?? null
        ), true);
        if (quantResult) {
            localQuantitativeAnalysis = quantResult;
            setQuantitativeAnalysis(localQuantitativeAnalysis);
            successfulAgents.push('quantitative');
        }
    }
    
    setAnalysisPhase('DRAFTING');
    const contextStrings: { [key: string]: string } = {};
    if (gatheredData.esg) contextStrings.esg = getSummaryFromAgentResult('esg', gatheredData.esg);
    if (gatheredData.macro) contextStrings.macro = getSummaryFromAgentResult('macro', gatheredData.macro);
    if (localMarketIntel) contextStrings.market_intel = getSummaryFromAgentResult('market_intel', localMarketIntel);
    if (localLeadership) contextStrings.leadership = getSummaryFromAgentResult('leadership', localLeadership);
    if (gatheredData.competitive) contextStrings.competitive = getSummaryFromAgentResult('competitive', gatheredData.competitive);
    if (gatheredData.sector) contextStrings.sector = getSummaryFromAgentResult('sector', gatheredData.sector);
    if (gatheredData.calendar) contextStrings.calendar = getSummaryFromAgentResult('calendar', gatheredData.calendar);
    if (dtAnalysis?.technical_analysis?.summary) contextStrings.technical = dtAnalysis.technical_analysis.summary;
    if (localQuantitativeAnalysis) contextStrings.quantitative = getSummaryFromAgentResult('quantitative', localQuantitativeAnalysis);

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
    if (!critique || hasFailed) {
        if(draftAnalysis) {
            draftAnalysis.technicalAnalysis = dtAnalysis?.technical_analysis || null;
            draftAnalysis.contrarianAnalysis = localContrarianAnalysis;
            draftAnalysis.quantitativeAnalysis = localQuantitativeAnalysis;
        }
        setAnalysisResult(draftAnalysis);
        setAnalysisPhase(hasFailed ? 'PAUSED' : 'COMPLETE');
        if (hasFailed) addExecutionLog({ agentKey: 'local', stepName: 'Analysis Paused', status: 'paused', output: 'One or more intelligence agents failed. Review logs and retry.' });
        return;
    }
    setChiefAnalystCritique(critique);

    setAnalysisPhase('REFINING');
    const critiquePrompt = `\n\nA chief analyst has reviewed the initial data and raised a critical point: "${critique.conflict_summary}". Your final analysis MUST address this critique directly in the 'overall_recommendation' section.\n`;
    
    setAnalysisPhase('FINALIZING');
    const finalResult = await agentRunner<StockAnalysis>('financial', 'Finalize Aligned Report', () => getStockAnalysis(symbol, activeMarketConfig.name, contextStrings, localRawFinancials, metrics, critiquePrompt));
    
    if (finalResult) {
        finalResult.chiefAnalystCritique = critique;
        finalResult.technicalAnalysis = dtAnalysis?.technical_analysis || null;
        finalResult.contrarianAnalysis = localContrarianAnalysis;
        finalResult.quantitativeAnalysis = localQuantitativeAnalysis;
        setAnalysisResult(finalResult);
    } else {
        draftAnalysis.quantitativeAnalysis = localQuantitativeAnalysis;
        setAnalysisResult(draftAnalysis);
    }
    
    setAnalysisPhase('COMPLETE');

  }, [activeMarketConfig, agentCache, agentRunner]);

  
  const handleSelectStock = (symbol: string) => {
    const cachedItem = analysisCache[symbol];
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL_MS)) {
        console.log(`[Cache] Loading full analysis for ${symbol} from cache.`);
        setCurrentSymbol(symbol);
        setAnalysisResult(cachedItem.analysisResult);
        setEsgAnalysis(cachedItem.esgAnalysis);
        setMacroAnalysis(cachedItem.macroAnalysis);
        setMarketIntelligenceAnalysis(cachedItem.marketIntelligenceAnalysis);
        setLeadershipAnalysis(cachedItem.leadershipAnalysis);
        setCompetitiveAnalysis(cachedItem.competitiveAnalysis);
        setSectorAnalysis(cachedItem.sectorAnalysis);
        setCorporateCalendarAnalysis(cachedItem.corporateCalendarAnalysis);
        setTechnicalAnalysis(cachedItem.analysisResult.technicalAnalysis || null);
        setContrarianAnalysis(cachedItem.analysisResult.contrarianAnalysis || null);
        setQuantitativeAnalysis(cachedItem.analysisResult.quantitativeAnalysis || null);
        setExecutionLog([]);
        setAnalysisPlan(null);
        setAnalysisPhase('COMPLETE');
        setIsConfiguring(false);
        setIsCachedView(true);
    } else {
        setCurrentSymbol(symbol);
        setIsConfiguring(true);
        setIsCachedView(false);
    }
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
    setCurrentSymbol(null); setIsConfiguring(false); setAnalysisPhase('IDLE');
    setAnalysisResult(null); setEsgAnalysis(null); setMacroAnalysis(null);
    setMarketIntelligenceAnalysis(null); setLeadershipAnalysis(null); setCompetitiveAnalysis(null);
    setSectorAnalysis(null); setCorporateCalendarAnalysis(null); setTechnicalAnalysis(null);
    setContrarianAnalysis(null); setQuantitativeAnalysis(null);
    setExecutionLog([]);
    setIsCachedView(false);
  };
  
  const handleExportPdf = useCallback(async () => {
    if (!analysisResult) return;
    try {
      await generateAnalysisPdf(
        analysisResult, esgAnalysis, macroAnalysis, marketIntelligenceAnalysis,
        leadershipAnalysis, competitiveAnalysis, sectorAnalysis, corporateCalendarAnalysis,
        technicalAnalysis, contrarianAnalysis, quantitativeAnalysis, selectedCurrency
      );
    } catch (error) {
      console.error("PDF Export failed", error);
    }
  }, [analysisResult, esgAnalysis, macroAnalysis, marketIntelligenceAnalysis, leadershipAnalysis, competitiveAnalysis, sectorAnalysis, corporateCalendarAnalysis, technicalAnalysis, contrarianAnalysis, quantitativeAnalysis, selectedCurrency]);
  
  const handleMarketChange = (marketId: string) => {
    if (marketId !== selectedMarketId) {
        setSelectedMarketId(marketId);
        handleNavigateHome();
        setCustomStockList([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleRefreshAnalysis = useCallback(() => {
    if (currentSymbol) {
        setIsCachedView(false);
        setIsConfiguring(true);
    }
  }, [currentSymbol]);

  const handleRetryAnalysis = useCallback(() => {
    if (currentSymbol && enabledAgents) {
      runAnalysis(currentSymbol, enabledAgents);
    }
  }, [currentSymbol, enabledAgents, runAnalysis]);
  
  const categoriesForComponents = useMemo(() => {
    const allCategories: StockCategory[] = [...activeMarketConfig.stockCategories];
    if (customStockList.length > 0) {
        const customCategory = {
            name: 'My Stocks',
            symbols: customStockList,
            description: 'Your saved stocks for this market.',
            key_influencers: [],
        };
        return [customCategory, ...allCategories];
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
                  quantitativeAnalysis={quantitativeAnalysis}
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
                  snapshots={snapshots[currentSymbol] || []}
                  isCachedView={isCachedView}
                  onRefresh={handleRefreshAnalysis}
                  analysisCache={analysisCache}
              />
          </main>
        </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="bg-gray-50 min-h-screen dark:bg-slate-900 flex flex-col">
        <div className="flex-grow">
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
            onSaveSnapshot={handleSaveSnapshot}
            isCachedView={isCachedView}
            onRefresh={handleRefreshAnalysis}
          />
          <div className="container mx-auto px-2 sm:px-4 md:px-6 py-6">
              <Breadcrumbs currentSymbol={currentSymbol} onNavigateHome={handleNavigateHome} categories={categoriesForComponents} />
              <NutshellSummary summary={analysisResult?.justification.nutshell_summary} />
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