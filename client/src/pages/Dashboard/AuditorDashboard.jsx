import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  DollarSign,
  Receipt,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { exportReportToPDF, exportToCSV } from '../../utils/exportUtils';

export const AuditorDashboard = () => {
  const { invoices, purchases, payments, ageing, customers } = useERP();
  const navigate = useNavigate();

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalCgst = invoices.reduce((sum, i) => sum + i.cgst, 0);
  const totalSgst = invoices.reduce((sum, i) => sum + i.sgst, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.outstandingAmount, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  const handleExportPDF = () => {
    exportReportToPDF({
      title: 'Auditor GST & Sales Summary',
      subtitle: 'Tax compliance and receivable audit for Sri Murukku Foods',
      columns: ['Invoice No', 'Date', 'Customer', 'Taxable (Rs)', 'CGST (Rs)', 'SGST (Rs)', 'Total (Rs)', 'Status'],
      rows: invoices.map(i => [
        i.invoiceNo,
        i.date,
        i.customerName,
        i.taxableValue.toFixed(2),
        i.cgst.toFixed(2),
        i.sgst.toFixed(2),
        i.total.toFixed(2),
        i.status
      ]),
      filename: 'Sri_Murukku_Audit_Summary.pdf'
    });
  };

  const handleExportCSV = () => {
    exportToCSV(
      invoices.map(i => ({
        'Invoice No': i.invoiceNo,
        'Date': i.date,
        'Customer': i.customerName,
        'Taxable': i.taxableValue,
        'CGST': i.cgst,
        'SGST': i.sgst,
        'Total': i.total,
        'Paid': i.paidAmount,
        'Outstanding': i.outstandingAmount,
        'Status': i.status
      })),
      'GST_Sales_Register.csv'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-primary-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
            Statutory Audit & Tax Compliance
          </span>
          <h2 className="text-2xl font-bold mt-2">
            Accountant / Auditor: V. Jayanthi CA 📊
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            GSTIN: 33ABCDE1234F1Z5 | Form GSTR-1, GSTR-3B reconciliation & Purchase Ledger audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoiced (Gross)"
          value={`₹${totalInvoiced.toLocaleString()}`}
          icon={Receipt}
          color="purple"
          subtitle="Taxable + GST"
        />
        <StatCard
          title="Total GST Output Tax"
          value={`₹${(totalCgst + totalSgst).toFixed(2)}`}
          icon={ShieldCheck}
          color="blue"
          subtitle={`CGST: ₹${totalCgst.toFixed(2)} | SGST: ₹${totalSgst.toFixed(2)}`}
        />
        <StatCard
          title="Payment Collections"
          value={`₹${totalCollected.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          subtitle="Realized in bank"
        />
        <StatCard
          title="Outstanding Receivables"
          value={`₹${totalOutstanding.toLocaleString()}`}
          icon={FileText}
          color="rose"
          subtitle="Pending customer collection"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GST Tax Summary Box (1 col) */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            GST Output Tax Summary
          </h3>
          <p className="text-xs text-slate-400">
            Intra-State sales (Tamil Nadu 33) taxed at 5% GST (2.5% CGST + 2.5% SGST)
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Taxable Value (Murukku 150 pkts)</span>
              <span className="font-semibold text-slate-900 dark:text-white">₹7,500.00</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Central GST (CGST @ 2.5%)</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">₹187.50</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>State GST (SGST @ 2.5%)</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">₹187.50</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Integrated GST (IGST @ 5.0%)</span>
              <span className="font-semibold text-slate-400">₹0.00</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white">
              <span>Total Invoice Value</span>
              <span className="text-primary-600 dark:text-primary-400">₹7,875.00</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300">
            ✓ Ready for GSTR-1 e-filing with valid HSN 19059090 classification.
          </div>
        </div>

        {/* Receivables Ageing & Invoices (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Receivables Ageing Analysis
              </h3>
              <p className="text-xs text-slate-400">
                Aging of outstanding customer accounts
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
              Total Due: ₹{totalOutstanding.toLocaleString()}
            </span>
          </div>

          {/* Ageing Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ageing.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-medium">{item.range}</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  ₹{item.amount.toLocaleString()}
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
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

          {/* Recent Invoices Table */}
          <div className="pt-2">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">
              Audited Invoices (INV Register)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2">Invoice No</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2 text-right">Taxable</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-right">Paid</th>
                    <th className="pb-2 text-right">Balance</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-bold text-primary-600 dark:text-primary-400">
                        {inv.invoiceNo}
                      </td>
                      <td className="py-2.5 text-slate-800 dark:text-slate-200">
                        {inv.customerName}
                      </td>
                      <td className="py-2.5 text-right font-medium">₹{inv.taxableValue.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold">₹{inv.total.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-emerald-600 font-semibold">₹{inv.paidAmount.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-rose-600 font-bold">₹{inv.outstandingAmount.toFixed(2)}</td>
                      <td className="py-2.5 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
