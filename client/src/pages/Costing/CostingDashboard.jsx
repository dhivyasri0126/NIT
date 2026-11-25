import React, { useState } from 'react';
import {
  DollarSign,
  PieChart as PieIcon,
  TrendingUp,
  Percent,
  Coins,
  ArrowRight,
  Layers
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { COST_BREAKDOWN_DONUT } from '../../data/benchmarkData';

export const CostingDashboard = () => {
  const { productionRuns } = useERP();
  const [selectedRunId, setSelectedRunId] = useState('PR-001');

  const run = productionRuns.find(r => r.id === selectedRunId) || productionRuns[0];
  const costing = run.costing;

  return (
    <Layout
      breadcrumbs={['Product Costing', 'Cost per Packet']}
      title="Product Costing & Margin Analysis"
      subtitle="Unit economics per good packet produced with ingredient, packaging, and overhead allocations"
    >
      <div className="space-y-6">
        {/* Production Run Selector Bar matching design collage */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Production Run:
            </span>
            <select
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
            >
              {productionRuns.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.productName} - {r.date})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-primary-600 dark:text-primary-400">
            Batch: {run.batchNo} | Date: {run.date}
          </div>
        </div>

        {/* 2-Column Main Costing Grid matching Design Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Table: Cost Components (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Cost Component Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Cost Component</th>
                    <th className="pb-3 text-right pr-2">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pl-2 text-slate-800 dark:text-slate-200">
                      Flour (40 kg × ₹43.125)
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-slate-900 dark:text-white">
                      1,725.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pl-2 text-slate-800 dark:text-slate-200">
                      Cooking Oil (10.5 L × ₹140)
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-slate-900 dark:text-white">
                      1,470.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pl-2 text-slate-800 dark:text-slate-200">
                      Spice Mix (1.2 kg × ₹200)
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-slate-900 dark:text-white">
                      240.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pl-2 text-slate-800 dark:text-slate-200">
                      Pouches (194 × ₹2.50)
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-slate-900 dark:text-white">
                      485.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pl-2 text-slate-800 dark:text-slate-200">
                      Cartons (9 × ₹15)
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-slate-900 dark:text-white">
                      135.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pl-2 text-slate-800 dark:text-slate-200">
                      Labour
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-slate-900 dark:text-white">
                      1,200.00
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pl-2 text-slate-800 dark:text-slate-200">
                      Gas & Power
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-slate-900 dark:text-white">
                      600.00
                    </td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 font-black text-sm">
                    <td className="py-3.5 pl-2 text-slate-900 dark:text-white">
                      Total Production Cost
                    </td>
                    <td className="py-3.5 text-right pr-2 text-primary-600 dark:text-primary-400">
                      ₹5,855.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Cards: Unit Economics & Donut Chart (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Stat Cards matching design collage */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 shadow-card">
                <div className="text-slate-400 font-semibold">Good Packets Produced</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">188</div>
              </div>

              <div className="p-4 rounded-3xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200/60 dark:border-primary-900/40 shadow-card">
                <div className="text-primary-600 dark:text-primary-300 font-semibold">Cost per Packet</div>
                <div className="text-2xl font-black text-primary-700 dark:text-primary-200 mt-1">₹31.14</div>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 shadow-card">
                <div className="text-slate-400 font-semibold">Selling Price</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹50.00</div>
              </div>

              <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 shadow-card">
                <div className="text-emerald-600 font-semibold">Profit / Packet</div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">₹18.86</div>
              </div>
            </div>

            {/* Donut Chart & Legend */}
            <div className="p-5 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Cost Breakdown
                </h4>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  37.7% Margin
                </span>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={COST_BREAKDOWN_DONUT}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {COST_BREAKDOWN_DONUT.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, entry) => [`${val}% (₹${entry.payload.amount})`, entry.payload.name]}
                      contentStyle={{ backgroundColor: '#1E1E38', borderColor: '#2E2E48', borderRadius: '12px', color: '#FFF' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {COST_BREAKDOWN_DONUT.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 dark:text-slate-400 truncate">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
