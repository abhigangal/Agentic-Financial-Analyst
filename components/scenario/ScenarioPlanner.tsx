import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ScenarioMessage } from '../../types';
import { startScenarioChat } from '../../services/geminiService';
import { PlayCircleIcon, SpinnerIcon } from '../IconComponents';

interface ScenarioPlannerProps {
  stockName: string;
  financialSummary: string;
}

export const ScenarioPlanner: React.FC<ScenarioPlannerProps> = ({ stockName, financialSummary }) => {
  const [messages, setMessages] = useState<ScenarioMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<null | HTMLInputElement>(null);

  const stockContext = `Company: ${stockName}. Overview: ${financialSummary}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStart = async () => {
    if (isLoading) return;
    setHasStarted(true);
    setIsLoading(true);
    setError(null);
    try {
        const chatInstance = await startScenarioChat(stockContext);
        setChat(chatInstance);
        setMessages([{ role: 'model', content: `Ready for scenario planning for **${stockName}**. What's on your mind? For example: "What if oil prices increase by 20%?"` }]);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to initialize the scenario planner. Please try again.";
        setError(message);
    } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) return;

    const newUserMessage: ScenarioMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage, { role: 'model', content: '', isLoading: true }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const stream = await chat.sendMessageStream({ message: input });
      let currentResponse = '';
      
      for await (const chunk of stream) {
        currentResponse += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
                lastMessage.content = currentResponse;
            }
            return newMessages;
        });
      }

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
            lastMessage.isLoading = false;
        }
        return newMessages;
    });

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred while fetching the response.';
      setError(errorMessage);
       setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
            lastMessage.content = `Error: ${errorMessage}`;
            lastMessage.isLoading = false;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const renderMessageContent = (content: string) => {
    // A simple markdown-like renderer for bold and newlines
    const htmlContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>')
      .replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  if (!hasStarted) {
    return (
        <div className="text-center py-6 flex flex-col items-center">
            <button 
                onClick={handleStart} 
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors duration-200 disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                data-test="start-scenario-planner-button"
            >
                {isLoading ? <SpinnerIcon className="h-5 w-5" /> : <PlayCircleIcon className="h-5 w-5" />}
                <span>{isLoading ? 'Initializing...' : 'Start Planning'}</span>
            </button>
            <p className="text-xs text-slate-500 mt-3 dark:text-slate-400 max-w-xs">Ask hypothetical questions to explore potential impacts on the stock.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {msg.isLoading ? <SpinnerIcon className="h-5 w-5" /> : renderMessageContent(msg.content)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a what-if question..."
            className="flex-1 bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 text-slate-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
            disabled={isLoading}
            data-test="scenario-planner-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            data-test="scenario-planner-send-button"
          >
            {isLoading ? <SpinnerIcon /> : 'Send'}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};