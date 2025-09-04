import { StockAnalysis, EsgAnalysis, MacroAnalysis, NewsAnalysis, LeadershipAnalysis, RiskAnalysis, CompetitiveAnalysis } from '../types';

export const mockCompetitiveAnalysis: CompetitiveAnalysis = {
    market_leader: 'MegaCorp',
    competitive_summary: 'MockCorp appears attractively valued with a lower P/E ratio than its main rival, MegaCorp, and the industry average. However, its higher debt-to-equity ratio presents a notable risk that requires careful monitoring.',
    target_company_metrics: {
        market_cap: '50B',
        pe_ratio: '18.5x',
        pb_ratio: '3.2x',
        debt_to_equity: '0.8',
        roe: '15.2%'
    },
    industry_average_metrics: {
        market_cap: 'N/A',
        pe_ratio: '22.0x',
        pb_ratio: '3.5x',
        debt_to_equity: '0.5',
        roe: '14.0%'
    },
    competitors: [
        { 
            name: 'MegaCorp', 
            stock_symbol: 'MEGA', 
            strengths: ['Large market share', 'Extensive distribution network'], 
            weaknesses: ['Slower to innovate', 'Higher price point'],
            metrics: { market_cap: '200B', pe_ratio: '25.5x', pb_ratio: '4.0x', debt_to_equity: '0.4', roe: '18.5%' }
        },
        { 
            name: 'Innovate Inc.', 
            stock_symbol: 'INVT', 
            strengths: ['Cutting-edge technology', 'Agile development process'], 
            weaknesses: ['Small customer base', 'Unproven business model'],
            metrics: { market_cap: '5B', pe_ratio: 'N/A', pb_ratio: '2.5x', debt_to_equity: '0.2', roe: '-5.0%' }
        },
        { 
            name: 'Value-Sell Ltd.', 
            strengths: ['Lowest price point', 'Aggressive marketing'], 
            weaknesses: ['Poor product quality', 'Negative brand perception'],
            metrics: { market_cap: '10B', pe_ratio: '15.0x', pb_ratio: '1.8x', debt_to_equity: '1.2', roe: '10.0%' }
        }
    ],
    sources: [{ uri: 'https://example.com/market-report', title: 'Annual Market Analysis' }]
};

export const mockLeadershipAnalysis: LeadershipAnalysis = {
    overall_assessment: 'Strong',
    summary: 'The leadership team at MockCorp is experienced and has a clear vision for growth. The CEO has been with the company for over a decade, providing stability. Recent strategic hires in technology have positioned the company well for digital transformation.',
    leadership_recently_changed: false,
    key_executives: [
        { name: 'Alice Johnson', role: 'CEO', tenure: '12 years', summary: 'Visionary leader with a strong track record in operational efficiency.', impact_rating: 5 },
        { name: 'Bob Williams', role: 'CFO', tenure: '3 years', summary: 'Brought in to modernize financial systems. Has successfully reduced debt.', impact_rating: 4 },
        { name: 'Charlie Brown', role: 'CTO', tenure: '1 year', summary: 'A recent hire from a major competitor, tasked with leading the AI-initiatives.', impact_rating: 4 },
    ],
    sources: [{ uri: 'https://example.com/leadership', title: 'MockCorp Leadership Page' }],
};

export const mockNewsAnalysis: NewsAnalysis = {
    overall_sentiment: 'Positive',
    summary: 'Recent news coverage has been largely positive, focusing on the successful launch of a new product line and strong quarterly earnings. Minor concerns about supply chain are present but overshadowed by positive outlook.',
    key_articles: [
        { title: 'MockCorp Launches Innovative New Product', summary: 'The new product is expected to capture significant market share.', sentiment: 'Positive', source_url: 'https://example.com/news1' },
        { title: 'MockCorp Reports Record Profits', summary: 'Exceeds analyst expectations for the third consecutive quarter.', sentiment: 'Positive', source_url: 'https://example.com/news2' },
        { title: 'Supply Chain Hurdles Ahead?', summary: 'Experts weigh in on potential logistics challenges for MockCorp.', sentiment: 'Neutral', source_url: 'https://example.com/news3' },
    ],
    regulatory_risks: [
        {
            description: "MockCorp is monitoring new data privacy regulations that may impact its customer data strategies.",
            severity: "Low",
            source_url: "https://example.com/privacy-law-update"
        }
    ],
    sources: [{ uri: 'https://example.com/news', title: 'General News Search for MockCorp' }],
};


export const mockMacroAnalysis: MacroAnalysis = {
    gdp_growth: '2.5% Q2 2024',
    inflation_rate: '3.1% CPI July 2024',
    interest_rate: '5.25% Policy Rate Aug 2024',
    outlook_summary: 'The national economy shows moderate growth, with inflation beginning to cool. Consumer spending remains resilient, but industrial production has slowed slightly. The overall outlook is cautiously optimistic.',
    sector_impact: 'The tech sector, where MockCorp operates, is expected to outperform the general market due to strong demand for digital services. However, high interest rates could temper capital investment in the medium term.',
    sources: [{ uri: 'https://example.com/macro-report', title: 'National Economic Outlook Q2 2024' }],
};

