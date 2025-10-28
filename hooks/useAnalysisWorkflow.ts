import { useCallback } from 'react';
import { useAnalysis, AnalysisState } from '../contexts/AnalysisContext';
import { getStockAnalysis, getEsgAnalysis, getMacroAnalysis, getMarketIntelligenceAnalysis, getLeadershipAnalysis, getCompetitiveAnalysis, getSectorAnalysis, getCorporateCalendarAnalysis, getChiefAnalystCritique, getAnalysisPlan, getContrarianAnalysis, getQuantitativeAnalysis, getLiveMarketData, getHistoricalFinancials } from '../services/geminiService';
import { AgentKey, ChiefAnalystCritique, ContrarianAnalysis, ExecutionStep, HistoricalFinancials, LiveMarketData, QuantitativeAnalysis, RawFinancials, StockAnalysis } from '../types';
import * as calculator from '../services/calculatorService';
import { marketConfigs } from '../data/markets';

const getSummaryFromAgentResult = (agentKey: AgentKey, result: any): string => {
    if (!result) return 'N/A';
    try {
        switch (agentKey) {
            case 'esg': return result.justification?.overall_summary || JSON.stringify(result);
            case 'macro': return result.outlook_summary || JSON.stringify(result);
            case 'competitive': return result.competitive_summary || JSON.stringify(result);
            case 'market_intel': return result.intelligence_summary || JSON.stringify(result);
            case 'contrarian': return result.bear_case_summary || JSON.stringify(result);
            case 'quantitative': case 'leadership': case 'sector': case 'calendar': return result.summary || JSON.stringify(result);
            default: return JSON.stringify(result);
        }
    } catch {
        return JSON.stringify(result);
    }
};

