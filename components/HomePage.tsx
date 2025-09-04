import React from 'react';
import { StockExplorer } from './StockExplorer';
import { StockCategory, Expert, User } from '../types';
import { AnalysisCacheItem } from '../../App';
import { Tabs } from './Tabs';
import { MarketVoices } from './MarketVoices';
import { ClipboardDocumentListIcon, ChatBubbleLeftRightIcon } from './IconComponents';

interface HomePageProps {
    categories: StockCategory[];
    currentSymbol: string | null;
    onSelectStock: (symbol: string) => void;
    onAddStock: (symbol: string) => void;
    onRemoveStock: (symbol: string) => void;
    isAdding: boolean;
    addError: string | null;
    onClearAddError: () => void;
    disabled: boolean;
    analysisCache: Record<string, AnalysisCacheItem>;
    marketName: string;
    experts: Expert[];
}

export const HomePage: React.FC<HomePageProps> = (props) => {
    const user: User = { email: 'demo@premium.com', role: 'premium' };
    const TABS = {
        EXPLORER: 'Stock Explorer',
        VOICES: 'Expert Opinions',
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight dark:text-slate-50">Financial Research Lab</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                    Your hub for AI-driven stock analysis and market insights.
                </p>
            </div>
            
            <Tabs.Group defaultTab={TABS.EXPLORER}>
                <Tabs.List>
                    <Tabs.Tab id={TABS.EXPLORER} data-test="tab-stock-explorer">
                        <div className="flex items-center gap-2"><ClipboardDocumentListIcon className="h-5 w-5" /> {TABS.EXPLORER}</div>
                    </Tabs.Tab>
                    <Tabs.Tab id={TABS.VOICES} data-test="tab-expert-opinions">
                        <div className="flex items-center gap-2"><ChatBubbleLeftRightIcon className="h-5 w-5" /> {TABS.VOICES}</div>
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panels>
                    <Tabs.Panel id={TABS.EXPLORER}>
                        <StockExplorer {...props} />
                    </Tabs.Panel>
                    <Tabs.Panel id={TABS.VOICES}>
                        <MarketVoices 
                            user={user}
                            experts={props.experts}
                            marketName={props.marketName}
                            onSelectStock={props.onSelectStock}
                            disabled={props.disabled}
                        />
                    </Tabs.Panel>
                </Tabs.Panels>
            </Tabs.Group>
        </div>
    );
};