export const mockEsgAnalysis: EsgAnalysis = {
    score: 'AA',
    score_confidence: 'high',
    last_updated: new Date().toISOString(),
    esg_momentum: 'Improving',
    esg_momentum_period: 'last 24 months',
    justification: {
        overall_summary: 'MockCorp demonstrates strong ESG practices, particularly in governance and social policies. The company\'s ESG score has been steadily improving over the last two years due to new environmental initiatives.',
        environmental_summary: 'The company has committed to reducing carbon emissions by 20% by 2030. However, current water usage is high for its sector.',
        social_summary: 'Excellent employee satisfaction scores and strong community investment programs. Recognized as a top employer.',
        governance_summary: 'Transparent reporting and a diverse board of directors. No major governance concerns.',
    },
    sources: [{ uri: 'https://example.com/esg-report', title: 'MockCorp Annual ESG Report' }],
};

export const mockStockAnalysis: StockAnalysis = {
    stock_symbol: 'MOCK',
    share_name: 'MockCorp Inc.',
    current_price: 150.75,
    price_change: 2.50,
    price_change_percentage: '+1.68%',
    last_updated: new Date().toISOString(),
    overall_sentiment: 'Bullish',
    recommendation: 'Buy',
    confidence_score: 'high',
    investment_horizon: { short_term: 'Buy', long_term: 'Strong Buy' },
    target_price: { short_term: 165.00, long_term: 200.00 },
    stop_loss: 140.00,
    risk_analysis: {
        risk_score: 25,
        risk_level: 'Low',
        summary: 'Overall risk is low due to strong financials and market position. The primary risks are related to potential supply chain disruptions and increased competition.',
        key_risk_factors: [
            'Dependency on key suppliers for critical components.',
            'Intensifying competition in the high-end market segment.',
            'Exposure to regulatory changes in international markets.'
        ]
    },
    contextual_inputs: {
        esg_summary: 'MockCorp has a strong ESG profile with an AA rating.',
        macroeconomic_summary: 'The macroeconomic environment is favorable for the tech sector.',
        news_summary: 'Recent news has been positive, highlighting product innovation.',
        leadership_summary: 'The leadership team is experienced and stable.',
        competitive_summary: 'The market is competitive, but MockCorp has a strong niche.',
        sector_summary: 'The overall sector outlook is positive, driven by digital transformation trends.',
        corporate_calendar_summary: 'Upcoming earnings call is a key catalyst to watch.',
        market_sentiment_summary: 'Overall market sentiment is positive, with strong institutional buying.',
    },
    justification: {
        nutshell_summary: 'Investing in MockCorp is like betting on a well-managed ship navigating favorable seas. Strong leadership and positive market trends make it a compelling choice.',
        overall_recommendation: 'Based on strong fundamentals, positive sentiment, and solid leadership, we issue a "Buy" recommendation. The company is well-positioned for both short-term gains and long-term growth.',
        confidence_rationale: 'Confidence is high as all specialist agents provided complete and positive data, aligning with strong financial trends.',
        profit_and_loss_summary: 'The company has demonstrated consistent revenue growth of ~15% YoY for the past three years. Net Profit Margins have expanded from 18% to 22% over the same period, indicating strong cost control and pricing power.',
        balance_sheet_summary: 'The balance sheet is healthy, with a low Debt-to-Equity ratio of 0.3. The company possesses strong cash reserves, providing a buffer against economic downturns and allowing for strategic investments.',
        cash_flow_summary: 'Operating cash flow is robust and has been consistently growing, indicating that the company\'s profits are backed by real cash. Free cash flow is positive, allowing for dividend payments and share buybacks.',
        financial_ratios_summary: 'Key financial ratios are healthy. The P/E ratio is slightly above the industry average, justified by its higher growth rate. Debt-to-equity is low, indicating a strong balance sheet.',
        ownership_summary: 'Promoter holding has remained stable, which is a positive sign. There has been a slight increase in FII (Foreign Institutional Investor) holding over the last two quarters, signaling growing international confidence.',
        exit_strategy: 'Consider selling if the stock price falls below the $140.00 stop-loss, or if there is a significant negative shift in macroeconomic conditions or a major product failure.',
        technical_summary: 'The stock is in a clear long-term uptrend. It is currently consolidating near its 50-day moving average, which could act as a support level for the next leg up.',
        improvement_suggestions: 'Access to management commentary from earnings calls, detailed analyst reports with financial models, and real-time insider trading data would provide a more nuanced view.',
    },
    sources: [{ uri: 'https://example.com/main-analysis', title: 'MockCorp Analysis Source' }],
    na_justifications: {},
};