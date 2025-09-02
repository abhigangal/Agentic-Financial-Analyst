import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FinancialAdvisorIcon, SpinnerIcon, UserCircleIcon, LockClosedIcon } from '../IconComponents';

type AuthMode = 'signin' | 'signup';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await login(email);
      } else {
        await signup(email);
      }
      // On success, the App component will automatically transition to the dashboard
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setEmail('');
    setPassword('');
  }

  const title = mode === 'signin' ? 'Sign In' : 'Create Account';
  const buttonText = mode === 'signin' ? 'Sign In' : 'Sign Up';
  const switchModeText = mode === 'signin'
    ? "Don't have an account?"
    : "Already have an account?";
  const switchModeButtonText = mode === 'signin' ? 'Sign Up' : 'Sign In';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center gap-3 mb-6">
            <FinancialAdvisorIcon className="h-10 w-10 text-blue-600 dark:text-blue-500" />
            <div className="text-4xl font-bold tracking-tighter text-slate-900 flex items-center dark:text-slate-100">
                A<span className="text-gray-400 dark:text-gray-600">G</span>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">{title}</h2>
          
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 sr-only">Email</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-gray-100/70 border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                      disabled={isLoading}
                    />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300 sr-only">Password</label>
                <div className="relative">
                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (not validated)"
                      className="w-full bg-gray-100/70 border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                      disabled
                    />
                </div>
                 <p className="text-xs text-slate-400 mt-2 pl-1">Password field is for demonstration and is not stored or validated.</p>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center h-11 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? <SpinnerIcon className="h-5 w-5" /> : buttonText}
              </button>
            </form>
            
            <div className="text-center mt-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {switchModeText}{' '}
                    <button
                        onClick={() => handleModeChange(mode === 'signin' ? 'signup' : 'signin')}
                        className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {switchModeButtonText}
                    </button>
                </p>
            </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="font-bold">Demo Accounts</p>
            <p><span className="font-mono">user@premium.com</span> - Access to all features.</p>
            <p><span className="font-mono">user@free.com</span> - Basic access.</p>
        </div>

      </div>
    </div>
  );
};
