import React, { useState, useMemo } from 'react';
import { getMarketVoices } from '../services/geminiService';
import { MarketVoicesAnalysis, ExpertPick, Expert, User } from '../types';
import { Loader } from './Loader';
import { CollapsibleSection } from './CollapsibleSection';
import { ChatBubbleLeftRightIcon, LinkIcon, InformationCircleIcon, PlayCircleIcon, LockClosedIcon, NoSymbolIcon } from './IconComponents';
import { Tooltip } from './Tooltip';

interface MarketVoicesProps {
  user: User;
  experts: Expert[];
  marketName: string;
  onSelectStock: (symbol: string) => void;
  disabled: boolean;
}

const recColors: { [key: string]: string } = {
  'Buy': 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:border-green-500/50 dark:text-green-300',
  'Outperform': 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:border-green-500/50 dark:text-green-300',
  'Accumulate': 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:border-sky-500/50 dark:text-sky-300',
  'Hold': 'border-slate-400 bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-300',
  'Neutral': 'border-slate-400 bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-300',
  'Sell': 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:border-red-500/50 dark:text-red-300',
  'Underperform': 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:border-red-500/50 dark:text-red-300',
  'N/A': 'border-slate-300 bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400',
};

// --- In-session cache for Market Voices ---
interface MarketVoicesCacheItem {
    data: MarketVoicesAnalysis;
    timestamp: number;
}
const marketVoicesCache: Record<string, MarketVoicesCacheItem> = {};
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null; 
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return null;
    }
};

