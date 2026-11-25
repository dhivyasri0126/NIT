import React, { useState } from 'react';
import {
  FileText,
  Receipt,
  ShoppingCart,
  Boxes,
  Factory,
  BarChart3,
  Coins,
  CreditCard,
  Download,
  Calendar,
  FileSpreadsheet,
  Printer,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { exportReportToPDF, exportToCSV } from '../../utils/exportUtils';

export const ReportsAudit = () => {
  const { orders, invoices, purchases, materials, productionRuns, customers } = useERP();
  const [selectedReport, setSelectedReport] = useState('sales');

  const reportCards = [
    {
      id: 'sales',
      title: 'Sales Register',
      desc: 'Sales with GST details',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    },
    {
      id: 'gst',
      title: 'GST Summary',
      desc: 'Tax-wise summary',
      icon: Receipt,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
    },
    {
      id: 'purchase',
      title: 'Purchase Register',
      desc: 'Supplier purchases',
      icon: ShoppingCart,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    },
    {
      id: 'stock',
      title: 'Stock Reports',
      desc: 'Current & movement stock',
      icon: Boxes,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    },
    {
      id: 'production',
      title: 'Production Report',
      desc: 'Output, yield & variance',
      icon: Factory,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    },
    {
      id: 'consumption',
      title: 'Consumption Report',
      desc: 'Planned vs Actual',
      icon: BarChart3,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900',
    },
    {
      id: 'costing',
      title: 'Costing Report',
      desc: 'Product-wise cost',
      icon: Coins,
      color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border-violet-200 dark:border-violet-900',
    },
    {
      id: 'receivables',
      title: 'Receivables Report',
      desc: 'Outstanding & ageing',
      icon: CreditCard,
      color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    },
  ];

  const handleExportPDF = () => {
    if (selectedReport === 'sales' || selectedReport === 'gst') {
      exportReportToPDF({
        title: 'GST Sales & Tax Register',
        subtitle: 'Official tax compliance statement for Sri Murukku Foods',
        columns: ['Invoice No', 'Date', 'Customer', 'Taxable (Rs)', 'CGST', 'SGST', 'Total (Rs)', 'Status'],
        rows: invoices.map(i => [i.invoiceNo, i.date, i.customerName, i.taxableValue.toFixed(2), i.cgst.toFixed(2), i.sgst.toFixed(2), i.total.toFixed(2), i.status]),
        filename: 'Sales_Register_GST.pdf',
      });
    } else if (selectedReport === 'consumption') {
      const run = productionRuns[0];
      exportReportToPDF({
        title: `Consumption Audit Report – Batch ${run.batchNo}`,
        subtitle: `Product: ${run.productName} | Output: ${run.actualOutput} pkts (Yield Var: ${run.yieldVariancePercent}%)`,
        columns: ['Material', 'Planned', 'Actual', 'Difference', 'Variance %'],
        rows: run.materialsConsumed.map(m => [m.name, `${m.plannedQty} ${m.unit}`, `${m.actualQty} ${m.unit}`, `${m.difference} ${m.unit}`, `${m.variancePercent}%`]),
        filename: 'Material_Consumption_Audit.pdf',
      });
    } else {
      exportReportToPDF({
        title: 'Stock Valuation & Inventory Audit',
        subtitle: 'Warehouse position after production runs and sales fulfillment',
        columns: ['Material Name', 'Category', 'Closing Stock', 'Unit', 'Status'],
        rows: materials.map(m => [m.name, m.category, m.closingStock.toFixed(1), m.unit, m.status]),
        filename: 'Stock_Audit_Report.pdf',
      });
    }
  };

  const handleExportCSV = () => {
    exportToCSV(
      invoices.map(i => ({
        InvoiceNo: i.invoiceNo,
        Date: i.date,
        Customer: i.customerName,
        Taxable: i.taxableValue,
        CGST: i.cgst,
        SGST: i.sgst,
        Total: i.total,
        Status: i.status
      })),
      'Audit_Report.csv'
    );
  };

  return (
    <Layout
      breadcrumbs={['Reports & Audit', 'Audit Center']}
      title="Reports & Statutory Audit Center"
      subtitle="Generate, preview, and download compliance reports for food manufacturing audits"
    >
      <div className="space-y-6">
        {/* Date Filter Bar matching Design Collage */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>Audit Period: Jan 01, 2025 – Jan 31, 2025</span>
          </div>

          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            Audited & Reconciled
          </span>
        </div>

        {/* 8 Report Cards matching Design Collage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map(card => {
            const Icon = card.icon;
            const isSelected = selectedReport === card.id;

            return (
              <div
                key={card.id}
                onClick={() => setSelectedReport(card.id)}
                className={`p-5 rounded-3xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-primary-50/50 dark:bg-primary-950/40 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                    : 'bg-white dark:bg-surface-dark border-slate-200/80 dark:border-slate-800 hover:shadow-card'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border mb-3 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Preview of Selected Report */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white capitalize">
              Live Preview: {reportCards.find(r => r.id === selectedReport)?.title}
            </h3>
            <span className="text-xs text-slate-400">NIT Benchmark Data</span>
          </div>

          <div className="overflow-x-auto">
            {selectedReport === 'consumption' ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Material</th>
                    <th className="pb-3 text-right">Planned</th>
                    <th className="pb-3 text-right">Actual</th>
                    <th className="pb-3 text-right">Difference</th>
                    <th className="pb-3 text-right">Variance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {productionRuns[0].materialsConsumed.map((m, idx) => (
                    <tr key={idx} className={Math.abs(m.variancePercent) > 3 ? 'bg-rose-50 text-rose-800 font-bold' : ''}>
                      <td className="py-2.5">{m.name}</td>
                      <td className="py-2.5 text-right">{m.plannedQty} {m.unit}</td>
                      <td className="py-2.5 text-right font-bold">{m.actualQty} {m.unit}</td>
                      <td className="py-2.5 text-right">{m.difference} {m.unit}</td>
                      <td className="py-2.5 text-right font-black">{m.variancePercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Invoice No</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3 text-right">Taxable</th>
                    <th className="pb-3 text-right">CGST</th>
                    <th className="pb-3 text-right">SGST</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {invoices.map(i => (
                    <tr key={i.id}>
                      <td className="py-2.5 font-bold text-primary-600">{i.invoiceNo}</td>
                      <td className="py-2.5">{i.date}</td>
                      <td className="py-2.5 font-semibold">{i.customerName}</td>
                      <td className="py-2.5 text-right">₹{i.taxableValue.toFixed(2)}</td>
                      <td className="py-2.5 text-right">₹{i.cgst.toFixed(2)}</td>
                      <td className="py-2.5 text-right">₹{i.sgst.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold">₹{i.total.toFixed(2)}</td>
                      <td className="py-2.5 text-center">{i.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Bottom Export Bar matching design collage */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Export As:
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