export const useAnalysisWorkflow = () => {
    const { state, dispatch } = useAnalysis();
    const { currentSymbol, agentCache, selectedMarketId } = state;

    // FIX: Refactor to align with reducer change. This function now creates the full step.
    const addExecutionLog = (step: Omit<ExecutionStep, 'id' | 'timestamp'>): number => {
        const newStep: ExecutionStep = { ...step, id: Date.now() + Math.random(), timestamp: new Date().toISOString() };
        dispatch({ type: 'ADD_EXECUTION_LOG', payload: newStep });
        return newStep.id;
    };
    
    const agentRunner = useCallback(async <T,>(
        // FIX: Strongly type agentKey to prevent type errors with object keys.
        agentKey: keyof AnalysisState['agentStatuses'] | 'local',
        stepName: string,
        serviceCall: () => Promise<T>,
        isCached: boolean = false,
        inputToLog?: object | string
    ): Promise<T | null> => {
        if (!currentSymbol) {
            console.error("agentRunner called without a currentSymbol.");
            return null;
        }

        if (agentKey !== 'local') {
            dispatch({ type: 'SET_AGENT_STATUS', payload: { agent: agentKey, status: { isLoading: true, error: null } } });
        }
        
        const logId = addExecutionLog({
            agentKey: agentKey, stepName, status: 'running',
            input: inputToLog ? JSON.stringify(inputToLog, null, 2) : undefined
        });

        try {
            let data: T;
            const cacheKey = `${String(agentKey)}-${currentSymbol}`;
            const cachedItem = agentCache[cacheKey];
            if (isCached && cachedItem && (Date.now() - cachedItem.timestamp < 15 * 60 * 1000)) {
                data = cachedItem.data;
                dispatch({ type: 'UPDATE_EXECUTION_LOG', payload: { id: logId, updates: { status: 'complete', output: '[FROM CACHE]', sources: (data as any)?.sources, confidence: (data as any)?.confidence_score } }});
            } else {
                data = await serviceCall();
                dispatch({ type: 'UPDATE_EXECUTION_LOG', payload: { id: logId, updates: { status: 'complete', output: JSON.stringify(data, null, 2), sources: (data as any)?.sources, confidence: (data as any)?.confidence_score } }});
                // TODO: Update agent cache via dispatch
            }
            if (agentKey !== 'local') {
                dispatch({ type: 'SET_AGENT_STATUS', payload: { agent: agentKey, status: { isLoading: false } } });
            }
            return data;
        } catch (e: unknown) {
            const errorMsg = e instanceof Error ? e.message : "An unknown error occurred.";
            dispatch({ type: 'UPDATE_EXECUTION_LOG', payload: { id: logId, updates: { status: 'error', output: errorMsg } }});
            if (agentKey !== 'local') {
                dispatch({ type: 'SET_AGENT_STATUS', payload: { agent: agentKey, status: { isLoading: false, error: errorMsg } } });
            }
            return null;
        }
    }, [agentCache, currentSymbol, dispatch]);

    const runAnalysis = useCallback(async (symbol: string, enabledAgentsConfig: Record<AgentKey, boolean>) => {
        dispatch({ type: 'RESET_ANALYSIS' });
        const activeMarketConfig = marketConfigs[selectedMarketId];

        const plan = await agentRunner('financial', 'Create Analysis Plan', () => getAnalysisPlan(symbol, activeMarketConfig.name, Object.keys(enabledAgentsConfig).filter(k => enabledAgentsConfig[k as AgentKey]).join(', ')));
        if (!plan) { dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 'ERROR' }); return; }
        dispatch({ type: 'SET_ANALYSIS_PLAN', payload: plan });
        dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 'GATHERING' });
    
        const dataPromises: Record<string, Promise<any>> = {};
        
        let symbolForScreener = symbol;
        if (activeMarketConfig.screenerName === 'Screener.in') {
            symbolForScreener = symbol.replace(/\.NS$|\.BO$/i, '');
        }
        const screenerUrl = activeMarketConfig.screenerUrlTemplate.replace('{symbol}', symbolForScreener);
        
        const stockCategory = activeMarketConfig.stockCategories.find(cat => cat.symbols.includes(symbol));
        const isBank = stockCategory?.name === 'Banking' || stockCategory?.name === 'PSU Banks';
    
        dataPromises.liveMarketData = agentRunner('live_market_data', 'Extract Live Market Data', () => getLiveMarketData(symbol, screenerUrl, activeMarketConfig.screenerName, activeMarketConfig.name, isBank), false, screenerUrl);
        dataPromises.historicalFinancials = agentRunner('historical_financials', 'Extract Historical Financials', () => getHistoricalFinancials(screenerUrl, activeMarketConfig.screenerName, activeMarketConfig.name, isBank), true, screenerUrl);
    
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
                if (key !== 'liveMarketData' && key !== 'historicalFinancials') successfulAgents.push(key as AgentKey);
            } else { hasFailed = true; }
        });
    
        const localLiveMarketData = gatheredData.liveMarketData as LiveMarketData | null;
        const localHistoricalFinancials = gatheredData.historicalFinancials as HistoricalFinancials | null;

        if (localHistoricalFinancials && (localHistoricalFinancials.share_capital != null) && (localHistoricalFinancials.reserves != null)) {
            localHistoricalFinancials.total_equity = localHistoricalFinancials.share_capital + localHistoricalFinancials.reserves;
        }
        
        const mergedRawFinancials: RawFinancials | null = (localLiveMarketData || localHistoricalFinancials) ? {
            current_price: localLiveMarketData?.current_price ?? null,
            last_updated_from_source: localLiveMarketData?.last_updated ?? null,
            historical_price_data: localLiveMarketData?.historical_price_data,
            eps: localHistoricalFinancials?.eps ?? null, book_value_per_share: localHistoricalFinancials?.book_value_per_share ?? null,
            total_debt: localHistoricalFinancials?.total_debt ?? null, 
            share_capital: localHistoricalFinancials?.share_capital,
            reserves: localHistoricalFinancials?.reserves,
            total_equity: localHistoricalFinancials?.total_equity ?? null,
            pe_ratio: localHistoricalFinancials?.pe_ratio, pb_ratio: localHistoricalFinancials?.pb_ratio,
            debt_to_equity_ratio: localHistoricalFinancials?.debt_to_equity_ratio, roe: localHistoricalFinancials?.roe,
            annual_income_statement: localHistoricalFinancials?.annual_income_statement, quarterly_income_statement: localHistoricalFinancials?.quarterly_income_statement,
            annual_balance_sheet: localHistoricalFinancials?.annual_balance_sheet, quarterly_balance_sheet: localHistoricalFinancials?.quarterly_balance_sheet,
            annual_cash_flow: localHistoricalFinancials?.annual_cash_flow, quarterly_cash_flow: localHistoricalFinancials?.quarterly_cash_flow,
        } : null;
    
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'rawFinancials', data: mergedRawFinancials } });
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'technicalAnalysis', data: localLiveMarketData?.technical_analysis || null } });
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'esgAnalysis', data: gatheredData.esg || null } });
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'macroAnalysis', data: gatheredData.macro || null } });
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'marketIntelligenceAnalysis', data: gatheredData.market_intel || null } });
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'leadershipAnalysis', data: gatheredData.leadership || null } });
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'competitiveAnalysis', data: gatheredData.competitive || null } });
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'sectorAnalysis', data: gatheredData.sector || null } });
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'corporateCalendarAnalysis', data: gatheredData.calendar || null } });
    
        dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 'CALCULATING' });
        const metrics = calculator.calculateAllMetrics(mergedRawFinancials);
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'calculatedMetrics', data: metrics } });
        
        let localQuantitativeAnalysis: QuantitativeAnalysis | null = null;
        if (enabledAgentsConfig.quantitative && mergedRawFinancials?.current_price) {
            const quantResult = await agentRunner<QuantitativeAnalysis>('quantitative', 'Generate Quantitative Forecast', () => getQuantitativeAnalysis(
                mergedRawFinancials.historical_price_data ?? [], gatheredData.market_intel?.sentiment_score ?? null,
                gatheredData.leadership?.management_confidence_score ?? null, mergedRawFinancials.current_price
            ), true);
            if (quantResult) {
                localQuantitativeAnalysis = quantResult;
                dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'quantitativeAnalysis', data: localQuantitativeAnalysis } });
                successfulAgents.push('quantitative');
            }
        }
        
        dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 'DRAFTING' });
        const contextStrings: { [key: string]: string } = {};
        if (gatheredData.esg) contextStrings.esg = getSummaryFromAgentResult('esg', gatheredData.esg);
        if (gatheredData.macro) contextStrings.macro = getSummaryFromAgentResult('macro', gatheredData.macro);
        if (gatheredData.market_intel) contextStrings.market_intel = getSummaryFromAgentResult('market_intel', gatheredData.market_intel);
        if (gatheredData.leadership) contextStrings.leadership = getSummaryFromAgentResult('leadership', gatheredData.leadership);
        if (gatheredData.competitive) contextStrings.competitive = getSummaryFromAgentResult('competitive', gatheredData.competitive);
        if (gatheredData.sector) contextStrings.sector = getSummaryFromAgentResult('sector', gatheredData.sector);
        if (gatheredData.calendar) contextStrings.calendar = getSummaryFromAgentResult('calendar', gatheredData.calendar);
        if (localLiveMarketData?.technical_analysis?.summary) contextStrings.technical = localLiveMarketData.technical_analysis.summary;
        if (localQuantitativeAnalysis) contextStrings.quantitative = getSummaryFromAgentResult('quantitative', localQuantitativeAnalysis);
    
        const draftAnalysis = await agentRunner<StockAnalysis>('financial', 'Synthesize Draft Report', () => getStockAnalysis(symbol, activeMarketConfig.name, contextStrings, mergedRawFinancials, metrics, ''));
        if (!draftAnalysis) { dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 'ERROR' }); return; }
    
        let localContrarianAnalysis: ContrarianAnalysis | null = null;
        if (enabledAgentsConfig.contrarian) {
            const contrarianResult = await agentRunner<ContrarianAnalysis>('contrarian', 'Develop Contrarian Bear Case', () => getContrarianAnalysis(draftAnalysis.justification.overall_recommendation, contextStrings), true);
            if (contrarianResult) {
                localContrarianAnalysis = contrarianResult;
                dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'contrarianAnalysis', data: localContrarianAnalysis } });
                contextStrings.contrarian = getSummaryFromAgentResult('contrarian', contrarianResult);
                successfulAgents.push('contrarian');
            }
        }
        
        dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 'DEBATING' });
        const critique = await agentRunner<ChiefAnalystCritique>('chief', 'Debate & Critique Draft', () => getChiefAnalystCritique(draftAnalysis.justification.overall_recommendation, contextStrings, successfulAgents));
        if (!critique || hasFailed) {
            if(draftAnalysis) {
                draftAnalysis.technicalAnalysis = localLiveMarketData?.technical_analysis || null;
                draftAnalysis.contrarianAnalysis = localContrarianAnalysis;
                draftAnalysis.quantitativeAnalysis = localQuantitativeAnalysis;
            }
            dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'analysisResult', data: draftAnalysis } });
            dispatch({ type: 'SET_ANALYSIS_PHASE', payload: hasFailed ? 'PAUSED' : 'COMPLETE' });
            if (hasFailed) addExecutionLog({ agentKey: 'local', stepName: 'Analysis Paused', status: 'paused', output: 'One or more intelligence agents failed. Review logs and retry.' });
            return;
        }
        dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'chiefAnalystCritique', data: critique } });
    
        dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 'FINALIZING' });
        const critiquePrompt = `\n\nA chief analyst has reviewed the initial data and raised a critical point: "${critique.conflict_summary}". Your final analysis MUST address this critique directly in the 'overall_recommendation' section.\n`;
        const finalResult = await agentRunner<StockAnalysis>('financial', 'Finalize Aligned Report', () => getStockAnalysis(symbol, activeMarketConfig.name, contextStrings, mergedRawFinancials, metrics, critiquePrompt));
        
        if (finalResult) {
            finalResult.chiefAnalystCritique = critique;
            finalResult.technicalAnalysis = localLiveMarketData?.technical_analysis || null;
            finalResult.contrarianAnalysis = localContrarianAnalysis;
            finalResult.quantitativeAnalysis = localQuantitativeAnalysis;
            dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'analysisResult', data: finalResult } });
        } else {
            draftAnalysis.quantitativeAnalysis = localQuantitativeAnalysis;
            dispatch({ type: 'SET_AGENT_DATA', payload: { key: 'analysisResult', data: draftAnalysis } });
        }
        
        dispatch({ type: 'SET_ANALYSIS_PHASE', payload: 'COMPLETE' });
    
    }, [dispatch, agentRunner, selectedMarketId]);

    return { runAnalysis };
};