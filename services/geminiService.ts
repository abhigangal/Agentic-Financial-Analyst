import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { StockAnalysis, EsgAnalysis, MacroAnalysis, MarketIntelligenceAnalysis, LeadershipAnalysis, MarketVoicesAnalysis, Expert, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, ChiefAnalystCritique, RawFinancials, CalculatedMetric, TechnicalAnalysis, ContrarianAnalysis, AgentKey, QuantitativeAnalysis, HistoricalPriceDataPoint, LiveMarketData, HistoricalFinancials } from '../types';
import { FINANCIAL_AGENT_PROMPT, ESG_AGENT_PROMPT, MACRO_AGENT_PROMPT, MARKET_INTELLIGENCE_AGENT_PROMPT, LEADERSHIP_AGENT_PROMPT, MARKET_VOICES_AGENT_PROMPT, SCENARIO_PLANNER_PROMPT, COMPETITIVE_AGENT_PROMPT, SECTOR_OUTLOOK_AGENT_PROMPT, CORPORATE_CALENDAR_AGENT_PROMPT, CHIEF_ANALYST_AGENT_PROMPT, PLANNING_AGENT_PROMPT, CONTRARIAN_AGENT_PROMPT, QUANTITATIVE_AGENT_PROMPT, COMPETITIVE_US_AGENT_PROMPT, MARKET_INTELLIGENCE_US_AGENT_PROMPT, LIVE_MARKET_DATA_AGENT_PROMPT, HISTORICAL_FINANCIALS_AGENT_PROMPT, LIVE_MARKET_DATA_BANK_AGENT_PROMPT, HISTORICAL_FINANCIALS_BANK_AGENT_PROMPT, LIVE_MARKET_DATA_FINVIZ_AGENT_PROMPT, HISTORICAL_FINANCIALS_FINVIZ_AGENT_PROMPT, LIVE_MARKET_DATA_YAHOO_AGENT_PROMPT, HISTORICAL_FINANCIALS_YAHOO_AGENT_PROMPT } from '../constants';

