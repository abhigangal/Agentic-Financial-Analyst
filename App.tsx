import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StockAnalysis, EsgAnalysis, MacroAnalysis, NewsAnalysis, LeadershipAnalysis, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, ChiefAnalystCritique, ExecutionStep, RawFinancials, CalculatedMetric, GroundingSource } from './types';
import { getStockAnalysis, getEsgAnalysis, getMacroAnalysis, getNewsAnalysis, getLeadershipAnalysis, getCompetitiveAnalysis, getSectorAnalysis, getCorporateCalendarAnalysis, getChiefAnalystCritique, getAnalysisPlan, getFinancialData } from './services/geminiService';
import { generateAnalysisPdf } from './services/pdfService';
import { marketConfigs } from './data/markets';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ExportButton } from './components/ExportButton';
import { TabbedAnalysis } from './components/TabbedAnalysis';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/HomePage';
import { NutshellSummary } from './components/NutshellSummary';
import { AnalysisConfiguration } from './components/AnalysisConfiguration';
import { agentConfigurations, AgentKey } from './components/AnalysisConfiguration';
import * as calculator from './services/calculatorService';

const LOCAL_STORAGE_KEY = 'agentic_financial_analyst_custom_stocks';
export const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface AnalysisCacheItem {
    analysisResult: StockAnalysis;
    esgAnalysis: EsgAnalysis | null;
    macroAnalysis: MacroAnalysis | null;
    newsAnalysis: NewsAnalysis | null;
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
            case 'news':
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

const Dashboard: React.FC = () => {
  // Main Analysis State
  const [analysisResult, setAnalysisResult] = useState<StockAnalysis | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('IDLE');
  
  // Explainability State
  const [executionLog, setExecutionLog] = useState<ExecutionStep[]>([]);
  const [analysisPlan, setAnalysisPlan] = useState<string | null>(null);
  
  // Agent-specific data
  const [esgAnalysis, setEsgAnalysis] = useState<EsgAnalysis | null>(null);
  const [macroAnalysis, setMacroAnalysis] = useState<MacroAnalysis | null>(null);
  const [newsAnalysis, setNewsAnalysis] = useState<NewsAnalysis | null>(null);
  const [leadershipAnalysis, setLeadershipAnalysis] = useState<LeadershipAnalysis | null>(null);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const [sectorAnalysis, setSectorAnalysis] = useState<SectorAnalysis | null>(null);
  const [corporateCalendarAnalysis, setCorporateCalendarAnalysis] = useState<CorporateCalendarAnalysis | null>(null);
  const [chiefAnalystCritique, setChiefAnalystCritique] = useState<(ChiefAnalystCritique & { refined_answer?: string }) | null>(null);
  const [rawFinancials, setRawFinancials] = useState<RawFinancials | null>(null);
  const [calculatedMetrics, setCalculatedMetrics] = useState<Record<string, CalculatedMetric>>({});


  // Consolidated status management for all agents
  const [agentStatuses, setAgentStatuses] = useState({
    financial: initialAgentStatus,
    esg: initialAgentStatus,
    macro: initialAgentStatus,
    news: initialAgentStatus,
    leadership: initialAgentStatus,
    competitive: initialAgentStatus,
    sector: initialAgentStatus,
    calendar: initialAgentStatus,
    chief: initialAgentStatus,
    data_extractor: initialAgentStatus,
  });

  // Market State
  const [selectedMarketId, setSelectedMarketId] = useState<string>('IN');
  const activeMarketConfig = useMemo(() => marketConfigs[selectedMarketId], [selectedMarketId]);

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
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [enabledAgents, setEnabledAgents] = useState<Record<AgentKey, boolean> | null>(null);

  const isAnyAgentLoading = Object.values(agentStatuses).some(s => s.isLoading);
  
  const setAgentStatus = (agent: keyof typeof agentStatuses, status: Partial<AgentStatus>) => {
    setAgentStatuses(prev => ({ ...prev, [agent]: { ...prev[agent], ...status } }));
  };
  
  const addExecutionLog = (step: Omit<ExecutionStep, 'id' | 'timestamp'>) => {
    const newStep: ExecutionStep = {
        id: executionLog.length + 1,
        timestamp: new Date().toISOString(),
        ...step,
    };
    setExecutionLog(prev => [...prev, newStep]);
    return newStep.id;
  };
  
  const updateExecutionLog = (id: number, updates: Partial<ExecutionStep>) => {
      setExecutionLog(prev => prev.map(step => step.id === id ? { ...step, ...updates } : step));
  };


  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customStockList));
    } catch (e) {
      console.error("Failed to save custom stock list to localStorage", e);
    }
  }, [customStockList]);
  
  const allPredefinedSymbols = useMemo(() => new Set(activeMarketConfig.stockCategories.flatMap(c => c.symbols)), [activeMarketConfig]);

  const runAnalysis = useCallback(async (symbol: string, enabledAgentsConfig: Record<AgentKey, boolean>) => {
    if (!symbol) return;
    
    // --- 0. Reset State ---
    setAnalysisResult(null);
    setEsgAnalysis(null);
    setMacroAnalysis(null);
    setNewsAnalysis(null);
    setLeadershipAnalysis(null);
    setCompetitiveAnalysis(null);
    setSectorAnalysis(null);
    setCorporateCalendarAnalysis(null);
    setChiefAnalystCritique(null);
    setRawFinancials(null);
    setCalculatedMetrics({});
    setExecutionLog([]);
    setAnalysisPlan(null);
    setAgentStatuses({
        financial: initialAgentStatus, esg: initialAgentStatus, macro: initialAgentStatus,
        news: initialAgentStatus, leadership: initialAgentStatus, competitive: initialAgentStatus,
        sector: initialAgentStatus, calendar: initialAgentStatus, chief: initialAgentStatus,
        data_extractor: initialAgentStatus
    });
    setAnalysisPhase('PLANNING');

    const agentRunner = async <T,>(
        agentKey: AgentKey | 'data_extractor' | 'chief' | 'financial' | 'local',
        stepName: string,
        serviceCall: () => Promise<T>,
        isCached: boolean = false,
        inputToLog?: object | string
    ): Promise<T | null> => {
        setAgentStatus(agentKey as any, { isLoading: true, error: null });
        const logId = addExecutionLog({
            agentKey,
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
            updateExecutionLog(logId, { status: 'complete', output: JSON.stringify(data, null, 2), sources: (data as any)?.sources });
            setAgentStatus(agentKey as any, { isLoading: false });
            return data;
        } catch (e: any) {
            const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
            updateExecutionLog(logId, { status: 'error', output: errorMsg });
            setAgentStatus(agentKey as any, { isLoading: false, error: errorMsg });
            // Re-throw the error to be caught by Promise.allSettled
            throw new Error(errorMsg);
        }
    };
    
    // --- 1. Planning ---
    const plan = await agentRunner('financial', 'Create Analysis Plan', () => getAnalysisPlan(symbol, activeMarketConfig.name, Object.keys(enabledAgentsConfig).join(', ')));
    if (!plan) { setAnalysisPhase('ERROR'); return; }
    setAnalysisPlan(plan);
    setAnalysisPhase('GATHERING');

    // --- 2. Intelligence Gathering & Data Extraction ---
    const dataPromises: Record<string, Promise<any>> = {};
    if (enabledAgentsConfig.esg) dataPromises.esg = agentRunner('esg', 'Analyze ESG Profile', () => getEsgAnalysis(symbol, activeMarketConfig.name), true);
    if (enabledAgentsConfig.macro) dataPromises.macro = agentRunner('macro', 'Analyze Macroeconomic Trends', () => getMacroAnalysis(symbol, activeMarketConfig.name), true);
    if (enabledAgentsConfig.news) dataPromises.news = agentRunner('news', 'Analyze Recent News', () => getNewsAnalysis(symbol, activeMarketConfig.name), true);
    if (enabledAgentsConfig.leadership) dataPromises.leadership = agentRunner('leadership', 'Analyze Leadership Team', () => getLeadershipAnalysis(symbol, activeMarketConfig.name), true);
    if (enabledAgentsConfig.competitive) dataPromises.competitive = agentRunner('competitive', 'Analyze Competitors', () => getCompetitiveAnalysis(symbol, activeMarketConfig.name), true);
    if (enabledAgentsConfig.sector) dataPromises.sector = agentRunner('sector', 'Analyze Sector Outlook', () => getSectorAnalysis(symbol, activeMarketConfig.name), true);
    if (enabledAgentsConfig.calendar) dataPromises.calendar = agentRunner('calendar', 'Analyze Corporate Calendar', () => getCorporateCalendarAnalysis(symbol, activeMarketConfig.name), true);
    
    const screenerUrl = activeMarketConfig.screenerUrlTemplate.replace('{symbol}', symbol);
    dataPromises.rawFinancials = agentRunner('data_extractor', 'Extract Raw Financials', () => getFinancialData(screenerUrl, activeMarketConfig.screenerName), true);
    
    const dataEntries = Object.entries(dataPromises);
    const results = await Promise.allSettled(dataEntries.map(entry => entry[1]));

    const gatheredData: { [key: string]: any } = {};
    let hasFailed = false;

    results.forEach((result, index) => {
        const key = dataEntries[index][0];
        if (result.status === 'fulfilled') {
            gatheredData[key] = result.value;
        } else {
            hasFailed = true;
            console.error(`[Analysis Workflow] Agent for '${key}' failed:`, result.reason);
        }
    });

    if (hasFailed) {
        addExecutionLog({
            agentKey: 'local',
            stepName: 'Analysis Paused',
            status: 'paused',
            output: 'One or more intelligence agents failed to complete their task after retries. Please review the logs and retry the analysis.',
            remediation: {
                message: 'An agent failed. Review the logs for details.',
                action: 'Retry'
            }
        });
        setAnalysisPhase('PAUSED');
        return;
    }

    // Update states for UI rendering after all data is gathered
    setEsgAnalysis(gatheredData.esg || null);
    setMacroAnalysis(gatheredData.macro || null);
    setNewsAnalysis(gatheredData.news || null);
    setLeadershipAnalysis(gatheredData.leadership || null);
    setCompetitiveAnalysis(gatheredData.competitive || null);
    setSectorAnalysis(gatheredData.sector || null);
    setCorporateCalendarAnalysis(gatheredData.calendar || null);
    setRawFinancials(gatheredData.rawFinancials || null);

    // --- 3. Calculation ---
    setAnalysisPhase('CALCULATING');
    const logIdCalc = addExecutionLog({ agentKey: 'local', stepName: 'Calculate Key Metrics', status: 'running' });
    const localRawFinancials = gatheredData.rawFinancials;
    const metrics: Record<string, CalculatedMetric> = {};
    if (localRawFinancials) {
        metrics.debtToEquity = calculator.calculateDebtToEquity(localRawFinancials.total_debt, localRawFinancials.total_equity);
        metrics.peRatio = calculator.calculatePERatio(localRawFinancials.current_price, localRawFinancials.eps);
        metrics.pbRatio = calculator.calculatePBRatio(localRawFinancials.current_price, localRawFinancials.book_value_per_share);
        metrics.roe = calculator.calculateROE(localRawFinancials.eps, localRawFinancials.book_value_per_share);
    }
    setCalculatedMetrics(metrics);
    updateExecutionLog(logIdCalc, { status: 'complete', output: JSON.stringify(metrics, null, 2) });
    
    // --- 4. Verification ---
    setAnalysisPhase('VERIFYING');
    const logIdVerify = addExecutionLog({ agentKey: 'local', stepName: 'Verify Financials', status: 'running' });
    const verificationWarnings: string[] = [];
    const localCompetitiveAnalysis = gatheredData.competitive as CompetitiveAnalysis | null;
    if (localCompetitiveAnalysis?.target_company_metrics?.debt_to_equity && metrics.debtToEquity?.value !== null) {
        try {
            const competitiveDteStr = String(localCompetitiveAnalysis.target_company_metrics.debt_to_equity);
            const competitiveDte = parseFloat(competitiveDteStr.replace(/[^0-9.-]/g, ''));
            const calculatedDte = metrics.debtToEquity.value;

            if (!isNaN(competitiveDte) && calculatedDte !== null) {
                const variance = Math.abs((competitiveDte - calculatedDte) / calculatedDte);
                if (variance > 0.01) { // > 1% variance
                    const warningMessage = `High variance in Debt-to-Equity. Competitive agent reported ${competitiveDte}, but local calculation is ${calculatedDte.toFixed(2)} (${(variance * 100).toFixed(1)}% variance). Using locally calculated value as the source of truth.`;
                    verificationWarnings.push(warningMessage);
                }
            }
        } catch (e) {
             const warningMessage = `Could not parse Debt-to-Equity value ("${localCompetitiveAnalysis.target_company_metrics.debt_to_equity}") from Competitive Agent. Using locally calculated value.`;
             verificationWarnings.push(warningMessage);
        }
    }
    
    if (verificationWarnings.length > 0) {
        updateExecutionLog(logIdVerify, { status: 'complete', output: verificationWarnings.join('\n') });
    } else {
        updateExecutionLog(logIdVerify, { status: 'complete', output: 'All metrics within tolerance.' });
    }

    // --- 5. Draft Synthesis (Financial Advisor Pass 1) ---
    setAnalysisPhase('DRAFTING');
    const contextStrings: { [key in AgentKey]?: string } = {
        esg: getSummaryFromAgentResult('esg', gatheredData.esg),
        macro: getSummaryFromAgentResult('macro', gatheredData.macro),
        news: getSummaryFromAgentResult('news', gatheredData.news),
        leadership: getSummaryFromAgentResult('leadership', gatheredData.leadership),
        competitive: getSummaryFromAgentResult('competitive', gatheredData.competitive),
        sector: getSummaryFromAgentResult('sector', gatheredData.sector),
        calendar: getSummaryFromAgentResult('calendar', gatheredData.calendar),
    };
    
    let additionalContextPrompt = '';
    if (verificationWarnings.length > 0) {
        additionalContextPrompt += `\n\nIMPORTANT DATA QUALITY NOTE: The following discrepancies were found during verification. You MUST mention these in the 'confidence_rationale' section: "${verificationWarnings.join('. ')}". The locally calculated metrics provided to you are the source of truth.\n`;
    }

    const draftAnalysis = await agentRunner(
        'financial',
        'Synthesize Draft Report',
        () => getStockAnalysis(symbol, activeMarketConfig.name, contextStrings, localRawFinancials, metrics, additionalContextPrompt),
        false,
        { contextStrings, localRawFinancials, metrics, additionalContextPrompt }
    );
    if (!draftAnalysis) { setAnalysisPhase('ERROR'); return; }

    
    // --- 6. Chief Analyst Critique ---
    setAnalysisPhase('DEBATING');
    const critique = await agentRunner(
        'chief',
        'Debate & Critique Draft',
        () => getChiefAnalystCritique(draftAnalysis.justification.overall_recommendation, contextStrings as Record<string, string>),
        false,
        { draftSummary: draftAnalysis.justification.overall_recommendation, specialistContext: contextStrings }
    );
    
    if (!critique) {
        setAnalysisResult(draftAnalysis); // Fallback to draft if critique fails
        setAnalysisPhase('COMPLETE');
        return;
    }
    setChiefAnalystCritique(critique);

    
    // --- 7. Targeted Refinement ---
    setAnalysisPhase('REFINING');
    let refinedAnswer: string | undefined;
    if (critique.target_agent !== 'None') {
        const targetAgentKey = critique.target_agent.toLowerCase() as AgentKey;
        const agentServiceMap: { [key in AgentKey]: (...args: any[]) => Promise<any> } = {
            esg: getEsgAnalysis, macro: getMacroAnalysis, news: getNewsAnalysis,
            leadership: getLeadershipAnalysis, competitive: getCompetitiveAnalysis,
            sector: getSectorAnalysis, calendar: getCorporateCalendarAnalysis
        };
        const agentService = agentServiceMap[targetAgentKey];
        if (agentService) {
            const refinedResult = await agentRunner(
                targetAgentKey,
                `Refine ${targetAgentKey.toUpperCase()} Analysis`,
                () => agentService(symbol, activeMarketConfig.name, critique.remediation_question),
                false,
                { refinement_question: critique.remediation_question }
            );
            if(refinedResult) {
                 contextStrings[targetAgentKey] = getSummaryFromAgentResult(targetAgentKey, refinedResult);
                 refinedAnswer = JSON.stringify(refinedResult, null, 2);
                 setChiefAnalystCritique(prev => prev ? { ...prev, refined_answer: refinedAnswer } : null);
            }
        }
    }

    // --- 8. Final Synthesis (Financial Advisor Pass 2) ---
    setAnalysisPhase('FINALIZING');
    const critiquePrompt = `\n\nA chief analyst has reviewed the initial data and raised a critical point: "${critique.conflict_summary}". Your final analysis MUST address this critique directly in the 'overall_recommendation' section.\n`;
    const finalAdditionalContext = additionalContextPrompt + critiquePrompt;

    const finalResult = await agentRunner(
        'financial',
        'Finalize Aligned Report',
        () => getStockAnalysis(symbol, activeMarketConfig.name, contextStrings, localRawFinancials, metrics, finalAdditionalContext),
        false,
        { contextStrings, localRawFinancials, metrics, finalAdditionalContext }
    );

    if (finalResult) {
        finalResult.chiefAnalystCritique = { ...critique, refined_answer: refinedAnswer };
        setAnalysisResult(finalResult);
    } else {
        setAnalysisResult(draftAnalysis); // Fallback to draft
    }
    
    setAnalysisPhase('COMPLETE');

  }, [activeMarketConfig, agentCache]);
  
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
  
  const handleRetryStep = () => {
    if (currentSymbol && enabledAgents) {
        // This is a simplified retry. A more robust implementation would restart from the failed step.
        runAnalysis(currentSymbol, enabledAgents);
    }
  };

  const handleAddStock = async (symbol: string) => {
    setIsAdding(true);
    setAddError(null);
    const isValid = await activeMarketConfig.validateSymbol(symbol);
    if (isValid) {
      const upperSymbol = symbol.toUpperCase();
      if (!allPredefinedSymbols.has(upperSymbol) && !customStockList.includes(upperSymbol)) {
        setCustomStockList(prev => [...prev, upperSymbol]);
      }
      handleSelectStock(upperSymbol);
    } else {
      setAddError(`Symbol '${symbol.toUpperCase()}' not found or is invalid for the ${activeMarketConfig.name} market.`);
    }
    setIsAdding(false);
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
    setNewsAnalysis(null);
    setLeadershipAnalysis(null);
    setCompetitiveAnalysis(null);
    setSectorAnalysis(null);
    setCorporateCalendarAnalysis(null);
    setExecutionLog([]);
  };
  
  const handleExportPdf = async () => {
    if (!analysisResult) return;
    setIsExporting(true);
    try {
      await generateAnalysisPdf(
        analysisResult,
        esgAnalysis,
        macroAnalysis,
        newsAnalysis,
        leadershipAnalysis,
        competitiveAnalysis,
        sectorAnalysis,
        corporateCalendarAnalysis,
        activeMarketConfig.currencySymbol
      );
    } catch (error) {
      console.error("PDF Export failed", error);
      alert("There was an error generating the PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const stockCategoriesWithCustom = useMemo(() => {
    const customCategory = {
      name: 'My Stocks',
      symbols: customStockList,
      description: 'Stocks you have added manually.',
      key_influencers: []
    };
    if (customStockList.length > 0) {
      return [customCategory, ...activeMarketConfig.stockCategories];
    }
    return activeMarketConfig.stockCategories;
  }, [activeMarketConfig.stockCategories, customStockList]);
  
  const handleMarketChange = (marketId: string) => {
    if (marketId !== selectedMarketId) {
        setSelectedMarketId(marketId);
        setCurrentSymbol(null);
        setIsConfiguring(false);
        setAnalysisPhase('IDLE');
        setAnalysisResult(null);
        setEsgAnalysis(null);
        setMacroAnalysis(null);
        setNewsAnalysis(null);
        setLeadershipAnalysis(null);
        setCompetitiveAnalysis(null);
        setSectorAnalysis(null);
        setCorporateCalendarAnalysis(null);
        setAnalysisCache({});
        setAgentCache({});
        setCustomStockList([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const renderContent = () => {
    if (isConfiguring && currentSymbol) {
      return (
        <AnalysisConfiguration
          stockSymbol={currentSymbol}
          analysisCache={analysisCache}
          onRunAnalysis={handleRunAnalysis}
          onCancel={handleNavigateHome}
        />
      );
    }
    
    if (!currentSymbol) {
        return (
            <HomePage
                categories={stockCategoriesWithCustom}
                currentSymbol={currentSymbol}
                onSelectStock={handleSelectStock}
                onAddStock={handleAddStock}
                onRemoveStock={handleRemoveStock}
                isAdding={isAdding}
                addError={addError}
                onClearAddError={() => setAddError(null)}
                disabled={isAnyAgentLoading}
                analysisCache={analysisCache}
                marketName={activeMarketConfig.name}
                experts={activeMarketConfig.experts || []}
            />
        );
    }

    return (
        <div className="animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
              <div className="flex-grow">
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight dark:text-slate-50">{analysisResult?.share_name || currentSymbol}</h2>
                  <p className="text-lg text-gray-500 font-mono dark:text-slate-400">{analysisResult?.stock_symbol || 'Loading...'}</p>
              </div>
              <div className="flex gap-2 self-start md:self-end">
                <ExportButton isLoading={isExporting} onClick={handleExportPdf} disabled={isAnyAgentLoading || !analysisResult} />
              </div>
          </div>
          
          <main>
              <TabbedAnalysis
                  currentSymbol={currentSymbol}
                  analysisResult={analysisResult}
                  esgAnalysis={esgAnalysis}
                  macroAnalysis={macroAnalysis}
                  newsAnalysis={newsAnalysis}
                  leadershipAnalysis={leadershipAnalysis}
                  competitiveAnalysis={competitiveAnalysis}
                  sectorAnalysis={sectorAnalysis}
                  corporateCalendarAnalysis={corporateCalendarAnalysis}
                  currencySymbol={activeMarketConfig.currencySymbol}
                  onRetry={() => enabledAgents && runAnalysis(currentSymbol, enabledAgents)}
                  enabledAgents={enabledAgents}
                  analysisPhase={analysisPhase}
                  agentStatuses={agentStatuses}
                  executionLog={executionLog}
                  analysisPlan={analysisPlan}
                  onRetryStep={handleRetryStep}
                  calculatedMetrics={calculatedMetrics}
              />
          </main>
        </div>
    );
  };
  
  return (
    <ErrorBoundary>
      <div className="bg-gray-50 min-h-screen dark:bg-slate-900">
        <Header selectedMarketId={selectedMarketId} onMarketChange={handleMarketChange} />
        <div className="container mx-auto px-2 sm:px-4 md:px-6 py-6">
            <Breadcrumbs categories={stockCategoriesWithCustom} currentSymbol={currentSymbol} onNavigateHome={handleNavigateHome} />
            <NutshellSummary summary={analysisResult?.justification.nutshell_summary} />
            {renderContent()}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
