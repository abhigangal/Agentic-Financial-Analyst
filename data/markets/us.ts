

import { GoogleGenAI } from "@google/genai";
import { StockCategory, MarketConfig } from '../../types';

// Logic to validate US stock symbols using Yahoo Finance.
const validateYahooSymbol = async (symbol: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const urlToCheck = `https://finance.yahoo.com/quote/${symbol}`;
    // A more robust prompt to check for a valid page with actual data
    const contents = `URL: ${urlToCheck}. Does this URL lead to a valid Yahoo Finance page for a publicly traded stock? Look for a price and a chart. Answer ONLY "YES" or "NO".`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        temperature: 0,
        tools: [{googleSearch: {}}],
      },
    });

    return response.text.trim().toUpperCase().startsWith('YES');
  } catch (error) {
    console.error(`Error validating symbol ${symbol} on Yahoo Finance:`, error);
    return false;
  }
};

const stockCategories: StockCategory[] = [
    {
        name: 'Tech Giants',
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META'],
        description: 'Mega-cap technology companies that dominate their respective industries, from software and hardware to e-commerce and social media.',
        key_influencers: ['Global economic trends', 'Antitrust regulations', 'Innovation cycles', 'Consumer spending habits']
    },
    {
        name: 'Software & SaaS',
        symbols: ['INTU', 'CRM', 'ADBE', 'ORCL', 'SAP'],
        description: 'Companies providing enterprise and consumer software, often through a subscription (SaaS) model.',
        key_influencers: ['Corporate IT spending', 'Cloud adoption rates', 'Customer retention (churn)', 'Subscription growth']
    },
    {
        name: 'EV & Auto',
        symbols: ['TSLA', 'F', 'GM', 'RIVN', 'LCID'],
        description: 'Companies involved in the manufacturing of traditional and electric vehicles.',
        key_influencers: ['Battery technology', 'Supply chain for chips', 'Government subsidies for EVs', 'Oil prices']
    },
    {
        name: 'Financials',
        symbols: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA'],
        description: 'Major banks, payment processors, and financial services companies in the United States.',
        key_influencers: ['Federal Reserve interest rate policy', 'Loan growth', 'Market volatility', 'Regulatory changes']
    },
    {
        name: 'Entertainment',
        symbols: ['DIS', 'NFLX', 'WBD', 'PARA', 'CMCSA'],
        description: 'Companies focused on media, content creation, and streaming services.',
        key_influencers: ['Subscriber growth', 'Content production costs', 'Advertising market health', 'Box office results']
    },
     {
        name: 'Consumer Staples',
        symbols: ['WMT', 'PG', 'COST', 'KO', 'PEP'],
        description: 'Companies providing essential products, such as food, beverages, and household items.',
        key_influencers: ['Consumer confidence', 'Inflation', 'Supply chain efficiency', 'Brand loyalty']
    },
    {
        name: 'Retail',
        symbols: ['HD', 'TGT', 'NKE', 'LOW'],
        description: 'Large retail chains selling consumer goods, from home improvement to apparel.',
        key_influencers: ['Consumer discretionary spending', 'E-commerce trends', 'Inventory management', 'Seasonal sales performance']
    },
    {
        name: 'Healthcare',
        symbols: ['UNH', 'PFE', 'JNJ', 'LLY', 'ABBV'],
        description: 'Pharmaceutical giants, health insurance providers, and medical device manufacturers.',
        key_influencers: ['Drug pipelines and patents', 'Regulatory approvals (FDA)', 'Healthcare policy changes', 'Aging demographics']
    },
    {
        name: 'Insurance',
        symbols: ['ALL', 'PGR', 'TRV', 'BRK-B', 'AIG'],
        description: 'Major property, casualty, and life insurance carriers. (Note: BRK-B is the parent company of GEICO).',
        key_influencers: ['Interest rate changes', 'Catastrophe losses (weather events)', 'Regulatory capital requirements', 'Premium pricing cycles']
    },
];

export const usMarketConfig: MarketConfig = {
    id: 'US',
    name: 'United States',
    screenerName: 'Yahoo Finance',
    screenerUrlTemplate: 'https://finance.yahoo.com/quote/{symbol}',
    validateSymbol: validateYahooSymbol,
    stockCategories: stockCategories,
    experts: [],
    currencySymbol: '$',
};