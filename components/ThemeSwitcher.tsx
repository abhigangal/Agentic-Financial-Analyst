import React from 'react';
import { useTheme } from '../ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from './IconComponents';

const themeOptions = [
  { name: 'Light', value: 'light', icon: <SunIcon className="w-5 h-5" /> },
  { name: 'Dark', value: 'dark', icon: <MoonIcon className="w-5 h-5" /> },
  { name: 'System', value: 'system', icon: <ComputerDesktopIcon className="w-5 h-5" /> },
];

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-lg dark:bg-slate-800">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value as any)}
          className={`flex items-center justify-center gap-2 w-full px-2 py-1 sm:px-2.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
            theme === option.value
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900/70 dark:text-slate-100'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50'
          }`}
          aria-label={`Switch to ${option.name} theme`}
          title={`Switch to ${option.name} theme`}
          data-test={`theme-switcher-${option.value}`}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.name}</span>
        </button>
      ))}
    </div>
  );
};