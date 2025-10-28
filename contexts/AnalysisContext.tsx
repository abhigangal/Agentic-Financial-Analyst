import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useMemo } from 'react';
import { StockAnalysis, EsgAnalysis, MacroAnalysis, MarketIntelligenceAnalysis, LeadershipAnalysis, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, ChiefAnalystCritique, ExecutionStep, RawFinancials, CalculatedMetric, TechnicalAnalysis, ContrarianAnalysis, AgentKey, Snapshot, QuantitativeAnalysis } from '../types';
import { marketConfigs } from '../data/markets';

// --- STATE ---
export type AnalysisPhase = 'IDLE' | 'PLANNING' | 'GATHERING' | 'CALCULATING' | 'VERIFYING' | 'DRAFTING' | 'DEBATING' | 'REFINING' | 'FINALIZING' | 'COMPLETE' | 'ERROR' | 'PAUSED';
export interface AgentStatus { isLoading: boolean; error: string | null; }

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
export interface AgentCacheItem { data: any; timestamp: number; }

const initialAgentStatus = { isLoading: false, error: null };
const initialAgentStatuses = {
    financial: initialAgentStatus, esg: initialAgentStatus, macro: initialAgentStatus,
    market_intel: initialAgentStatus, leadership: initialAgentStatus, competitive: initialAgentStatus,
    sector: initialAgentStatus, calendar: initialAgentStatus, contrarian: initialAgentStatus,
    quantitative: initialAgentStatus, chief: initialAgentStatus,
    live_market_data: initialAgentStatus, historical_financials: initialAgentStatus,
};

export interface AnalysisState {
  analysisResult: StockAnalysis | null;
  analysisPhase: AnalysisPhase;
  executionLog: ExecutionStep[];
  analysisPlan: string | null;
  esgAnalysis: EsgAnalysis | null;
  macroAnalysis: MacroAnalysis | null;
  marketIntelligenceAnalysis: MarketIntelligenceAnalysis | null;
  leadershipAnalysis: LeadershipAnalysis | null;
  competitiveAnalysis: CompetitiveAnalysis | null;
  sectorAnalysis: SectorAnalysis | null;
  corporateCalendarAnalysis: CorporateCalendarAnalysis | null;
  technicalAnalysis: TechnicalAnalysis | null;
  contrarianAnalysis: ContrarianAnalysis | null;
  quantitativeAnalysis: QuantitativeAnalysis | null;
  chiefAnalystCritique: (ChiefAnalystCritique & { refined_answer?: string }) | null;
  rawFinancials: RawFinancials | null;
  calculatedMetrics: Record<string, CalculatedMetric>;
  // FIX: Use a more specific type for agentStatuses to ensure type safety.
  agentStatuses: typeof initialAgentStatuses;
  selectedMarketId: string;
  selectedCurrency: string;
  customStockList: string[];
  snapshots: Record<string, Snapshot[]>;
  analysisCache: Record<string, AnalysisCacheItem>;
  agentCache: Record<string, AgentCacheItem>;
  currentSymbol: string | null;
  addError: string | null;
  isConfiguring: boolean;
  enabledAgents: Record<AgentKey, boolean> | null;
  isAddingStock: boolean;
  isCachedView: boolean;
}