if (!process.env.API_KEY) {
  // The error handling in the app will catch the error from the SDK
  // and provide a user-friendly message.
  console.error("API_KEY environment variable not set. The application will not be able to make API calls.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


async function runAgent<T>(systemInstruction: string, userPrompt: string, useGoogleSearch: boolean = false, isJsonOutput: boolean = true): Promise<T> {
    const maxRetries = 3;
    let attempt = 0;
    const agentName = systemInstruction.substring(6, systemInstruction.indexOf('.')).trim();

    while (attempt <= maxRetries) {
        try {
            console.log(`[Gemini Request] Agent: "${agentName}" | Prompt Chars: ~${systemInstruction.length + userPrompt.length} | Attempt: ${attempt + 1}`);

            const config: any = {
                systemInstruction: systemInstruction,
                temperature: 0.2,
            };

            if (useGoogleSearch) {
                config.tools = [{ googleSearch: {} }];
            } else if (isJsonOutput) {
                config.responseMimeType = "application/json";
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: config,
            });

            if (response.text === undefined || response.text === null) {
                console.error(`[Gemini Error] Agent "${agentName}" received an empty text response. Full response object:`, response);
                throw new Error(`Agent "${agentName}" returned an empty response. This may be due to a content filter or an internal model error.`);
            }
            const responseText = response.text.trim();
            console.log(`[Gemini Response] Agent: "${agentName}" | Response Chars: ~${responseText.length}`);

            if (!isJsonOutput) {
                return responseText as T;
            }
            
            let jsonString = responseText;

            // When using tools like Google Search, `responseMimeType` cannot be set.
            // The model might wrap its JSON response in markdown fences.
            // This logic attempts to extract the raw JSON string.
            if (config.tools) {
                const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (match && match[1]) {
                    console.log(`[Gemini JSON Fix] Extracted JSON from markdown for agent "${agentName}".`);
                    jsonString = match[1];
                }
            }

            let rawData;
            try {
                rawData = JSON.parse(jsonString);
            } catch (error) {
                console.error(`[Gemini JSON Parse Error] Failed to parse JSON for agent "${agentName}". Raw response:`, responseText);
                throw new Error(`Failed to parse AI response for agent "${agentName}". The model did not return valid JSON.`);
            }

            if (useGoogleSearch) {
                const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
                if (groundingMetadata) {
                    const sources = groundingMetadata.groundingChunks
                        ?.map(chunk => chunk.web)
                        .filter((web): web is { uri: string; title: string; } => !!web?.uri)
                        .reduce((acc: { uri: string; title: string; }[], current) => {
                            if (!acc.some(item => item.uri === current.uri)) {
                                acc.push(current);
                            }
                            return acc;
                        }, []) || [];

                    return { ...rawData, sources } as T;
                }
            }
            
            return rawData as T;

        } catch (error) {
            const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();
            const isRetriable = errorMessage.includes("503") ||
                                errorMessage.includes("500") ||
                                errorMessage.includes("504") ||
                                errorMessage.includes("unavailable") || 
                                errorMessage.includes("overloaded") || 
                                errorMessage.includes("resource_exhausted") || 
                                errorMessage.includes("quota");

            if (isRetriable && attempt < maxRetries) {
                attempt++;
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                console.warn(`[Gemini Retry] Agent "${agentName}" failed with a retriable error. Retrying in ${Math.round(delay/1000)}s (attempt ${attempt} of ${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            console.error(`Error running agent "${agentName}" after ${attempt + 1} attempt(s):`, error);
            
            if (errorMessage.includes("api key not valid") || errorMessage.includes("api key is missing")) {
                throw new Error("The API key is invalid or not configured. Please check your environment setup.");
            }
            if (errorMessage.includes("400 bad request")) {
                throw new Error("The request to the AI service was malformed. This may be due to an internal prompt or schema issue.");
            }
            if (errorMessage.includes("is unsupported")) {
                throw new Error("An internal configuration error occurred with the AI service.");
            }
            if (isRetriable) {
                throw new Error("The model is currently overloaded. The request failed after multiple retries. Please try again later.");
            }
            throw error;
        }
    }
    throw new Error(`Agent "${agentName}" failed for an unknown reason after ${maxRetries + 1} retries.`);
}

export async function getAnalysisPlan(stockSymbol: string, marketName: string, agentList: string): Promise<string> {
    const userPrompt = `Stock: ${stockSymbol} (${marketName}). Enabled agents: ${agentList}.`;
    try {
        const result = await runAgent<{plan: string[]}>(PLANNING_AGENT_PROMPT, userPrompt, false, true);
        return Array.isArray(result.plan) ? result.plan.map(step => `- ${step}`).join('\n') : "Plan generation failed.";
    } catch (e) {
        console.error(e);
        throw new Error("Failed to generate analysis plan.");
    }
}

export async function getEsgAnalysis(stockSymbol: string, marketName: string, overridePrompt?: string): Promise<EsgAnalysis> {
    let userPrompt = `Please perform an ESG analysis for the company with the stock symbol: ${stockSymbol}, which trades in the ${marketName} market.`;
    if (overridePrompt) {
        userPrompt += `\n\nCRITICAL REFINEMENT QUESTION: You MUST answer this specific question in your analysis: "${overridePrompt}"`;
    }
    try {
        const systemInstruction = ESG_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        const result = await runAgent<EsgAnalysis>(systemInstruction, userPrompt, true);
        
        const receivedScoreStr = result.score ? String(result.score) : 'N/A';
        const scoreRegex = /\b(AAA|AA|A|BBB|BB|B|CCC)\b/i;
        const match = receivedScoreStr.match(scoreRegex);

        if (match && match[0]) {
            result.score = match[0].toUpperCase() as EsgAnalysis['score'];
        } else {
            if (result.score !== 'N/A') {
                 console.warn(`Could not parse a valid ESG score from '${result.score}' for ${stockSymbol}. Defaulting to N/A.`);
                 result.na_justifications = {
                    ...result.na_justifications,
                    score: `The AI returned a non-standard score ('${result.score}') that could not be parsed.`,
                 };
            }
            result.score = 'N/A';
        }

        return result;
    } catch (e) {
         console.error(e);
         throw new Error(e instanceof Error ? e.message : `ESG analysis failed for ${stockSymbol}.`);
    }
}

export async function getMacroAnalysis(stockSymbol: string, marketName: string, overridePrompt?: string): Promise<MacroAnalysis> {
    let userPrompt = `Please perform a macroeconomic analysis for ${marketName} relevant to the company with the stock symbol: ${stockSymbol}`;
    if (overridePrompt) {
        userPrompt += `\n\nCRITICAL REFINEMENT QUESTION: You MUST answer this specific question in your analysis: "${overridePrompt}"`;
    }
    try {
        const systemInstruction = MACRO_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        const result = await runAgent<MacroAnalysis>(systemInstruction, userPrompt, true);
        return result;
    } catch (e) {
         console.error(e);
         throw new Error(e instanceof Error ? e.message : `Macroeconomic analysis failed for ${stockSymbol}.`);
    }
}

export async function getMarketIntelligenceAnalysis(stockSymbol: string, marketName: string, overridePrompt?: string): Promise<MarketIntelligenceAnalysis> {
    let userPrompt = `Please perform a market intelligence analysis for the company with the stock symbol: ${stockSymbol}, which trades in the ${marketName} market.`;
    if (overridePrompt) {
        userPrompt += `\n\nCRITICAL REFINEMENT QUESTION: You MUST answer this specific question in your analysis: "${overridePrompt}"`;
    }
    try {
        let systemInstruction = MARKET_INTELLIGENCE_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        if (marketName === 'United States') {
            systemInstruction = MARKET_INTELLIGENCE_US_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        }
        const result = await runAgent<MarketIntelligenceAnalysis>(systemInstruction, userPrompt, true);
        if (!result.regulatory_and_geopolitical_risks) result.regulatory_and_geopolitical_risks = [];
        if (!result.key_articles) result.key_articles = [];
        if (!result.key_positive_points) result.key_positive_points = [];
        if (!result.key_negative_points) result.key_negative_points = [];
        if (!result.major_holders) result.major_holders = [];
        return result;
    } catch (e) {
         console.error(e);
         throw new Error(e instanceof Error ? e.message : `Market Intelligence analysis failed for ${stockSymbol}.`);
    }
}


export async function getLeadershipAnalysis(stockSymbol: string, marketName: string, overridePrompt?: string): Promise<LeadershipAnalysis> {
    let userPrompt = `Please perform a leadership analysis for the company with the stock symbol: ${stockSymbol}, which trades in the ${marketName} market.`;
    if (overridePrompt) {
        userPrompt += `\n\nCRITICAL REFINEMENT QUESTION: You MUST answer this specific question in your analysis: "${overridePrompt}"`;
    }
    try {
        const systemInstruction = LEADERSHIP_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        const result = await runAgent<LeadershipAnalysis>(systemInstruction, userPrompt, true);
        return result;
    } catch (e) {
         console.error(e);
         throw new Error(e instanceof Error ? e.message : `Leadership analysis failed for ${stockSymbol}.`);
    }
}

export async function getCompetitiveAnalysis(stockSymbol: string, marketName: string, overridePrompt?: string): Promise<CompetitiveAnalysis> {
    let userPrompt = `Please perform a competitive analysis for the company with the stock symbol: ${stockSymbol}, which trades in the ${marketName} market.`;
    if (overridePrompt) {
        userPrompt += `\n\nCRITICAL REFINEMENT QUESTION: You MUST answer this specific question in your analysis: "${overridePrompt}"`;
    }
    try {
        let systemInstruction = COMPETITIVE_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        if (marketName === 'United States') {
            systemInstruction = COMPETITIVE_US_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        }
        const result = await runAgent<CompetitiveAnalysis>(systemInstruction, userPrompt, true);
        return result;
    } catch (e) {
         console.error(e);
         throw new Error(e instanceof Error ? e.message : `Competitive analysis failed for ${stockSymbol}.`);
    }
}

export async function getSectorAnalysis(stockSymbol: string, marketName: string, overridePrompt?: string): Promise<SectorAnalysis> {
    let userPrompt = `Please perform a sector outlook analysis for the industry of the company with the stock symbol: ${stockSymbol}, which trades in the ${marketName} market.`;
    if (overridePrompt) {
        userPrompt += `\n\nCRITICAL REFINEMENT QUESTION: You MUST answer this specific question in your analysis: "${overridePrompt}"`;
    }
    try {
        const systemInstruction = SECTOR_OUTLOOK_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        const result = await runAgent<SectorAnalysis>(systemInstruction, userPrompt, true);
        return result;
    } catch (e) {
         console.error(e);
         throw new Error(e instanceof Error ? e.message : `Sector analysis failed for ${stockSymbol}.`);
    }
}

export async function getCorporateCalendarAnalysis(stockSymbol: string, marketName: string, overridePrompt?: string): Promise<CorporateCalendarAnalysis> {
    let userPrompt = `Please find the corporate calendar for the company with the stock symbol: ${stockSymbol}, which trades in the ${marketName} market.`;
    if (overridePrompt) {
        userPrompt += `\n\nCRITICAL REFINEMENT QUESTION: You MUST answer this specific question in your analysis: "${overridePrompt}"`;
    }
    try {
        const systemInstruction = CORPORATE_CALENDAR_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        const result = await runAgent<CorporateCalendarAnalysis>(systemInstruction, userPrompt, true);
        return result;
    } catch (e) {
         console.error(e);
         throw new Error(e instanceof Error ? e.message : `Corporate calendar analysis failed for ${stockSymbol}.`);
    }
}

export async function getContrarianAnalysis(draftSummary: string, specialistContexts: Record<string, string>): Promise<ContrarianAnalysis> {
    let userPrompt = `CONSENSUS VIEW:\n${draftSummary}\n\nSUPPORTING DATA FROM SPECIALISTS:\n`;
    for (const [agent, context] of Object.entries(specialistContexts)) {
        userPrompt += `- ${agent.toUpperCase()}: ${context}\n`;
    }
    try {
        return await runAgent<ContrarianAnalysis>(CONTRARIAN_AGENT_PROMPT, userPrompt, true);
    } catch (e) {
        console.error(e);
        throw new Error(e instanceof Error ? e.message : `Contrarian analysis failed.`);
    }
}

export async function getQuantitativeAnalysis(
    historicalPrices: HistoricalPriceDataPoint[],
    sentimentScore: number | null,
    managementConfidence: number | null,
    currentPrice: number | null
): Promise<QuantitativeAnalysis> {
    let historicalDataPrompt = 'No historical data available.';
    if (historicalPrices.length > 0) {
        historicalDataPrompt = `HISTORICAL DATA (last 30 days):\n${historicalPrices.slice(-30).map(p => `${p.date}: ${p.close}`).join('\n')}`;
    }

    const userPrompt = `
        CURRENT PRICE: ${currentPrice ?? 'N/A'}
        ${historicalDataPrompt}

        QUALITATIVE SIGNALS:
        - sentiment_score: ${sentimentScore ?? 'N/A'}
        - management_confidence_score: ${managementConfidence ?? 'N/A'}
    `;
    try {
        return await runAgent<QuantitativeAnalysis>(QUANTITATIVE_AGENT_PROMPT, userPrompt, false);
    } catch(e) {
        console.error(e);
        throw new Error(e instanceof Error ? e.message : `Quantitative analysis failed.`);
    }
}

export async function getLiveMarketData(stockSymbol: string, screenerUrl: string, screenerName: string, marketName: string, isBank: boolean = false): Promise<LiveMarketData> {
    const userPrompt = `Please extract live market data for the company [${stockSymbol}] at URL: ${screenerUrl}`;
    try {
        let systemInstruction: string;
        switch (screenerName) {
            case 'Finviz':
                systemInstruction = LIVE_MARKET_DATA_FINVIZ_AGENT_PROMPT;
                break;
            case 'Yahoo Finance':
                 systemInstruction = LIVE_MARKET_DATA_YAHOO_AGENT_PROMPT;
                 break;
            case 'Screener.in':
            default:
                systemInstruction = isBank ? LIVE_MARKET_DATA_BANK_AGENT_PROMPT : LIVE_MARKET_DATA_AGENT_PROMPT;
                break;
        }
        
        systemInstruction = systemInstruction.replace(/\[Market Name\]/g, marketName);
        systemInstruction = systemInstruction.replace(/\[STOCK_SYMBOL\]/g, stockSymbol);

        return await runAgent<LiveMarketData>(systemInstruction, userPrompt, true);
    } catch (e) {
        console.error(e);
        throw new Error(e instanceof Error ? e.message : `Live market data extraction failed for ${screenerName}.`);
    }
}

export async function getHistoricalFinancials(screenerUrl: string, screenerName: string, marketName: string, isBank: boolean = false): Promise<HistoricalFinancials> {
    const userPrompt = `Please extract historical financial statements for the company at URL: ${screenerUrl}`;
    try {
        let systemInstruction: string;
        switch (screenerName) {
            case 'Finviz':
                systemInstruction = HISTORICAL_FINANCIALS_FINVIZ_AGENT_PROMPT;
                break;
            case 'Yahoo Finance':
                 systemInstruction = HISTORICAL_FINANCIALS_YAHOO_AGENT_PROMPT;
                 break;
            case 'Screener.in':
            default:
                systemInstruction = isBank ? HISTORICAL_FINANCIALS_BANK_AGENT_PROMPT : HISTORICAL_FINANCIALS_AGENT_PROMPT;
                break;
        }
        
        systemInstruction = systemInstruction.replace(/\[Market Name\]/g, marketName);

        return await runAgent<HistoricalFinancials>(systemInstruction, userPrompt, true);
    } catch (e) {
        console.error(e);
        throw new Error(e instanceof Error ? e.message : `Historical financials extraction failed for ${screenerName}.`);
    }
}

export async function getChiefAnalystCritique(
    draftAnalysisSummary: string,
    sidekickContexts: { [key: string]: string },
    successfulAgents: AgentKey[]
): Promise<ChiefAnalystCritique> {
    let userPrompt = `DRAFT ANALYSIS SUMMARY:\n${draftAnalysisSummary}\n\nSPECIALIST AGENT REPORTS:\n`;
    for (const [agent, context] of Object.entries(sidekickContexts)) {
        userPrompt += `- ${agent.toUpperCase()}: ${context}\n`;
    }

    const agentEnum = successfulAgents.map(a => `'${a.toUpperCase()}'`).join('|') + "|'None'";
    const systemInstruction = CHIEF_ANALYST_AGENT_PROMPT
        .replace('[AGENT_LIST]', successfulAgents.join(', ').toUpperCase())
        .replace('[AGENT_LIST_ENUM]', agentEnum);

    try {
        const result = await runAgent<ChiefAnalystCritique>(systemInstruction, userPrompt, true);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error(e instanceof Error ? e.message : `Chief Analyst critique failed.`);
    }
}

const sanitizeRecommendation = (rec: string | undefined): StockAnalysis['recommendation'] => {
    if (!rec) return 'N/A';
    const sanitized = rec.split('(')[0].trim();
    const validRecs: StockAnalysis['recommendation'][] = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell', 'N/A'];
    if (validRecs.includes(sanitized as any)) {
      return sanitized as StockAnalysis['recommendation'];
    }
    return 'N/A';
};

const sanitizeSentiment = (sentiment: string | undefined): StockAnalysis['overall_sentiment'] => {
    if (!sentiment) return 'N/A';
    const sanitized = sentiment.split('(')[0].trim();
    const validSentiments: StockAnalysis['overall_sentiment'][] = ['Strong Bullish', 'Bullish', 'Neutral', 'Bearish', 'Strong Bearish', 'N/A'];
     if (validSentiments.includes(sanitized as any)) {
      return sanitized as StockAnalysis['overall_sentiment'];
    }
    return 'N/A';
}

const sanitizeNumber = (value: any): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const cleanedString = value.replace(/[^0-9.-]/g, '');
    if (cleanedString === '') {
      return null;
    }
    const num = parseFloat(cleanedString);
    return isNaN(num) ? null : num;
  }
  return null;
};


export async function getStockAnalysis(
    stockSymbol: string, 
    marketName: string, 
    context: Record<string, string>,
    rawFinancials: RawFinancials | null,
    calculatedMetrics: Record<string, CalculatedMetric>,
    chiefAnalystCritique: string = ''
): Promise<StockAnalysis> {
  try {
    let userPrompt = `Synthesize an analysis for ${stockSymbol}.`;
    userPrompt += `\n\nCONTEXTUAL SUMMARIES:\n${JSON.stringify(context, null, 2)}`;
    userPrompt += `\n\nRAW FINANCIAL DATA:\n${JSON.stringify(rawFinancials, null, 2)}`;
    userPrompt += `\n\nCALCULATED METRICS:\n${JSON.stringify(calculatedMetrics, null, 2)}`;

    let systemInstruction = FINANCIAL_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
    
    if (chiefAnalystCritique) {
        systemInstruction = systemInstruction.replace(/\[CHIEF_ANALYST_CRITIQUE\]/g, chiefAnalystCritique);
    } else {
        systemInstruction = systemInstruction.replace(/\[CHIEF_ANALYST_CRITIQUE\]/g, '');
    }

    const rawData = await runAgent<any>(systemInstruction, userPrompt, false);
    
    const currentPrice = sanitizeNumber(rawData.current_price ?? rawFinancials?.current_price);
    let stopLoss = sanitizeNumber(rawData.stop_loss);
    let naJustifications = rawData.na_justifications || {};

    if (currentPrice !== null && stopLoss !== null && stopLoss >= currentPrice) {
        naJustifications.stop_loss = `Invalid stop_loss (${stopLoss}) was generated, which is higher than or equal to the current price (${currentPrice}). It has been removed for safety.`;
        stopLoss = null;
    }
    
    const normalizedData: StockAnalysis = {
        ...rawData,
        stock_symbol: rawData.stock_symbol || stockSymbol,
        share_name: rawData.share_name || rawData.company_name,
        current_price: currentPrice,
        price_change: sanitizeNumber(rawData.price_change),
        price_change_percentage: rawData.price_change_percentage,
        overall_sentiment: sanitizeSentiment(rawData.overall_sentiment),
        recommendation: sanitizeRecommendation(rawData.recommendation),
        investment_horizon: {
            short_term: sanitizeRecommendation(rawData.investment_horizon?.short_term),
            long_term: sanitizeRecommendation(rawData.investment_horizon?.long_term),
        },
        target_price: {
            short_term: {
                low: sanitizeNumber(rawData.target_price?.short_term?.low),
                high: sanitizeNumber(rawData.target_price?.short_term?.high)
            },
            long_term: {
                low: sanitizeNumber(rawData.target_price?.long_term?.low),
                high: sanitizeNumber(rawData.target_price?.long_term?.high)
            },
        },
        stop_loss: stopLoss,
        risk_analysis: rawData.risk_analysis ? {
            ...rawData.risk_analysis,
            risk_score: sanitizeNumber(rawData.risk_analysis.risk_score) ?? 50,
        } : null,
        contextual_inputs: {
            esg_summary: rawData.contextual_inputs?.esg_summary || context.esg,
            macroeconomic_summary: rawData.contextual_inputs?.macroeconomic_summary || context.macro,
            market_intelligence_summary: rawData.contextual_inputs?.market_intelligence_summary || context.market_intel,
            leadership_summary: rawData.contextual_inputs?.leadership_summary || context.leadership,
            competitive_summary: rawData.contextual_inputs?.competitive_summary || context.competitive,
            sector_summary: rawData.contextual_inputs?.sector_summary || context.sector,
            corporate_calendar_summary: rawData.contextual_inputs?.corporate_calendar_summary || context.calendar,
            technical_analysis_summary: rawData.contextual_inputs?.technical_analysis_summary || context.technical,
            contrarian_summary: rawData.contextual_inputs?.contrarian_summary || context.contrarian,
            quantitative_summary: rawData.contextual_inputs?.quantitative_summary || context.quantitative,
        },
        na_justifications: naJustifications
    };

    if (!normalizedData.stock_symbol || !normalizedData.justification) {
        throw new Error("Invalid response format from AI. Missing key fields like justification or stock symbol.");
    }
    
    return normalizedData;

  } catch (error) {
    console.error(`Error getting stock analysis for ${stockSymbol}:`, error);
    throw new Error(error instanceof Error ? error.message : `Failed to generate stock analysis. The AI may be temporarily unavailable or the input was invalid.`);
  }
}

export async function getMarketVoices(experts: Expert[], marketName: string): Promise<MarketVoicesAnalysis> {
    const expertNames = experts.map(e => e.name).join(', ');
    const userPrompt = `Please find recent stock recommendations for the following experts in the ${marketName} market: ${expertNames}.`;
    try {
        const systemInstruction = MARKET_VOICES_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        const result = await runAgent<MarketVoicesAnalysis>(systemInstruction, userPrompt, true);
        return result;
    } catch (e) {
         console.error(e);
         throw new Error(e instanceof Error ? e.message : `Failed to get market voices.`);
    }
}

export async function startScenarioChat(stockContext: string): Promise<Chat> {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SCENARIO_PLANNER_PROMPT(stockContext),
      temperature: 0.5,
    },
  });
  return chat;
}