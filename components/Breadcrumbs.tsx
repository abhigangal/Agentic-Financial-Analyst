import React, { useMemo } from 'react';
import { StockCategory } from '../types';

interface BreadcrumbsProps {
  categories: StockCategory[];
  currentSymbol: string | null;
  onNavigateHome: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ categories, currentSymbol, onNavigateHome }) => {
    const breadcrumbPath = useMemo(() => {
        if (!currentSymbol) {
            return [];
        }

        const myStocksCategory = categories.find(c => c.name === 'My Stocks');
        const isCustom = myStocksCategory?.symbols.includes(currentSymbol);

        let category: StockCategory | undefined;
        if (isCustom) {
            category = myStocksCategory;
        } else {
            category = categories.find(cat => cat.symbols.includes(currentSymbol));
        }

        const path = [
            { name: 'Home', action: onNavigateHome }
        ];

        if (category) {
             path.push({ name: category.name, action: () => {} }); // Not clickable for now
        }
        
        path.push({ name: currentSymbol, action: () => {} });

        return path;

    }, [currentSymbol, categories, onNavigateHome]);

    if (breadcrumbPath.length === 0) {
        return <div className="h-9"></div>; // Placeholder to prevent layout shift
    }

    return (
        <nav className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2 h-5" aria-label="Breadcrumb">
           {breadcrumbPath.map((item, index) => (
               <React.Fragment key={item.name}>
                   {index > 0 && <span className="text-gray-400 dark:text-gray-600">/</span>}
                   <button 
                     onClick={item.action}
                     className={`transition-colors disabled:cursor-default ${index === breadcrumbPath.length - 1 ? 'font-semibold text-slate-800 dark:text-slate-100' : 'hover:text-slate-800 dark:hover:text-slate-100'}`}
                     disabled={!item.action || index === breadcrumbPath.length - 1}
                   >
                       {item.name}
                   </button>
               </React.Fragment>
           ))}
        </nav>
    );
};