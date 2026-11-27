import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  FileText,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Check,
  X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { StatusBadge } from '../../components/common/StatusBadge';

export const OrderList = () => {
  const { orders, approveOrder, rejectOrder, generateInvoiceForOrder, dispatchOrder, products, currentUser } = useERP();
  const canManageOrders = currentUser?.id === 'admin' || currentUser?.id === 'owner';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Tab counts
  const tabs = [
    { label: 'All Orders', value: 'All', count: orders.length },
    { label: 'Submitted', value: 'Submitted', count: orders.filter(o => o.status === 'Submitted').length },
    { label: 'Approved', value: 'Approved', count: orders.filter(o => o.status === 'Approved').length },
    { label: 'Invoiced', value: 'Invoiced', count: orders.filter(o => o.status === 'Invoiced').length },
    { label: 'Dispatched', value: 'Dispatched', count: orders.filter(o => o.status === 'Dispatched').length },
    { label: 'Insufficient Stock', value: 'Insufficient Stock', count: orders.filter(o => o.status === 'Insufficient Stock').length },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleInvoice = (orderId) => {
    const inv = generateInvoiceForOrder(orderId);
    if (inv) {
      navigate('/sales/invoices');
    }
  };

  return (
    <Layout
      breadcrumbs={['Sales & Orders', 'Orders']}
      title="Sales Orders"
      subtitle="Manage, verify, approve, and track retailer customer orders"
      actions={
        <button
          onClick={() => navigate('/sales/create-order')}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Order</span>
        </button>
      }
    >
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-6">
        {/* Tabs & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.value
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order no., customer..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-primary-600 dark:text-primary-400">
                      {order.orderNo}
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400">{order.customerAddress || 'Tamil Nadu'}</div>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      {order.items?.map(it => it.productName).join(', ') || 'Murukku (200 g)'}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0}
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                      ₹{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-center">
                      <StatusBadge status={order.status} />
                      {order.status === 'Insufficient Stock' && (
                        <div className="text-[10px] text-rose-500 font-bold mt-0.5">
                          Shortage: {order.shortageQuantity} pkts
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600 transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Order Verification & Action Buttons (Admin / Owner only) */}
                        {canManageOrders && order.status === 'Submitted' && (
                          <>
                            <button
                              onClick={() => approveOrder(order.id)}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 transition-colors"
                              title="Approve Order"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectOrder(order.id)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 transition-colors"
                              title="Reject Order"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {canManageOrders && order.status === 'Approved' && (
                          <button
                            onClick={() => handleInvoice(order.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-all"
                            title="Generate GST Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        )}

                        {canManageOrders && order.status === 'Invoiced' && (
                          <button
                            onClick={() => dispatchOrder(order.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-all"
                            title="Dispatch Goods"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {order.status === 'Dispatched' && (
                          <button
                            onClick={() => navigate('/sales/invoices')}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600 transition-colors"
                            title="View Invoice (INV-0015)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Order Details: {selectedOrder.orderNo}
                </h3>
                <p className="text-xs text-slate-400">Date: {selectedOrder.orderDate}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <div>
                  <span className="text-slate-400">Customer:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-100">{selectedOrder.customerName}</div>
                  <div className="text-slate-500">{selectedOrder.customerAddress}</div>
                </div>
                <div>
                  <span className="text-slate-400">GSTIN:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-100">{selectedOrder.customerGstin || 'Unregistered'}</div>
                  <span className="text-slate-400 mt-2 block">Status:</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>

              {selectedOrder.status === 'Insufficient Stock' && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Stock Shortage:</span> Ordered 120 packets, but available warehouse stock is only {selectedOrder.availableStock || 88} packets (Shortage of {selectedOrder.shortageQuantity} packets).
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Item Breakdown:</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400">
                      <tr>
                        <th className="p-2.5">Product</th>
                        <th className="p-2.5 text-right">Qty</th>
                        <th className="p-2.5 text-right">Rate</th>
                        <th className="p-2.5 text-right">Taxable</th>
                        <th className="p-2.5 text-right">GST</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedOrder.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium">{it.productName}</td>
                          <td className="p-2.5 text-right">{it.quantity}</td>
                          <td className="p-2.5 text-right">₹{it.rate}</td>
                          <td className="p-2.5 text-right">₹{it.taxable}</td>
                          <td className="p-2.5 text-right">₹{(it.cgstAmount || 0) + (it.sgstAmount || 0)}</td>
                          <td className="p-2.5 text-right font-bold">₹{it.totalAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex justify-between items-center text-sm font-bold">
                <span>Total Amount:</span>
                <span className="text-primary-600 dark:text-primary-400">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
