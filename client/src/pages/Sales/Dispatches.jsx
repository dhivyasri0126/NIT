import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, Clock, MapPin, Package, FileText, ArrowRight } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { StatusBadge } from '../../components/common/StatusBadge';

export const Dispatches = () => {
  const { orders } = useERP();
  const navigate = useNavigate();

  const dispatchedOrders = orders.filter(o => o.status === 'Dispatched');

  return (
    <Layout
      breadcrumbs={['Sales & Orders', 'Dispatches']}
      title="Warehouse Dispatches & Gate Pass"
      subtitle="Track completed shipments and outgoing vehicle delivery passes"
    >
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Fulfilled Outgoing Dispatches
            </h3>
            <p className="text-xs text-slate-400">
              Goods dispatched from Sri Murukku Foods Thuvakudi unit
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            {dispatchedOrders.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dispatchedOrders.map(order => (
            <div
              key={order.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-primary-600 dark:text-primary-400">
                  {order.orderNo}
                </span>
                <StatusBadge status="Dispatched" />
              </div>

              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {order.customerName}
                </div>
                <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customerAddress}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200/60 dark:border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Product & Qty</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {order.items?.[0]?.productName || 'Murukku (200 g)'} × {order.items?.[0]?.quantity || 150} pkts
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Invoice No</div>
                  <div className="font-mono font-bold text-primary-600 dark:text-primary-400">
                    {order.invoiceNo || 'INV-0015'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500">Carrier: Murukku Express Van (TN-45-AB-1234)</span>
                <button
                  onClick={() => navigate('/sales/invoices')}
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View Invoice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
