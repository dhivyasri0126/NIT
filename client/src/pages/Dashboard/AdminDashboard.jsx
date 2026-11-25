import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  Package,
  Boxes,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Plus,
  ShoppingBag,
  Factory,
  Eye,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SALES_TREND } from '../../data/benchmarkData';

export const AdminDashboard = () => {
  const { currentUser, orders, products, materials, productionRuns } = useERP();
  const navigate = useNavigate();

  // Benchmark stats
  const todaysSales = "₹7,875";
  const pendingOrdersCount = orders.filter(o => o.status === 'Submitted' || o.status === 'Insufficient Stock').length;
  const productionOutput = "188 packets";
  const finishedStock = products.find(p => p.id === 'PROD-001')?.currentStock || 88;
  const outstandingAmount = "₹3,875";

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-medium mb-3 backdrop-blur-xs">
            <span>🏭 Order-to-Audit Management System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good Morning, {currentUser?.name}! 👋
          </h2>
          <p className="text-primary-100 text-sm mt-1 max-w-xl">
            Here's what's happening at Sri Murukku Foods today. Production Run PR-001 completed, Dispatch SO-0025 fulfilled.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/create-order')}
            className="px-4 py-2.5 bg-white text-primary-700 font-semibold rounded-xl text-xs hover:bg-primary-50 shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
          <button
            onClick={() => navigate('/production/run')}
            className="px-4 py-2.5 bg-primary-700/60 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs border border-white/20 transition-all flex items-center gap-2"
          >
            <Factory className="w-4 h-4" />
            <span>Production Batch</span>
          </button>
        </div>
      </div>

      {/* 5 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Today's Sales"
          value={todaysSales}
          change="+12.5%"
          isPositive={true}
          icon={TrendingUp}
          color="purple"
          subtitle="Jan 21, 2025"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrdersCount}
          icon={Clock}
          color="amber"
          subtitle="2 awaiting action"
        />
        <StatCard
          title="Production Output"
          value={productionOutput}
          icon={Factory}
          color="emerald"
          subtitle="Batch PR-001 (Murukku)"
        />
        <StatCard
          title="Finished Stock"
          value={`${finishedStock} pkts`}
          icon={Package}
          color="blue"
          subtitle="After SO-0025 dispatch"
        />
        <StatCard
          title="Outstanding"
          value={outstandingAmount}
          icon={CreditCard}
          color="rose"
          subtitle="Retailer A (Partially Paid)"
        />
      </div>

      {/* Charts & Production Flow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Sales Trend
              </h3>
              <p className="text-xs text-slate-400">
                Daily sales value (15 Jan – 21 Jan, ₹0 to ₹10K)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
              ₹7,875 Peak
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D4AFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6D4AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹${val}`, 'Daily Sales']}
                  contentStyle={{ backgroundColor: '#1E1E38', borderColor: '#2E2E48', borderRadius: '12px', color: '#FFF' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#6D4AFF" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Yield & Variance Alerts Box */}
        <div className="space-y-4">
          {/* Yield circular card */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Production Efficiency
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                94% <span className="text-xs font-semibold text-emerald-500">Yield</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Expected 200 pkts → Actual 188 pkts
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" fill="transparent" />
                <circle cx="40" cy="40" r="32" stroke="#16A34A" strokeWidth="6" strokeDasharray="201" strokeDashoffset="12" strokeLinecap="round" fill="transparent" />
              </svg>
              <span className="absolute text-sm font-bold text-slate-900 dark:text-white">94%</span>
            </div>
          </div>

          {/* Variance Alerts Box */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Variance Alerts (&gt; 3% threshold)</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-500 text-base">💧</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Cooking Oil</div>
                    <div className="text-[11px] text-slate-500">Planned: 10.0 L | Actual: 10.5 L</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  +5.0%
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-rose-500 text-base">📉</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Yield (Output)</div>
                    <div className="text-[11px] text-slate-500">Expected: 200 | Good: 188 pkts</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  -6.0%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Flow Stepper */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
          Order-to-Audit Production Flow
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { step: '1', title: 'Purchase', desc: 'Flour 60 kg (PO-001)', icon: '📦', done: true },
            { step: '2', title: 'Issue', desc: 'Ingredients Issued', icon: '⚖️', done: true },
            { step: '3', title: 'Production Run', desc: 'Batch PR-001 (188 pkts)', icon: '⚙️', done: true },
            { step: '4', title: 'Finished Goods', desc: 'Stock Added (238 pkts)', icon: '🏷️', done: true },
            { step: '5', title: 'Dispatch', desc: '150 pkts to Retailer A', icon: '🚚', done: true },
          ].map((item, idx) => (
            <div key={idx} className="relative p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{item.icon}</span>
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                  ✓
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Sales Orders
            </h3>
            <p className="text-xs text-slate-400">
              Live orders status and invoice dispatch status
            </p>
          </div>
          <button
            onClick={() => navigate('/sales/orders')}
            className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Order No.</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Products</th>
                <th className="pb-3 text-right">Quantity</th>
                <th className="pb-3 text-right">Amount (₹)</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.slice(0, 5).map(o => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-primary-600 dark:text-primary-400">
                    {o.orderNo}
                  </td>
                  <td className="py-3.5 font-medium text-slate-800 dark:text-slate-200">
                    {o.customerName}
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-400">
                    {o.items?.[0]?.productName || 'Murukku (200 g)'}
                  </td>
                  <td className="py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                    {o.items?.[0]?.quantity || 150}
                  </td>
                  <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                    ₹{o.totalAmount?.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-center">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate('/sales/orders')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600"
                        title="View Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate('/sales/invoices')}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600"
                        title="View Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