// --- ACTIONS ---
type Action =
  | { type: 'RESET_ANALYSIS' }
  | { type: 'SET_CURRENT_SYMBOL'; payload: string | null }
  | { type: 'SET_ANALYSIS_PHASE'; payload: AnalysisPhase }
  // FIX: Change payload to be the full ExecutionStep object to resolve inconsistency.
  | { type: 'ADD_EXECUTION_LOG'; payload: ExecutionStep }
  | { type: 'UPDATE_EXECUTION_LOG'; payload: { id: number, updates: Partial<ExecutionStep> } }
  | { type: 'SET_ANALYSIS_PLAN'; payload: string | null }
  // FIX: Strongly type the agent key to match the agentStatuses keys.
  | { type: 'SET_AGENT_STATUS'; payload: { agent: keyof typeof initialAgentStatuses, status: Partial<AgentStatus> } }
  | { type: 'SET_AGENT_DATA'; payload: { key: keyof AnalysisState, data: any } }
  | { type: 'SET_IS_CONFIGURING'; payload: boolean }
  | { type: 'SET_ENABLED_AGENTS'; payload: Record<AgentKey, boolean> | null }
  | { type: 'SET_IS_CACHED_VIEW'; payload: boolean }
  | { type: 'ADD_CUSTOM_STOCK'; payload: string }
  | { type: 'REMOVE_CUSTOM_STOCK'; payload: string }
  | { type: 'SET_MARKET_ID'; payload: string }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_ADD_ERROR'; payload: string | null }
  | { type: 'SET_IS_ADDING_STOCK'; payload: boolean }
  | { type: 'SAVE_SNAPSHOT'; payload: { symbol: string, snapshot: Snapshot } }
  | { type: 'LOAD_CACHED_ANALYSIS'; payload: { symbol: string, cachedItem: AnalysisCacheItem } };


const LOCAL_STORAGE_KEY = 'agentic_financial_analyst_custom_stocks';
const SNAPSHOTS_STORAGE_KEY = 'agentic_financial_analyst_snapshots';
const ANALYSIS_CACHE_KEY = 'agentic_financial_analyst_analysis_cache_v2';
const AGENT_CACHE_KEY = 'agentic_financial_analyst_agent_cache_v2';

const initialState: AnalysisState = {
    analysisResult: null,
    analysisPhase: 'IDLE',
    executionLog: [],
    analysisPlan: null,
    esgAnalysis: null, macroAnalysis: null, marketIntelligenceAnalysis: null,
    leadershipAnalysis: null, competitiveAnalysis: null, sectorAnalysis: null,
    corporateCalendarAnalysis: null, technicalAnalysis: null, contrarianAnalysis: null,
    quantitativeAnalysis: null, chiefAnalystCritique: null, rawFinancials: null,
    calculatedMetrics: {},
    agentStatuses: initialAgentStatuses,
    selectedMarketId: 'IN',
    selectedCurrency: '₹',
    customStockList: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'),
    snapshots: JSON.parse(localStorage.getItem(SNAPSHOTS_STORAGE_KEY) || '{}'),
    analysisCache: JSON.parse(localStorage.getItem(ANALYSIS_CACHE_KEY) || '{}'),
    agentCache: JSON.parse(localStorage.getItem(AGENT_CACHE_KEY) || '{}'),
    currentSymbol: null,
    addError: null,
    isConfiguring: false,
    enabledAgents: null,
    isAddingStock: false,
    isCachedView: false,
};

