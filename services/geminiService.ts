import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { StockAnalysis, EsgAnalysis, MacroAnalysis, NewsAnalysis, LeadershipAnalysis, MarketVoicesAnalysis, Expert, CompetitiveAnalysis, SectorAnalysis, CorporateCalendarAnalysis, ChiefAnalystCritique, RawFinancials, CalculatedMetric } from '../types';
import { FINANCIAL_AGENT_PROMPT, ESG_AGENT_PROMPT, MACRO_AGENT_PROMPT, NEWS_AGENT_PROMPT, LEADERSHIP_AGENT_PROMPT, MARKET_VOICES_AGENT_PROMPT, SCENARIO_PLANNER_PROMPT, COMPETITIVE_AGENT_PROMPT, SECTOR_OUTLOOK_AGENT_PROMPT, CORPORATE_CALENDAR_AGENT_PROMPT, CHIEF_ANALYST_AGENT_PROMPT, PLANNING_AGENT_PROMPT, FINANCIAL_DATA_EXTRACTOR_AGENT_PROMPT } from '../constants';

if (!process.env.API_KEY) {
  // The error handling in the app will catch the error from the SDK
  // and provide a user-friendly message.
  console.error("API_KEY environment variable not set. The application will not be able to make API calls.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


async function runAgent<T>(systemInstruction: string, userPrompt: string, useGoogleSearch: boolean = false, isJsonOutput: boolean = true): Promise<T> {
    const maxRetries = 1;
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            const agentName = systemInstruction.substring(6, systemInstruction.indexOf('.')).trim();
            console.log(`[Gemini Request] Agent: "${agentName}" | Prompt Chars: ~${systemInstruction.length + userPrompt.length} | Attempt: ${attempt + 1}`);

            const config: any = {
                systemInstruction: systemInstruction,
                temperature: 0.2,
            };

            // The API does not support using tools (like googleSearch) and setting a responseMimeType simultaneously.
            // This logic ensures only one is set at a time.
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

            const rawText = response.text.trim();
            console.log(`[Gemini Response] Agent: "${agentName}" | Response Chars: ~${rawText.length}`);
            
            if (!isJsonOutput) {
                return rawText as T;
            }

            let responseText = rawText;
            const markdownMatch = rawText.match(/```json\s*(\{[\s\S]*\})\s*```/);
            if (markdownMatch && markdownMatch[1]) {
                responseText = markdownMatch[1];
            } else {
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    console.error("AI response did not contain a valid JSON object. Raw response:", rawText);
                    throw new Error("Failed to parse AI response. The response did not contain a valid JSON object.");
                }
                responseText = jsonMatch[0];
            }
            
            const rawData = JSON.parse(responseText.replace(/\\n/g, "\\n"));

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
            const agentName = systemInstruction.substring(6, systemInstruction.indexOf('.')).trim();
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isRetriable = errorMessage.includes("503") || 
                                errorMessage.includes("UNAVAILABLE") || 
                                errorMessage.includes("overloaded") || 
                                errorMessage.includes("RESOURCE_EXHAUSTED") || 
                                errorMessage.includes("quota");

            if (isRetriable && attempt < maxRetries) {
                attempt++;
                console.warn(`[Gemini Retry] Agent "${agentName}" failed with a retriable error. Retrying (attempt ${attempt} of ${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Simple linear backoff
                continue; // Retry the loop
            }

            // Non-retriable error or max retries reached, throw a user-friendly error
            console.error(`Error running agent "${agentName}" after ${attempt + 1} attempt(s):`, error);
            
            if (errorMessage.includes("API key not valid") || errorMessage.includes("API key is missing")) {
                throw new Error("The API key is invalid or not configured. Please check your environment setup.");
            }
            if (errorMessage.includes("400 Bad Request")) {
                throw new Error("The request to the AI service was malformed. This may be due to an internal prompt or schema issue.");
            }
            if (errorMessage.includes("is unsupported")) {
                throw new Error("An internal configuration error occurred with the AI service.");
            }
            if (isRetriable) { // Specific message for final retry failure
                throw new Error("The model is currently overloaded. The request failed after multiple retries. Please try again later.");
            }
            throw error; // Re-throw other errors
        }
    }
    // This part should be unreachable, but TypeScript requires a return path or it will complain.
    throw new Error(`Agent failed for an unknown reason after ${maxRetries} retries.`);
}

export async function getAnalysisPlan(stockSymbol: string, marketName: string, agentList: string): Promise<string> {
    const userPrompt = `Stock: ${stockSymbol} (${marketName}). Enabled agents: ${agentList}.`;
    try {
        const result = await runAgent<string>(PLANNING_AGENT_PROMPT, userPrompt, false, false);
        return result;
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
        
        // More robust ESG score parsing to handle conversational AI responses.
        const receivedScoreStr = result.score ? String(result.score) : 'N/A';
        const scoreRegex = /\b(AAA|AA|A|BBB|BB|B|CCC)\b/i; // Find a valid score as a whole word
        const match = receivedScoreStr.match(scoreRegex);

        if (match && match[0]) {
            result.score = match[0].toUpperCase() as EsgAnalysis['score'];
        } else {
            // If no valid score is found in the string, default to N/A
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

export async function getNewsAnalysis(stockSymbol: string, marketName: string, overridePrompt?: string): Promise<NewsAnalysis> {
    let userPrompt = `Please perform a news analysis for the last 15 days for the company with the stock symbol: ${stockSymbol}, which trades in the ${marketName} market.`;
    if (overridePrompt) {
        userPrompt += `\n\nCRITICAL REFINEMENT QUESTION: You MUST answer this specific question in your analysis: "${overridePrompt}"`;
    }
    try {
        const systemInstruction = NEWS_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
        const result = await runAgent<NewsAnalysis>(systemInstruction, userPrompt, true);
        // Ensure regulatory_risks is an array even if the model omits it
        if (!result.regulatory_risks) {
            result.regulatory_risks = [];
        }
        return result;
    } catch (e) {
         console.error(e);
         throw new Error(e instanceof Error ? e.message : `News analysis failed for ${stockSymbol}.`);
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
        const systemInstruction = COMPETITIVE_AGENT_PROMPT.replace(/\[Market Name\]/g, marketName);
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

export async function getFinancialData(screenerUrl: string, screenerName: string): Promise<RawFinancials> {
    const userPrompt = `Please extract financial data for the company at URL: ${screenerUrl}`;
    try {
        const systemInstruction = FINANCIAL_DATA_EXTRACTOR_AGENT_PROMPT.replace(/\[Screener Name\]/g, screenerName);
        const result = await runAgent<RawFinancials>(systemInstruction, userPrompt, true);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error(e instanceof Error ? e.message : `Financial data extraction failed.`);
    }
}

export async function getChiefAnalystCritique(
    draftAnalysisSummary: string,
    sidekickContexts: { [key: string]: string }
): Promise<ChiefAnalystCritique> {
    let userPrompt = `DRAFT ANALYSIS SUMMARY:\n${draftAnalysisSummary}\n\nSPECIALIST AGENT REPORTS:\n`;
    for (const [agent, context] of Object.entries(sidekickContexts)) {
        userPrompt += `- ${agent.toUpperCase()}: ${context}\n`;
    }

    try {
        const result = await runAgent<ChiefAnalystCritique>(CHIEF_ANALYST_AGENT_PROMPT, userPrompt, true);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error(e instanceof Error ? e.message : `Chief Analyst critique failed.`);
    }
}

// Helper function to sanitize recommendation strings
const sanitizeRecommendation = (rec: string | undefined): StockAnalysis['recommendation'] => {
    if (!rec) return 'N/A';
    // Handles cases like "Hold (with caution)" -> "Hold"
    const sanitized = rec.split('(')[0].trim();
    const validRecs: StockAnalysis['recommendation'][] = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell', 'N/A'];
    if (validRecs.includes(sanitized as any)) {
      return sanitized as StockAnalysis['recommendation'];
    }
    return 'N/A';
};

// Helper function to sanitize sentiment strings
const sanitizeSentiment = (sentiment: string | undefined): StockAnalysis['overall_sentiment'] => {
    if (!sentiment) return 'N/A';
    const sanitized = sentiment.split('(')[0].trim();
    const validSentiments: StockAnalysis['overall_sentiment'][] = ['Strong Bullish', 'Bullish', 'Neutral', 'Bearish', 'Strong Bearish', 'N/A'];
     if (validSentiments.includes(sanitized as any)) {
      return sanitized as StockAnalysis['overall_sentiment'];
    }
    return 'N/A';
}

// Helper function to sanitize numeric values from the AI
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
    
    const normalizedData: StockAnalysis = {
        ...rawData,
        stock_symbol: rawData.stock_symbol || stockSymbol,
        share_name: rawData.share_name || rawData.company_name,
        current_price: sanitizeNumber(rawData.current_price ?? rawFinancials?.current_price),
        price_change: sanitizeNumber(rawData.price_change),
        price_change_percentage: rawData.price_change_percentage,
        overall_sentiment: sanitizeSentiment(rawData.overall_sentiment),
        recommendation: sanitizeRecommendation(rawData.recommendation),
        investment_horizon: {
            short_term: sanitizeRecommendation(rawData.investment_horizon?.short_term),
            long_term: sanitizeRecommendation(rawData.investment_horizon?.long_term),
        },
        target_price: {
            short_term: sanitizeNumber(rawData.target_price?.short_term),
            long_term: sanitizeNumber(rawData.target_price?.long_term),
        },
        stop_loss: sanitizeNumber(rawData.stop_loss),
        risk_analysis: rawData.risk_analysis ? {
            ...rawData.risk_analysis,
            risk_score: sanitizeNumber(rawData.risk_analysis.risk_score) ?? 50,
        } : null,
        contextual_inputs: {
            esg_summary: rawData.contextual_inputs?.esg_summary || context.esg,
            macroeconomic_summary: rawData.contextual_inputs?.macroeconomic_summary || context.macro,
            news_summary: rawData.contextual_inputs?.news_summary || context.news,
            leadership_summary: rawData.contextual_inputs?.leadership_summary || context.leadership,
            competitive_summary: rawData.contextual_inputs?.competitive_summary || context.competitive,
            sector_summary: rawData.contextual_inputs?.sector_summary || context.sector,
            corporate_calendar_summary: rawData.contextual_inputs?.corporate_calendar_summary || context.calendar
        },
        na_justifications: rawData.na_justifications || {}
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
