import React from 'react';
import { FinancialAdvisorIcon } from './IconComponents';
import { MarketSwitcher, CurrencySwitcher } from './MarketSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  selectedMarketId: string;
  onMarketChange: (marketId: string) => void;
  selectedCurrency: string;
  onCurrencyChange: (symbol: string) => void;
}


export const Header: React.FC<HeaderProps> = ({ selectedMarketId, onMarketChange, selectedCurrency, onCurrencyChange }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="text-blue-500">
             <FinancialAdvisorIcon className="h-9 w-9" />
          </div>
          <div title="Agentic Financial Analyst" className="text-3xl font-bold tracking-tighter text-slate-900 flex items-center dark:text-slate-100">
            A<span className="text-gray-400 dark:text-gray-600">G</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
            <MarketSwitcher selectedMarketId={selectedMarketId} onMarketChange={onMarketChange} />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
            <CurrencySwitcher selectedCurrency={selectedCurrency} onCurrencyChange={onCurrencyChange} />
            <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};