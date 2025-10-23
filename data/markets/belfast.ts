



import { GoogleGenAI } from "@google/genai";
import { StockCategory, MarketConfig } from '../../types';

// Logic to validate UK/Belfast stock symbols using Yahoo Finance.
const validateBelfastSymbol = async (symbol: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // The symbol is now expected to be correctly formatted (e.g., 'KNOS.L') by the calling function.
    const urlToCheck = `https://uk.finance.yahoo.com/quote/${symbol.toUpperCase()}`;
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
        name: 'Belfast & NI-Linked Companies',
        symbols: ['KNOS.L', 'FDP.L', 'AIBG.L', 'BIRG.L', 'DPH.L'],
        description: 'A mix of technology and financial services companies with deep roots or major operations in Belfast and Northern Ireland.',
        key_influencers: ['Local economic performance', 'UK government policies for NI', 'Access to talent from local universities', 'Brexit-related trade agreements (Windsor Framework)']
    }
];

export const belfastMarketConfig: MarketConfig = {
    id: 'BF',
    name: 'Belfast',
    screenerName: 'Yahoo Finance',
    screenerUrlTemplate: 'https://uk.finance.yahoo.com/quote/{symbol}',
    validateSymbol: validateBelfastSymbol,
    stockCategories: stockCategories,
    experts: [],
    currencySymbol: '£',
};