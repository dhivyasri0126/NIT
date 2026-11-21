import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({ title, value, change, isPositive, icon: Icon, color = "purple", subtitle }) => {
  const colorMap = {
    purple: {
      bg: 'bg-primary-50 dark:bg-primary-950/30',
      text: 'text-primary-600 dark:text-primary-400',
      border: 'border-primary-100 dark:border-primary-900/50',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/50',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/50',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/50',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/50',
    },
  };

  const scheme = colorMap[color] || colorMap.purple;

  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
              isPositive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
