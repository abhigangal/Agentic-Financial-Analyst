import { AgentKey } from "./components/AnalysisConfiguration";

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

export interface RegulatoryRisk {
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  source_url?: string;
}

export interface NewsAnalysis {
  overall_sentiment: 'Positive' | 'Negative' | 'Neutral' | 'N/A';
  summary: string;
  key_articles: NewsArticle[];
  regulatory_risks: RegulatoryRisk[];
  sources?: GroundingSource[];
  na_justifications?: { [key: string]: string; };
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
  target_agent: 'ESG' | 'Macro' | 'News' | 'Leadership' | 'Competitive' | 'Sector' | 'Calendar' | 'Sentiment' | 'None';
  reasoning: string;
}

export interface InstitutionalHolder {
  name: string;
  stake: string; // e.g., "5.2%"
}

export interface MarketSentimentAnalysis {
  overall_sentiment: 'Positive' | 'Negative' | 'Neutral' | 'N/A';
  sentiment_summary: string;
  key_positive_points: string[];
  key_negative_points: string[];
  major_holders: InstitutionalHolder[];
  sources?: GroundingSource[];
  na_justifications?: { [key: string]: string; };
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
    short_term: CalculatedMetric | number | null;
    long_term: CalculatedMetric | number | null;
  };
  stop_loss: CalculatedMetric | number | null;
  risk_analysis: RiskAnalysis | null;
  contextual_inputs: {
    esg_summary: string;
    macroeconomic_summary: string;
    news_summary: string;
    leadership_summary: string;
    competitive_summary: string;
    sector_summary: string;
    corporate_calendar_summary: string;
    market_sentiment_summary: string;
  };
  justification: {
    nutshell_summary: string;
    overall_recommendation: string;
    confidence_rationale: string;
    profit_and_loss_summary: string;
    balance_sheet_summary: string;
    cash_flow_summary: string;
    financial_ratios_summary: string;
    ownership_summary: string; // Renamed from shareholding_pattern_summary
    exit_strategy: string;
    technical_summary: string; // Renamed from pvt_trend_analysis
    improvement_suggestions: string; // Renamed from information_better_results
  };
  sources?: GroundingSource[];
  na_justifications?: { [key: string]: string; };
  chiefAnalystCritique?: ChiefAnalystCritique & { refined_answer?: string };
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
  agentKey: AgentKey | 'financial' | 'data_extractor' | 'chief' | 'local';
  stepName: string;
  status: 'running' | 'complete' | 'error' | 'paused';
  input?: string;
  output?: string;
  confidence?: 'high' | 'moderate' | 'low' | number;
  sources?: GroundingSource[];
  remediation?: { message: string; action: string; };
}

export interface RawFinancials {
    current_price: number | null;
    eps: number | null; // Earnings Per Share
    book_value_per_share: number | null;
    total_debt: number | null;
    total_equity: number | null;
}