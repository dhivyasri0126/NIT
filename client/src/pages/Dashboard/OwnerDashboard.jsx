import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Percent,
  Coins,
  Package,
  Award,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { StatCard } from '../../components/common/StatCard';
import { COST_BREAKDOWN_DONUT } from '../../data/benchmarkData';

export const OwnerDashboard = () => {
  const { productionRuns, products, orders } = useERP();
  const navigate = useNavigate();

  const currentRun = productionRuns[0];
  const costing = currentRun?.costing;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-primary-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
            Executive Leadership & Profitability
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">
            Managing Director: S. Murugan 👑
          </h2>
          <p className="text-primary-100 text-xs sm:text-sm mt-1 max-w-xl">
            Sri Murukku Foods enterprise profitability analysis, unit economics per packet, and batch margin tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/costing')}
            className="px-4 py-2.5 bg-white text-primary-800 font-bold rounded-xl text-xs hover:bg-primary-50 shadow-md transition-all flex items-center gap-2"
          >
            <Coins className="w-4 h-4" />
            <span>Detailed Costing Sheet</span>
          </button>
        </div>
      </div>

      {/* 4 Unit Economics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cost Per Packet"
          value={`₹${costing?.costPerPacket?.toFixed(2) || '31.14'}`}
          icon={Coins}
          color="purple"
          subtitle="Total batch cost / 188 output"
        />
        <StatCard
          title="Selling Price"
          value={`₹${costing?.sellingPrice?.toFixed(2) || '50.00'}`}
          icon={DollarSign}
          color="blue"
          subtitle="Retail wholesale MRP"
        />
        <StatCard
          title="Profit Per Packet"
          value={`₹${costing?.profitPerPacket?.toFixed(2) || '18.86'}`}
          icon={TrendingUp}
          color="emerald"
          subtitle="Net contribution margin"
        />
        <StatCard
          title="Profit Margin"
          value={`${costing?.profitMarginPercent || '37.7'}%`}
          icon={Percent}
          color="emerald"
          subtitle="Healthy commercial return"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Breakdown Donut Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Manufacturing Cost Component Breakdown (Batch PR-001)
              </h3>
              <p className="text-xs text-slate-400">
                Total batch manufacturing cost: ₹5,855.00 for 188 packets
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
              37.7% Margin
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={COST_BREAKDOWN_DONUT}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
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

            {/* Legend & Amounts */}
            <div className="space-y-2 text-xs">
              {COST_BREAKDOWN_DONUT.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-white">₹{item.amount}</span>
                    <span className="text-slate-400 font-semibold">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business Performance & Stock Alerts (1 col) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Executive Highlights
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200/60 dark:border-primary-900/40">
                <div className="font-bold text-primary-900 dark:text-primary-200">
                  Murukku (200 g) Benchmark
                </div>
                <div className="text-primary-700 dark:text-primary-300 mt-1">
                  Selling at ₹50.00 yields ₹18.86 profit per packet. At 188 output, total batch profit is ₹3,545.68.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
                <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Carton Reorder Warning</span>
                </div>
                <div className="text-amber-700 dark:text-amber-300 mt-1">
                  Carton stock has dropped to 21 pcs (reorder level is 25 pcs). Reorder from Corrugated Boxes Ltd.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
