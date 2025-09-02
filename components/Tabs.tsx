import React, { useState, createContext, useContext, ReactNode, useMemo } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('This component must be used within a <Tabs.Group> component.');
  }
  return context;
};

interface TabGroupProps {
  children: ReactNode;
  defaultTab?: string;
}

const Group: React.FC<TabGroupProps> = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || '');

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
};


interface TabListProps {
    children: ReactNode;
}

const List: React.FC<TabListProps> = ({ children }) => {
    const { setActiveTab, activeTab } = useTabs();

    // Set the first tab as active by default if no default is provided
    React.useEffect(() => {
        if (!activeTab) {
            const firstTab = React.Children.toArray(children)[0];
            if (React.isValidElement<{ id: string }>(firstTab) && firstTab.props.id) {
                setActiveTab(firstTab.props.id);
            }
        }
    }, [activeTab, children, setActiveTab]);
    
    return (
        <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
            <nav className="-mb-px flex space-x-4 overflow-x-auto scrollbar-hide" aria-label="Tabs" role="tablist">
                {children}
            </nav>
        </div>
    );
};

interface TabProps {
    id: string;
    children: ReactNode;
    'data-test'?: string;
}

const Tab: React.FC<TabProps> = ({ id, children, ...rest }) => {
    const { activeTab, setActiveTab } = useTabs();
    const isActive = activeTab === id;
    const dataTestId = rest['data-test'];

    return (
        <button
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            role="tab"
            type="button"
            aria-controls={`panel-${id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                isActive
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
            }`}
            data-test={dataTestId}
        >
            {children}
        </button>
    );
};


interface PanelsProps {
    children: ReactNode;
}

const Panels: React.FC<PanelsProps> = ({ children }) => {
    return <div>{children}</div>;
};

interface PanelProps {
    id: string;
    children: ReactNode;
}

const Panel: React.FC<PanelProps> = ({ id, children }) => {
    const { activeTab } = useTabs();
    if (activeTab !== id) {
        return null;
    }

    return (
        <div 
            id={`panel-${id}`}
            role="tabpanel" 
            tabIndex={0}
            aria-labelledby={`tab-${id}`}
            className="focus:outline-none"
        >
            {children}
        </div>
    );
};

export const Tabs = {
    Group,
    List,
    Tab,
    Panels,
    Panel,
};