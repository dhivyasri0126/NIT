import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  PlusCircle,
  Package,
  Users,
  WifiOff,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';

export const SalesmanDashboard = () => {
  const { currentUser, orders, products, customers, isOffline, offlineQueue } = useERP();
  const navigate = useNavigate();

  const myOrders = orders;
  const totalValue = myOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="bg-gradient-to-r from-indigo-700 via-primary-600 to-primary-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
            Field Sales & Mobile Booking
          </span>
          <h2 className="text-2xl font-bold mt-2">
            Welcome, {currentUser.name}! 🚀
          </h2>
          <p className="text-primary-100 text-xs mt-1">
            Book orders on the move, check stock availability, and capture offline orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/sales/mobile-order')}
            className="px-4 py-2.5 bg-amber-400 text-slate-900 font-bold rounded-xl text-xs hover:bg-amber-300 shadow-md transition-all flex items-center gap-2 animate-bounce"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Fast Mobile Order Entry</span>
          </button>
        </div>
      </div>

      {/* Offline Status Alert if offline */}
      {isOffline && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                You are currently in Offline Mode
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400">
                Orders are queued locally ({offlineQueue.length} pending). They will auto-sync once online.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={myOrders.length}
          icon={ShoppingCart}
          color="purple"
          subtitle="All booked orders"
        />
        <StatCard
          title="Total Booking Value"
          value={`₹${totalValue.toLocaleString()}`}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Jan 2025"
        />
        <StatCard
          title="Active Retailers"
          value={customers.length}
          icon={Users}
          color="blue"
          subtitle="In your territory"
        />
        <StatCard
          title="Available Murukku Stock"
          value={`${products.find(p => p.id === 'PROD-001')?.currentStock || 88} pkts`}
          icon={Package}
          color="amber"
          subtitle="Live warehouse stock"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog & Live Stock for Booking (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Live Product Price List & Availability
              </h3>
              <p className="text-xs text-slate-400">
                Verify available quantities before committing retailer delivery dates
              </p>
            </div>
            <button
              onClick={() => navigate('/sales/create-order')}
              className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              + Book Now
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">HSN</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">GST</th>
                  <th className="pb-3 text-right">Live Stock</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-100">
                      {p.name}
                    </td>
                    <td className="py-3 text-slate-400">{p.hsn}</td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹{p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-slate-500">{p.gstRate}%</td>
                    <td className="py-3 text-right font-bold text-primary-600 dark:text-primary-400">
                      {p.currentStock} {p.unit}
                    </td>
                    <td className="py-3 text-center">
                      {p.currentStock > 40 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                          Ready to Ship
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                          Limited Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Route & Outstanding Dues (1 col) */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">
            Customer Directory & Dues
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Check outstanding balances before booking new credit orders
          </p>

          <div className="space-y-3">
            {customers.map(c => (
              <div key={c.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{c.name}</span>
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    Due: ₹{c.outstanding.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {c.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {c.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
