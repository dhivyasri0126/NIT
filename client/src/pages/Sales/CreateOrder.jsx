import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Calculator,
  UserCheck
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';

export const CreateOrder = () => {
  const { customers, products, createOrder, isOffline } = useERP();
  const navigate = useNavigate();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [items, setItems] = useState([
    {
      productId: products[0]?.id || '',
      quantity: 100,
      rate: products[0]?.sellingPrice || 50,
      discountPercent: 0,
    }
  ]);
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        productId: products[0]?.id || '',
        quantity: 50,
        rate: products[0]?.sellingPrice || 50,
        discountPercent: 0,
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        updated[index] = {
          ...updated[index],
          productId: value,
          rate: prod?.sellingPrice || 50,
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: Number(value) || 0,
        };
      }
      return updated;
    });
  };

  // Calculations
  const calculatedItems = items.map(item => {
    const prod = products.find(p => p.id === item.productId) || products[0];
    const rawTotal = item.quantity * item.rate;
    const discountAmt = (rawTotal * item.discountPercent) / 100;
    const taxable = rawTotal - discountAmt;
    const isInterstate = selectedCustomer?.stateCode !== '33' && selectedCustomer?.state !== 'Tamil Nadu';
    const cgstRate = isInterstate ? 0 : 2.5;
    const sgstRate = isInterstate ? 0 : 2.5;
    const igstRate = isInterstate ? 5.0 : 0;
    const cgstAmount = (taxable * cgstRate) / 100;
    const sgstAmount = (taxable * sgstRate) / 100;
    const igstAmount = (taxable * igstRate) / 100;
    const totalAmount = taxable + cgstAmount + sgstAmount + igstAmount;

    return {
      productId: prod?.id,
      productName: prod?.name,
      hsn: prod?.hsn,
      quantity: item.quantity,
      rate: item.rate,
      discountPercent: item.discountPercent,
      taxable,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalAmount,
      availableStock: prod?.currentStock || 0,
    };
  });

  const subtotalTaxable = calculatedItems.reduce((sum, it) => sum + it.taxable, 0);
  const totalCgst = calculatedItems.reduce((sum, it) => sum + it.cgstAmount, 0);
  const totalSgst = calculatedItems.reduce((sum, it) => sum + it.sgstAmount, 0);
  const totalIgst = calculatedItems.reduce((sum, it) => sum + it.igstAmount, 0);
  const grandTotal = calculatedItems.reduce((sum, it) => sum + it.totalAmount, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const res = createOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerAddress: selectedCustomer.address,
      customerGstin: selectedCustomer.gstin,
      items: calculatedItems,
      taxableAmount: subtotalTaxable,
      cgstTotal: totalCgst,
      sgstTotal: totalSgst,
      igstTotal: totalIgst,
      totalAmount: grandTotal,
      notes,
    });

    setSuccessMsg(res.offline ? 'Order saved locally in offline queue!' : `Order ${res.order.orderNo} created successfully!`);
    setTimeout(() => {
      navigate('/sales/orders');
    }, 1200);
  };

  return (
    <Layout
      breadcrumbs={['Sales & Orders', 'Create Order']}
      title="Create New Sales Order"
      subtitle="Select customer, add product items, calculate automated GST and verify stock availability"
      actions={
        <button
          onClick={() => navigate('/sales/orders')}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Customer & Order Metadata */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary-500" />
            <span>Customer & Dispatch Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Select Retailer / Customer *
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city}) - Outstanding: ₹{c.outstanding}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                GSTIN / Tax Registration
              </label>
              <input
                type="text"
                readOnly
                value={selectedCustomer?.gstin || 'Unregistered / Consumer'}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Place of Supply
              </label>
              <input
                type="text"
                readOnly
                value="Tamil Nadu (TN) - State Code: 33"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Product Line Items */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary-500" />
              <span>Order Line Items</span>
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/60 text-primary-600 dark:text-primary-400 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const calc = calculatedItems[idx];
              const isStockShortage = item.quantity > calc.availableStock;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isStockShortage
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Product</label>
                      <select
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.currentStock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Unit Rate (₹)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Discount %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        value={item.discountPercent}
                        onChange={(e) => handleItemChange(idx, 'discountPercent', e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Line Total</label>
                      <div className="text-xs font-bold text-slate-900 dark:text-white py-2">
                        ₹{calc.totalAmount.toFixed(2)}
                      </div>
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length === 1}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock validation warning badge */}
                  {isStockShortage && (
                    <div className="mt-2 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>
                        Shortage Warning: Available warehouse stock is only {calc.availableStock} packets (Order qty: {item.quantity}). Order will be flagged as "Insufficient Stock".
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* GST & Totals Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Order Notes & Transport Instructions</h4>
            <textarea
              rows="4"
              placeholder="e.g. Deliver before 4 PM to Sundaram Stores, Trichy..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary-500" />
              <span>GST & Invoice Value Calculation</span>
            </h4>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Subtotal (Taxable Value):</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotalTaxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">CGST (2.5%):</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">₹{totalCgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">SGST (2.5%):</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">₹{totalSgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span className="text-slate-900 dark:text-white">Total Order Amount:</span>
                <span className="text-primary-600 dark:text-primary-400 text-base">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isOffline ? 'Save Order Locally (Offline)' : 'Submit Order for Approval'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
};
