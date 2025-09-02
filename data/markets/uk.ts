

import { GoogleGenAI } from "@google/genai";
import { StockCategory, MarketConfig } from '../../types';

// Logic to validate UK stock symbols using Yahoo Finance.
const validateUkSymbol = async (symbol: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // London Stock Exchange symbols often end in .L
    const symbolWithSuffix = symbol.toUpperCase().endsWith('.L') ? symbol.toUpperCase() : `${symbol.toUpperCase()}.L`;
    const urlToCheck = `https://uk.finance.yahoo.com/quote/${symbolWithSuffix}`;
    const contents = `URL: ${urlToCheck}. Is this a valid Yahoo Finance page for a publicly traded company? Answer ONLY "YES" or "NO".`;
    
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
        name: 'Financials',
        symbols: ['HSBC.L', 'BARC.L', 'LLOY.L', 'NWG.L', 'LSEG.L', 'PRU.L'],
        description: 'Major banks, financial services, and insurance companies listed on the London Stock Exchange.',
        key_influencers: ['Bank of England interest rates', 'UK economic growth', 'Global financial market trends', 'Financial regulation']
    },
    {
        name: 'Energy',
        symbols: ['SHEL.L', 'BP.L', 'CNA.L', 'HBR.L'],
        description: 'Leading oil, gas, and energy companies, including major global players.',
        key_influencers: ['Global oil and gas prices', 'Renewable energy transition policies', 'Geopolitical events', 'OPEC decisions']
    },
    {
        name: 'Consumer Staples',
        symbols: ['ULVR.L', 'DGE.L', 'BATS.L', 'IMB.L', 'TSCO.L', 'SBRY.L'],
        description: 'Companies providing essential consumer goods like food, beverages, and household products.',
        key_influencers: ['UK consumer spending', 'Inflation rates', 'Supermarket price competition', 'Global supply chains']
    },
    {
        name: 'Healthcare & Pharma',
        symbols: ['AZN.L', 'GSK.L', 'SN.L', 'HLN.L'],
        description: 'Global pharmaceutical giants and healthcare product companies.',
        key_influencers: ['Drug development pipelines', 'NHS funding and policies', 'Patent expirations', 'Global health trends']
    },
    {
        name: 'Basic Materials & Mining',
        symbols: ['RIO.L', 'GLEN.L', 'AAL.L', 'ANTO.L'],
        description: 'Major mining corporations dealing in industrial metals, precious metals, and other raw materials.',
        key_influencers: ['Global commodity prices', 'Demand from China and other industrial economies', 'Environmental regulations', 'Mining operation costs']
    },
    {
        name: 'Industrials & Defence',
        symbols: ['BA.L', 'RR.L', 'SMIN.L'],
        description: 'Companies in aerospace, defense, and industrial engineering.',
        key_influencers: ['Government defense spending', 'Global airline industry health', 'Infrastructure projects', 'Manufacturing output']
    },
    {
        name: 'Technology',
        symbols: ['DARK.L', 'SGE.L', 'III.L'],
        description: 'Software, IT services, and technology hardware companies.',
        key_influencers: ['Corporate IT budgets', 'Cybersecurity trends', 'Cloud computing adoption', 'Technological innovation']
    },
];

export const ukMarketConfig: MarketConfig = {
    id: 'UK',
    name: 'United Kingdom',
    screenerName: 'Yahoo Finance',
    screenerUrlTemplate: 'https://uk.finance.yahoo.com/quote/{symbol}',
    validateSymbol: validateUkSymbol,
    stockCategories: stockCategories,
    experts: [],
    currencySymbol: '£',
};