// --- REDUCER ---
const analysisReducer = (state: AnalysisState, action: Action): AnalysisState => {
  switch (action.type) {
    case 'RESET_ANALYSIS':
      return {
        ...state,
        analysisResult: null, analysisPhase: 'PLANNING', executionLog: [],
        analysisPlan: null, esgAnalysis: null, macroAnalysis: null, marketIntelligenceAnalysis: null,
        leadershipAnalysis: null, competitiveAnalysis: null, sectorAnalysis: null, corporateCalendarAnalysis: null,
        technicalAnalysis: null, contrarianAnalysis: null, quantitativeAnalysis: null,
        chiefAnalystCritique: null, rawFinancials: null, calculatedMetrics: {},
        agentStatuses: initialAgentStatuses, isCachedView: false,
      };
    case 'SET_CURRENT_SYMBOL':
      return { ...state, currentSymbol: action.payload };
    case 'SET_ANALYSIS_PHASE':
      return { ...state, analysisPhase: action.payload };
    case 'ADD_EXECUTION_LOG':
      // FIX: Reducer now accepts the full step object.
      return { ...state, executionLog: [...state.executionLog, action.payload] };
    case 'UPDATE_EXECUTION_LOG':
      return {
        ...state,
        executionLog: state.executionLog.map(step =>
          step.id === action.payload.id ? { ...step, ...action.payload.updates } : step
        ),
      };
    case 'SET_ANALYSIS_PLAN':
        return { ...state, analysisPlan: action.payload };
    case 'SET_AGENT_STATUS':
      return {
        ...state,
        agentStatuses: {
          ...state.agentStatuses,
          [action.payload.agent]: { ...state.agentStatuses[action.payload.agent], ...action.payload.status },
        },
      };
    case 'SET_AGENT_DATA':
        return { ...state, [action.payload.key]: action.payload.data };
    case 'SET_IS_CONFIGURING':
        return { ...state, isConfiguring: action.payload };
    case 'SET_ENABLED_AGENTS':
        return { ...state, enabledAgents: action.payload };
    case 'SET_IS_CACHED_VIEW':
        return { ...state, isCachedView: action.payload };
    case 'ADD_CUSTOM_STOCK':
      const newCustomStockList = [...state.customStockList, action.payload];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCustomStockList));
      return { ...state, customStockList: newCustomStockList };
    case 'REMOVE_CUSTOM_STOCK':
        const filteredList = state.customStockList.filter(s => s !== action.payload);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));
        return { ...state, customStockList: filteredList };
    case 'SET_MARKET_ID':
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return { ...state, selectedMarketId: action.payload, selectedCurrency: marketConfigs[action.payload].currencySymbol, customStockList: [], currentSymbol: null, analysisResult: null, isConfiguring: false };
    case 'SET_CURRENCY':
        return { ...state, selectedCurrency: action.payload };
    case 'SET_ADD_ERROR':
        return { ...state, addError: action.payload };
    case 'SET_IS_ADDING_STOCK':
        return { ...state, isAddingStock: action.payload };
    case 'SAVE_SNAPSHOT':
        const { symbol, snapshot } = action.payload;
        const stockSnapshots = state.snapshots[symbol] ? [snapshot, ...state.snapshots[symbol]] : [snapshot];
        stockSnapshots.sort((a, b) => b.timestamp - a.timestamp).splice(10);
        const newSnapshots = { ...state.snapshots, [symbol]: stockSnapshots };
        localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(newSnapshots));
        return { ...state, snapshots: newSnapshots };
    case 'LOAD_CACHED_ANALYSIS':
        const { cachedItem } = action.payload;
        return {
            ...state,
            currentSymbol: action.payload.symbol,
            analysisResult: cachedItem.analysisResult,
            esgAnalysis: cachedItem.esgAnalysis,
            macroAnalysis: cachedItem.macroAnalysis,
            marketIntelligenceAnalysis: cachedItem.marketIntelligenceAnalysis,
            leadershipAnalysis: cachedItem.leadershipAnalysis,
            competitiveAnalysis: cachedItem.competitiveAnalysis,
            sectorAnalysis: cachedItem.sectorAnalysis,
            corporateCalendarAnalysis: cachedItem.corporateCalendarAnalysis,
            quantitativeAnalysis: cachedItem.quantitativeAnalysis,
            technicalAnalysis: cachedItem.analysisResult.technicalAnalysis || null,
            contrarianAnalysis: cachedItem.analysisResult.contrarianAnalysis || null,
            executionLog: [], analysisPlan: null, analysisPhase: 'COMPLETE',
            isConfiguring: false, isCachedView: true,
        };
    default:
      return state;
  }
};

// --- CONTEXT & PROVIDER ---
const AnalysisContext = createContext<{ state: AnalysisState; dispatch: Dispatch<Action> } | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);
  return <AnalysisContext.Provider value={{ state, dispatch }}>{children}</AnalysisContext.Provider>;
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error('useAnalysis must be used within an AnalysisProvider');

  const { analysisPhase } = context.state;
  const isAnalysisRunning = useMemo(() => {
    return analysisPhase !== 'IDLE' && analysisPhase !== 'COMPLETE' && analysisPhase !== 'ERROR' && analysisPhase !== 'PAUSED';
  }, [analysisPhase]);

  return { ...context, isAnalysisRunning };
};