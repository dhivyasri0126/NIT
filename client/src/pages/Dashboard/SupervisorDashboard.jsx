import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Boxes,
  Plus,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';

export const SupervisorDashboard = () => {
  const { productionRuns, materials, bom } = useERP();
  const navigate = useNavigate();

  const currentRun = productionRuns[0]; // PR-001

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-primary-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
            Shop Floor & Production Control
          </span>
          <h2 className="text-2xl font-bold mt-2">
            Supervisor Station: M. Selvam ⚙️
          </h2>
          <p className="text-teal-100 text-xs mt-1">
            Batch PR-001 Complete. Monitor ingredient consumption, wastage, and variance alerts.
          </p>
        </div>

        <button
          onClick={() => navigate('/production/run')}
          className="px-4 py-2.5 bg-white text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-50 shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Production Batch Entry</span>
        </button>
      </div>

      {/* Benchmark Variance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Planned Output"
          value="200 packets"
          icon={Layers}
          color="purple"
          subtitle="BOM Standard Batch"
        />
        <StatCard
          title="Actual Good Output"
          value={`${currentRun.actualOutput} packets`}
          icon={Factory}
          color="emerald"
          subtitle="Packaged & Sealed"
        />
        <StatCard
          title="Yield Variance"
          value={`${currentRun.yieldVariancePercent}%`}
          change="-6.0%"
          isPositive={false}
          icon={TrendingDown}
          color="rose"
          subtitle="Below 200 target"
        />
        <StatCard
          title="Pouch Wastage"
          value={`${currentRun.damagedPouches} packets`}
          icon={AlertTriangle}
          color="amber"
          subtitle="Damaged sealing pouches"
        />
      </div>

      {/* Planned vs Actual Material Consumption Table (The core evaluation table!) */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Variance &gt; 3% Highlighted in Red</span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Batch PR-001: Planned vs Actual Material Consumption
            </h3>
            <p className="text-xs text-slate-400">
              Product: Murukku (200 g) | Batch No: BATCH-001 | Date: 21 Jan 2025
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Cartons Used: {currentRun.cartonsUsed}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Ingredient / Material</th>
                <th className="pb-3 text-right">Planned Qty</th>
                <th className="pb-3 text-right">Actual Qty</th>
                <th className="pb-3 text-right">Difference</th>
                <th className="pb-3 text-right">Variance %</th>
                <th className="pb-3 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {currentRun.materialsConsumed.map((item, idx) => {
                const isAlert = Math.abs(item.variancePercent) > 3.0;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isAlert
                        ? 'bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="py-3.5 pl-2 font-bold flex items-center gap-2">
                      {isAlert && <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse flex-shrink-0" />}
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3.5 text-right font-semibold">
                      {item.plannedQty} {item.unit}
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {item.actualQty} {item.unit}
                    </td>
                    <td className={`py-3.5 text-right font-bold ${item.difference > 0 ? 'text-rose-600' : item.difference < 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {item.difference > 0 ? `+${item.difference}` : item.difference} {item.unit}
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                          isAlert
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {item.variancePercent > 0 ? `+${item.variancePercent}%` : `${item.variancePercent}%`}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      {isAlert ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                          Variance Warning
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                          Normal Standard
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Supervisor Observation */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
          <span className="font-bold">Supervisor Note:</span> {currentRun.notes} (Actual cooking oil consumed: 10.5 L vs 10.0 L standard, resulting in +5.0% variance).
        </div>
      </div>

      {/* Raw Material Inventory Available for Next Batch */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
          Closing Stock Available for Next Production Run
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Inventory remaining in warehouse after PO-001 receipt and PR-001 batch issue
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {materials.map(m => (
            <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{m.name}</div>
              <div className="text-lg font-black text-primary-600 dark:text-primary-400 mt-1">
                {m.closingStock} <span className="text-xs font-normal text-slate-400">{m.unit}</span>
              </div>
              <div className="mt-2">
                <StatusBadge status={m.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
