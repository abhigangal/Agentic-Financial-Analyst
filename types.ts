// This file now contains the canonical AgentKey type.
export type AgentKey = 'esg' | 'macro' | 'market_intel' | 'leadership' | 'competitive' | 'sector' | 'calendar' | 'contrarian';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface StockCategory {
  name: string;
  symbols: string[];
  description: string;
  key_influencers: string[];
}

export interface Expert {
  name: string;
  tier: 1 | 2 | 3;
  description: string;
}

export interface MarketConfig {
  id: 'IN' | 'US' | 'UK' | 'BF';
  name: string;
  screenerName: string;
  screenerUrlTemplate: string;
  validateSymbol: (symbol: string) => Promise<boolean>;
  stockCategories: StockCategory[];
  currencySymbol: string;
  experts?: Expert[];
}

export interface EsgAnalysis {
  score: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'N/A';
  score_confidence?: 'high' | 'moderate' | 'low';
  last_updated?: string;
  esg_momentum: 'Improving' | 'Stable' | 'Declining' | 'N/A';
  esg_momentum_period: string; // e.g., "last 24 months"
  justification: {
    overall_summary: string;
    environmental_summary: string;
    social_summary: string;
    governance_summary: string;
  };
  sources?: GroundingSource[];
  na_justifications?: { [key: string]: string; };
}

export interface MacroAnalysis {
    gdp_growth: string;
    inflation_rate: string;
    interest_rate: string;
    last_updated?: string;
    confidence_level?: 'high' | 'moderate' | 'low';
    sector_clarity?: 'clear' | 'partial' | 'unclear';
    outlook_summary: string;
    sector_impact: string;
    sources?: GroundingSource[];
    na_justifications?: { [key:string]: string; };
}

export interface NewsArticle {
  title: string;
  summary: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  source_url: string;
  published_date?: string;
}

export interface RegulatoryAndGeopoliticalRisk {
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  source_url?: string;
}

export interface ExecutiveProfile {
  name: string;
  role: string;
  tenure: string;
  summary: string;
  impact_rating: number; // Simplified from executive_impact_rating
}

export interface LeadershipAnalysis {
  overall_assessment: 'Strong' | 'Average' | 'Weak' | 'N/A';
  summary: string;
  leadership_recently_changed: boolean;
  key_executives: ExecutiveProfile[];
  sources?: GroundingSource[];
  na_justifications?: {
    missing_data_fields: string;
    reason: string;
  };
}

export interface RiskAnalysis {
  risk_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Very High';
  summary: string;
  key_risk_factors: string[];
}

export interface CalculatedMetric {
    value: number | null;
    formula: string;
    inputs: Record<string, number | string | null>;
    proof?: string;
}

export interface FinancialMetrics {
  market_cap: string | null;
  pe_ratio: CalculatedMetric | string | null;
  pb_ratio: CalculatedMetric | string | null;
  debt_to_equity: CalculatedMetric | string | null;
  roe: CalculatedMetric | string | null; // Return on Equity
}

export interface Competitor {
  name: string;
  stock_symbol?: string;
  strengths: string[];
  weaknesses: string[];
  market_share_estimate?: string;
  metrics: FinancialMetrics | null;
}

export interface CompetitiveAnalysis {
  market_leader: string;
  competitive_summary: string;
  competitors: Competitor[];
  target_company_metrics: FinancialMetrics | null;
  industry_average_metrics: FinancialMetrics | null;
  sources?: GroundingSource[];
  na_justifications?: { [key: string]: string; };
}

export interface SectorAnalysis {
  sector_outlook: 'Positive' | 'Neutral' | 'Negative' | 'N/A';
  summary: string;
  key_drivers: string[];
  key_risks: string[];
  sources?: GroundingSource[];
  na_justifications?: { [key: string]: string; };
}

export interface CorporateCalendarAnalysis {
  next_earnings_date: string | null;
  dividend_ex_date: string | null;
  analyst_day_date: string | null;
  summary: string;
  sources?: GroundingSource[];
  na_justifications?: { [key: string]: string; };
}

export interface ChiefAnalystCritique {
  conflict_summary: string;
  remediation_question: string;
  target_agent: 'ESG' | 'MACRO' | 'LEADERSHIP' | 'COMPETITIVE' | 'SECTOR' | 'CALENDAR' | 'CONTRARIAN' | 'None' | 'MARKET_INTEL';
  reasoning: string;
}

export interface InstitutionalHolder {
  name: string;
  stake: string; // e.g., "5.2%"
}

export interface MarketIntelligenceAnalysis {
  overall_sentiment: 'Positive' | 'Negative' | 'Neutral' | 'N/A';
  intelligence_summary: string;
  key_articles: NewsArticle[];
  regulatory_and_geopolitical_risks: RegulatoryAndGeopoliticalRisk[];
  insider_trading_summary: string;
  key_positive_points: string[];
  key_negative_points: string[];
  major_holders: InstitutionalHolder[];
  sources?: GroundingSource[];
  na_justifications?: { [key: string]: string; };
}