const RecommendationCard: React.FC<{ pick: ExpertPick, onSelectStock: (symbol: string) => void, disabled: boolean }> = ({ pick, onSelectStock, disabled }) => {
    const colorClass = recColors[pick.recommendation_type] || recColors['N/A'];
    const formattedDate = formatDate(pick.published_date);

    return (
        <div className="p-3 bg-white border border-gray-200/80 rounded-lg dark:bg-slate-700/50 dark:border-slate-600/80">
            <div className="flex justify-between items-start gap-2">
                <div>
                    <button 
                        onClick={() => onSelectStock(pick.stock_symbol)}
                        disabled={disabled}
                        className="font-bold text-blue-600 hover:underline text-base leading-tight pr-2 dark:text-blue-400 dark:hover:text-blue-300 disabled:cursor-not-allowed disabled:no-underline"
                        data-test={`market-voices-stock-button-${pick.stock_symbol}`}
                    >
                        {pick.stock_symbol}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{pick.company_name}</p>
                </div>
                <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${colorClass}`}>
                        {pick.recommendation_type}
                    </span>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                        {pick.is_inferred && (
                            <Tooltip text="This pick is inferred from public holdings, not a direct quote.">
                                <InformationCircleIcon className="h-4 w-4 text-slate-400" />
                            </Tooltip>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {`${Math.round(pick.confidence_score * 100)}% conf.`}
                        </span>
                    </div>
                </div>
            </div>
            <p className="text-sm text-slate-600 mt-2 dark:text-slate-300">{pick.summary}</p>
            <div className="flex justify-between items-center mt-3">
                 <a 
                    href={pick.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:underline"
                >
                    <LinkIcon /> Source
                </a>
                {formattedDate && (
                    <p className="text-xs text-slate-500 font-mono dark:text-slate-400">{formattedDate}</p>
                )}
            </div>
        </div>
    );
};

export const MarketVoices: React.FC<MarketVoicesProps> = ({ user, experts, marketName, onSelectStock, disabled }) => {
    const [analysis, setAnalysis] = useState<MarketVoicesAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<number>(1);
    const [hasStarted, setHasStarted] = useState(false);

    const isPremiumFeature = true;
    const canAccess = !isPremiumFeature || user.role === 'premium';

    const handleLoadVoices = async () => {
        if (isLoading || !canAccess) {
            return;
        }
        setHasStarted(true);
        setIsLoading(true);
        setError(null);

        // Check cache first
        const cacheKey = marketName;
        const cached = marketVoicesCache[cacheKey];
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            console.log(`[Cache] Using cached Market Voices for ${marketName}.`);
            setAnalysis(cached.data);
            setIsLoading(false);
            return;
        }

        try {
            const result = await getMarketVoices(experts, marketName);
            setAnalysis(result);
            // Update cache
            marketVoicesCache[cacheKey] = { data: result, timestamp: Date.now() };
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Failed to fetch expert recommendations.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const expertPicksMap = useMemo(() => {
        const map = new Map<string, ExpertPick[]>();
        if (!analysis?.expert_picks) return map;
        analysis.expert_picks.forEach(item => {
            map.set(item.expert_name, item.picks);
        });
        return map;
    }, [analysis]);

    const expertsByTier = useMemo(() => {
        const tiers: { [key: number]: Expert[] } = { 1: [], 2: [], 3: [] };
        experts.forEach(expert => {
            if (tiers[expert.tier]) {
                tiers[expert.tier].push(expert);
            }
        });
        return tiers;
    }, [experts]);
    
    if (!experts || experts.length === 0) {
        return (
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm h-full dark:bg-slate-800/50 dark:border-slate-700/80 animate-fade-in flex flex-col items-center justify-center text-center p-6">
                 <NoSymbolIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4"/>
                 <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">No Experts Available</h3>
                 <p className="text-sm text-slate-500 mt-1 max-w-xs dark:text-slate-400">Expert analysis is not available for the {marketName} market at this time.</p>
            </div>
        );
    }

    const renderExpertsList = (tier: number) => {
        const tierExperts = expertsByTier[tier] || [];
        if (tierExperts.length === 0) {
            return <p className="text-center text-slate-500 py-4">No experts defined for this tier.</p>
        }
        
        return (
            <div className="space-y-3 mt-4">
            {tierExperts.map(expert => {
                const picks = expertPicksMap.get(expert.name) || [];
                return (
                    <CollapsibleSection key={expert.name} title={expert.name} icon={<ChatBubbleLeftRightIcon className="h-5 w-5"/>}>
                        <p className="prose prose-sm text-slate-600 max-w-none dark:text-slate-300 mb-4">{expert.description}</p>
                        {picks.length > 0 ? (
                            <div className="space-y-3">
                                {picks.map(pick => (
                                    <RecommendationCard 
                                        key={`${pick.stock_symbol}-${pick.source_url}`} 
                                        pick={pick} 
                                        onSelectStock={onSelectStock}
                                        disabled={disabled}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 text-sm py-4 bg-slate-50 rounded-md dark:bg-slate-700/50">No recent recommendations found.</p>
                        )}
                    </CollapsibleSection>
                )
            })}
            </div>
        )
    }

    const renderContent = () => {
        if (!hasStarted) {
             return (
                <div className="text-center py-10 flex flex-col items-center">
                    <button 
                        onClick={handleLoadVoices} 
                        disabled={disabled || isLoading || !canAccess}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors duration-200 disabled:bg-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed dark:disabled:bg-slate-700 dark:disabled:text-slate-400 group relative"
                        data-test="load-expert-picks-button"
                    >
                        {!canAccess && <LockClosedIcon className="h-5 w-5" />}
                        {canAccess && <PlayCircleIcon className="h-5 w-5" />}
                        <span>Load Expert Picks</span>
                    </button>
                     {!canAccess && (
                        <div className="text-xs text-amber-700 dark:text-amber-300 mt-3 max-w-sm bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md border border-amber-200 dark:border-amber-500/30">
                            <b>Premium Feature:</b> Access to expert picks requires a premium account.
                            <br/>
                            <span className="font-mono text-xs">(To test, sign up with email: <b>user@premium.com</b>)</span>
                        </div>
                    )}
                    {canAccess && <p className="text-xs text-slate-500 mt-3 dark:text-slate-400 max-w-xs">Fetches the latest recommendations from top analysts.</p>}
                </div>
            );
        }
        
        if (isLoading) {
            return <Loader message="Getting latest expert picks..." />;
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-300">
                    <p className="font-bold">Could not fetch Market Voices</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            );
        }
        if (!analysis || !analysis.expert_picks || analysis.expert_picks.length === 0) {
            return <p className="text-center text-slate-500 py-4">No recommendations found in the last 15 days.</p>
        }

        return (
            <div>
                <div className="flex flex-wrap gap-x-2 gap-y-2 border-b border-gray-200 dark:border-slate-700 pb-3 mb-3">
                    <button onClick={() => setActiveTab(1)} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeTab === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'}`} data-test="tier-tab-1">Tier 1: Veterans</button>
                    <button onClick={() => setActiveTab(2)} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeTab === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'}`} data-test="tier-tab-2">Tier 2: Analysts</button>
                    <button onClick={() => setActiveTab(3)} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeTab === 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'}`} data-test="tier-tab-3">Tier 3: Educators</button>
                </div>
                {renderExpertsList(activeTab)}
            </div>
        );
    };
    
    return (
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden h-full dark:bg-slate-800/50 dark:border-slate-700/80 animate-fade-in">
             <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between dark:bg-slate-800/70 dark:border-b dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-500"><ChatBubbleLeftRightIcon className="h-7 w-7"/></div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Market Voices</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recent picks from top market analysts</p>
                  </div>
                </div>
            </div>
            <div className="p-4 md:p-6">{renderContent()}</div>
        </div>
    );
};