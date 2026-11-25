import React, { useState } from 'react';
import {
  Receipt,
  CreditCard,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';

export const PaymentsReceivables = () => {
  const { invoices, payments, recordPayment, customers, ageing } = useERP();
  const [activeTab, setActiveTab] = useState('Receivables');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvNo, setSelectedInvNo] = useState(invoices[0]?.invoiceNo || 'INV-0015');
  const [amountPaid, setAmountPaid] = useState(3875);

  const totalInvoicesVal = invoices.reduce((s, i) => s + i.total, 0);
  const totalReceivedVal = payments.reduce((s, p) => s + p.amountPaid, 0);
  const totalOutstandingVal = invoices.reduce((s, i) => s + i.outstandingAmount, 0);

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const inv = invoices.find(i => i.invoiceNo === selectedInvNo);
    if (!inv) return;

    recordPayment({
      invoiceNo: inv.invoiceNo,
      customerName: inv.customerName,
      amountPaid: Number(amountPaid),
      paymentMode: 'Bank Transfer / UPI',
      referenceNo: `PAY-TXN-${Date.now().toString().slice(-4)}`,
    });

    setShowPayModal(false);
  };

  return (
    <Layout
      breadcrumbs={['Payments & Receivables', 'Receivables Ledger']}
      title="Payments & Customer Receivables"
      subtitle="Track customer credit limits, invoices, collections, and ageing analysis"
      actions={
        <button
          onClick={() => setShowPayModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <CreditCard className="w-4 h-4" />
          <span>Record Collection Entry</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* 4 Stat Cards matching design collage */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Invoices"
            value={`₹${totalInvoicesVal.toLocaleString()}`}
            icon={Receipt}
            color="amber"
            subtitle="Gross billed amount"
          />
          <StatCard
            title="Amount Received"
            value={`₹${totalReceivedVal.toLocaleString()}`}
            icon={CheckCircle2}
            color="emerald"
            subtitle="Cleared collections"
          />
          <StatCard
            title="Outstanding"
            value={`₹${totalOutstandingVal.toLocaleString()}`}
            icon={CreditCard}
            color="rose"
            subtitle="Current active balance"
          />
          <StatCard
            title="Overdue"
            value="₹0"
            icon={AlertTriangle}
            color="purple"
            subtitle="Beyond payment term"
          />
        </div>

        {/* Tab navigation: Receivables | Payments | Customer Dues | Ageing */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 overflow-x-auto">
            {['Receivables', 'Payments', 'Customer Dues', 'Ageing'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === t
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 1. Receivables Table matching Design Collage */}
          {activeTab === 'Receivables' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Invoice No.</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3 text-right">Invoice Amt (₹)</th>
                      <th className="pb-3 text-right">Paid (₹)</th>
                      <th className="pb-3 text-right">Outstanding (₹)</th>
                      <th className="pb-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 pl-2 font-bold text-primary-600 dark:text-primary-400">
                          {inv.invoiceNo}
                        </td>
                        <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                          {inv.customerName}
                        </td>
                        <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                          {inv.total.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-right font-semibold text-emerald-600">
                          {inv.paidAmount.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-right font-bold text-rose-600">
                          {inv.outstandingAmount.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Receivables Ageing Bars Section matching Design Collage */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Receivables Ageing
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  {ageing.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">{item.range}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Payments History Tab */}
          {activeTab === 'Payments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Receipt No</th>
                    <th className="pb-3">Invoice Ref</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount Paid (₹)</th>
                    <th className="pb-3">Payment Mode</th>
                    <th className="pb-3">Reference No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 pl-2 font-bold text-primary-600">{p.receiptNo}</td>
                      <td className="py-3 font-mono">{p.invoiceNo}</td>
                      <td className="py-3 font-semibold">{p.customerName}</td>
                      <td className="py-3 text-slate-500">{p.date}</td>
                      <td className="py-3 text-right font-black text-emerald-600 text-sm">₹{p.amountPaid.toFixed(2)}</td>
                      <td className="py-3 text-slate-600">{p.paymentMode}</td>
                      <td className="py-3 font-mono text-[11px] text-slate-400">{p.referenceNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Customer Dues Tab */}
          {activeTab === 'Customer Dues' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Customer Name</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3 text-right">Credit Limit</th>
                    <th className="pb-3 text-right">Outstanding Due</th>
                    <th className="pb-3 text-right">Available Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {customers.map(c => {
                    const availCredit = c.creditLimit - c.outstanding;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 font-bold text-slate-800 dark:text-slate-100">{c.name}</td>
                        <td className="py-3 text-slate-500">{c.city}</td>
                        <td className="py-3 text-right">₹{c.creditLimit.toLocaleString()}</td>
                        <td className="py-3 text-right font-black text-rose-600 text-sm">₹{c.outstanding.toLocaleString()}</td>
                        <td className="py-3 text-right font-semibold text-emerald-600">₹{availCredit.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Ageing Tab */}
          {activeTab === 'Ageing' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Debtor Aging Analysis</h4>
              <div className="space-y-3">
                {ageing.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item.range}</span>
                      <span>₹{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: item.amount > 0 ? '100%' : '0%',
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Dialog */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleRecordPayment} className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Record Customer Payment
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Invoice *</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  value={selectedInvNo}
                  onChange={(e) => setSelectedInvNo(e.target.value)}
                >
                  {invoices.map(i => (
                    <option key={i.id} value={i.invoiceNo}>
                      {i.invoiceNo} - {i.customerName} (Due: ₹{i.outstandingAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Amount Received (₹) *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Save Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};