export interface TechnicalAnalysis {
  trend: 'Uptrend' | 'Downtrend' | 'Sideways' | 'N/A';
  summary: string;
  support_level: string;
  resistance_level: string;
  moving_averages_summary: string;
  indicators_summary: string; // e.g., RSI, MACD
  forecast?: {
    price_target: number | null;
    confidence_interval: [number | null, number | null];
    rationale: string;
  };
  sources?: GroundingSource[];
}

export interface ContrarianAnalysis {
  bear_case_summary: string;
  key_contrarian_points: string[];
  undervalued_positive_catalysts: string[];
}

export interface HistoricalPriceDataPoint {
    date: string; // YYYY-MM-DD
    close: number;
}

export interface FinancialStatementRow {
    label: string;
    values: (number | null)[];
}

export interface FinancialStatement {
    periods: string[]; // e.g., ["2023", "2022", "2021"]
    rows: FinancialStatementRow[];
}

export interface RawFinancials {
    current_price: number | null;
    eps: number | null; // Earnings Per Share
    book_value_per_share: number | null;
    total_debt: number | null;
    total_equity: number | null;
    // Direct ratios for sources that provide them instead of raw numbers
    pe_ratio?: number | null;
    pb_ratio?: number | null;
    debt_to_equity_ratio?: number | null;
    roe?: number | null;
    // New historical data
    historical_price_data?: HistoricalPriceDataPoint[];
    annual_income_statement?: FinancialStatement;
    quarterly_income_statement?: FinancialStatement;
    annual_balance_sheet?: FinancialStatement;
    quarterly_balance_sheet?: FinancialStatement;
    annual_cash_flow?: FinancialStatement;
    quarterly_cash_flow?: FinancialStatement;
}

export interface DataAndTechnicalsAnalysis {
  raw_financials: RawFinancials;
  technical_analysis: TechnicalAnalysis;
}


export interface StockAnalysis {
  stock_symbol: string;
  share_name: string;
  current_price: number | null;
  price_change: number | null;
  price_change_percentage: string | null;
  last_updated?: string;
  overall_sentiment: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish' | 'N/A';
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' | 'N/A';
  confidence_score: 'high' | 'moderate' | 'low';
  investment_horizon: {
    short_term: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' | 'N/A';
    long_term: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' | 'N/A';
  };
  target_price: {
    short_term: { low: number | null; high: number | null; };
    long_term: { low: number | null; high: number | null; };
  };
  stop_loss: CalculatedMetric | number | null;
  risk_analysis: RiskAnalysis | null;
  contextual_inputs: {
    esg_summary: string;
    macroeconomic_summary: string;
    market_intelligence_summary: string;
    leadership_summary: string;
    competitive_summary: string;
    sector_summary: string;
    corporate_calendar_summary: string;
    technical_analysis_summary: string;
    contrarian_summary: string;
  };
  justification: {
    nutshell_summary: string;
    overall_recommendation: string;
    confidence_rationale: string;
    thesis_breakdown?: {
        quantitative_view: string;
        qualitative_view: string;
        relative_view: string;
    };
    profit_and_loss_summary: string;
    balance_sheet_summary: string;
    cash_flow_summary: string;
    financial_ratios_summary: string;
    ownership_summary: string; // Renamed from shareholding_pattern_summary
    exit_strategy: string;
    // Note: The original 'technical_summary' is the Financial Advisor's own summary,
    // not to be confused with the output from the dedicated Technical Analysis agent.
    technical_summary: string; 
    improvement_suggestions: string; // Renamed from information_better_results
  };
  disclosures?: {
      disclaimer: string;
      limitations: string;
      data_freshness_statement: string;
  };
  sources?: GroundingSource[];
  na_justifications?: { [key: string]: string; };
  chiefAnalystCritique?: ChiefAnalystCritique & { refined_answer?: string };
  technicalAnalysis?: TechnicalAnalysis | null;
  contrarianAnalysis?: ContrarianAnalysis | null;
}

export interface ExpertPick {
  stock_symbol: string;
  company_name: string;
  recommendation_type: 'Buy' | 'Sell' | 'Hold' | 'Accumulate' | 'N/A' | 'Outperform' | 'Underperform' | 'Neutral';
  summary: string;
  source_url: string;
  published_date?: string;
  is_inferred: boolean;
  confidence_score: number;
}

export interface MarketVoicesAnalysis {
  expert_picks: {
    expert_name: string;
    picks: ExpertPick[];
  }[];
  sources?: GroundingSource[];
}

export interface ScenarioMessage {
    role: 'user' | 'model';
    content: string;
    isLoading?: boolean;
}

export interface User {
  email: string;
  role: 'free' | 'premium';
}

export interface ExecutionStep {
  id: number;
  timestamp: string;
  agentKey: AgentKey | 'financial' | 'data_extractor' | 'chief' | 'local' | 'data_and_technicals';
  stepName: string;
  status: 'running' | 'complete' | 'error' | 'paused';
  input?: string;
  output?: string;
  confidence?: 'high' | 'moderate' | 'low' | number;
  sources?: GroundingSource[];
  remediation?: { message: string; action: string; };
}

export interface Snapshot {
  id: string; // ISO string timestamp
  timestamp: number;
  analysisResult: StockAnalysis;
}