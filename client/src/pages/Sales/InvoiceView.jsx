import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  FileText,
  QrCode,
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { exportReportToPDF } from '../../utils/exportUtils';

export const InvoiceView = () => {
  const { invoices, company, recordPayment } = useERP();
  const [selectedInv, setSelectedInv] = useState(invoices[0]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(3875);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    exportReportToPDF({
      title: `TAX INVOICE - ${selectedInv.invoiceNo}`,
      subtitle: `Billed to: ${selectedInv.customerName} | GSTIN: ${selectedInv.customerGstin}`,
      columns: ['S.No', 'Product (HSN)', 'Qty', 'Rate (Rs)', 'Taxable (Rs)', 'CGST (Rs)', 'SGST (Rs)', 'Total (Rs)'],
      rows: selectedInv.items.map(it => [
        it.sNo,
        `${it.productName} (${it.hsn})`,
        it.quantity,
        it.rate.toFixed(2),
        it.taxable.toFixed(2),
        it.cgstAmount.toFixed(2),
        it.sgstAmount.toFixed(2),
        it.amount.toFixed(2),
      ]),
      filename: `${selectedInv.invoiceNo}_Sri_Murukku_Foods.pdf`
    });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    recordPayment({
      invoiceNo: selectedInv.invoiceNo,
      customerName: selectedInv.customerName,
      amountPaid: Number(payAmount),
      paymentMode: 'Bank Transfer / UPI',
      referenceNo: `UPI/${Date.now()}`,
    });
    setShowPayModal(false);
  };

  return (
    <Layout
      breadcrumbs={['Sales & Orders', 'Invoices', selectedInv?.invoiceNo || 'INV-0015']}
      title="GST Tax Invoice"
      subtitle="Statutory GST invoice compliant with e-invoicing and input tax credit requirements"
      actions={
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => setShowPayModal(true)}
            disabled={selectedInv.outstandingAmount <= 0}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Invoice List Selector (1 col) */}
        <div className="lg:col-span-1 bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-card space-y-3 no-print">
          <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
            Generated Invoices
          </h3>
          <div className="space-y-2">
            {invoices.map(inv => (
              <div
                key={inv.id}
                onClick={() => setSelectedInv(inv)}
                className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                  selectedInv.id === inv.id
                    ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-transparent hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-primary-600 dark:text-primary-400">
                    {inv.invoiceNo}
                  </span>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {inv.customerName}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>{inv.date}</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{inv.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actual GST Tax Invoice Template (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card printable-area">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            {/* Seller Company */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-primary-500 to-amber-300 flex items-center justify-center text-white text-2xl shadow-md">
                🥨
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {company.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                  {company.address}
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  GSTIN: <span className="font-mono text-primary-600 dark:text-primary-400">{company.gstin}</span>
                </p>
              </div>
            </div>

            {/* Tax Invoice Title & Metadata */}
            <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6 space-y-1 text-xs">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                TAX INVOICE
              </div>
              <div className="text-slate-500">
                Invoice No: <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{selectedInv.invoiceNo}</span>
              </div>
              <div className="text-slate-500">
                Invoice Date: <span className="font-medium text-slate-800 dark:text-slate-200">{selectedInv.date}</span>
              </div>
              <div className="text-slate-500">
                Place of Supply: <span className="font-medium text-slate-800 dark:text-slate-200">{selectedInv.placeOfSupply}</span>
              </div>
              {/* QR Code preview */}
              <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mt-1 text-[10px] text-slate-500">
                <QrCode className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>e-Invoice QR</span>
              </div>
            </div>
          </div>

          {/* Bill To Customer Information */}
          <div className="py-5 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Bill To:
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedInv.customerName}
              </div>
              <div className="text-slate-500 mt-0.5">
                {selectedInv.customerAddress}
              </div>
              <div className="text-slate-600 dark:text-slate-400 mt-1">
                GSTIN: <span className="font-mono font-semibold">{selectedInv.customerGstin}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Order Reference:
              </span>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                Order No: {selectedInv.orderNo}
              </div>
              <div className="text-slate-500 mt-1">
                Payment Status: <StatusBadge status={selectedInv.status} />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pl-2">S.No</th>
                  <th className="pb-3">Product (HSN)</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Rate (₹)</th>
                  <th className="pb-3 text-right">Taxable (₹)</th>
                  <th className="pb-3 text-right">CGST (2.5%)</th>
                  <th className="pb-3 text-right">SGST (2.5%)</th>
                  <th className="pb-3 text-right pr-2">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {selectedInv.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 pl-2 text-slate-400">{item.sNo}</td>
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.productName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        HSN: {item.hsn}
                      </div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 text-right text-slate-600 dark:text-slate-400">
                      {item.rate.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                      {item.taxable.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right text-slate-600 dark:text-slate-400">
                      {item.cgstAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right text-slate-600 dark:text-slate-400">
                      {item.sgstAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right pr-2 font-bold text-slate-900 dark:text-white">
                      {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Taxable Value & Invoice Totals */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="text-xs text-slate-500 max-w-sm space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Terms & Conditions:</div>
              <p>1. Certified that the particulars given above are true and correct.</p>
              <p>2. Subject to Tiruchirappalli jurisdiction only.</p>
              <p>3. Food safety registration: FSSAI Lic. No. 12423015000123</p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Taxable Value:</span>
                <span className="font-bold">₹{selectedInv.taxableValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>CGST (2.5%):</span>
                <span>₹{selectedInv.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>SGST (2.5%):</span>
                <span>₹{selectedInv.sgst.toFixed(2)}</span>
              </div>

              {/* Purple Highlighted Invoice Total Box (Matches Design Collage) */}
              <div className="p-3.5 rounded-2xl bg-primary-600 text-white flex justify-between items-center text-sm font-bold shadow-md">
                <span>Invoice Total:</span>
                <span className="text-lg font-black">₹{selectedInv.total.toFixed(2)}</span>
              </div>

              {/* Payment Receipt Info */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Amount Paid:</span>
                  <span>₹{selectedInv.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Outstanding Balance:</span>
                  <span>₹{selectedInv.outstandingAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handlePaymentSubmit} className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Record Payment Collection
            </h3>
            <p className="text-xs text-slate-400">
              Against Invoice {selectedInv.invoiceNo} for {selectedInv.customerName}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Invoice Amount Total</label>
                <div className="font-bold text-slate-900 dark:text-white text-base">₹{selectedInv.total.toFixed(2)}</div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Current Outstanding Due</label>
                <div className="font-bold text-rose-600 text-base">₹{selectedInv.outstandingAmount.toFixed(2)}</div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Payment Received (₹) *</label>
                <input
                  type="number"
                  max={selectedInv.outstandingAmount}
                  min="1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Payment Mode</label>
                <select className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <option>UPI / IMPS Bank Transfer</option>
                  <option>Cheque / DD</option>
                  <option>Cash Receipt</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
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
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};
