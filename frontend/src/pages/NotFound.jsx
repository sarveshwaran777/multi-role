import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 grid-bg text-center relative">
      <div className="absolute top-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 glass-panel p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-glass-light dark:shadow-glass-dark relative z-10">
        <div className="flex justify-center">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <ShieldAlert className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold text-slate-850 dark:text-slate-100">404</h2>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">Resource Not Located</p>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
            The destination URL does not exist or your access credentials lack the permissions needed to load it.
          </p>
        </div>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 justify-center w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
