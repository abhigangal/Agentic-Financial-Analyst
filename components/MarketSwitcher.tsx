import React from 'react';
import { marketConfigs } from '../data/markets';

interface MarketSwitcherProps {
  selectedMarketId: string;
  onMarketChange: (marketId: string) => void;
}

export const MarketSwitcher: React.FC<MarketSwitcherProps> = ({ selectedMarketId, onMarketChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-lg dark:bg-slate-800">
      {Object.values(marketConfigs).map(market => (
        <button
          key={market.id}
          onClick={() => onMarketChange(market.id)}
          className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${
            selectedMarketId === market.id
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-slate-100'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
          data-test={`market-switcher-${market.id}`}
        >
          {market.name}
        </button>
      ))}
    </div>
  );
};

const currencies = [
    { symbol: '₹', name: 'INR' },
    { symbol: '$', name: 'USD' },
    { symbol: '£', name: 'GBP' },
];

interface CurrencySwitcherProps {
  selectedCurrency: string;
  onCurrencyChange: (symbol: string) => void;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({ selectedCurrency, onCurrencyChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-lg dark:bg-slate-800">
      {currencies.map(currency => (
        <button
          key={currency.name}
          onClick={() => onCurrencyChange(currency.symbol)}
          className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${
            selectedCurrency === currency.symbol
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-slate-100'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
          data-test={`currency-switcher-${currency.name}`}
        >
          {currency.symbol}
        </button>
      ))}
    </div>
  );
};