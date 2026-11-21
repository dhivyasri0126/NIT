import React, { useState, useEffect } from 'react';
import { Search, X, Package, ShoppingCart, Users, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useERP } from '../../context/ERPContext';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { products, orders, customers, invoices, materials } = useERP();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredOrders = q ? orders.filter(o => o.orderNo.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)) : [];
  const filteredProducts = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) : [];
  const filteredCustomers = q ? customers.filter(c => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)) : [];
  const filteredInvoices = q ? invoices.filter(i => i.invoiceNo.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)) : [];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Type to search orders, customers, products, invoices... (Press ESC to close)"
            className="w-full bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Search by order number (e.g. <span className="font-semibold text-primary-500">SO-0025</span>), product name (<span className="font-semibold text-primary-500">Murukku</span>), or customer (<span className="font-semibold text-primary-500">Retailer A</span>)
            </div>
          ) : (
            <>
              {filteredOrders.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5" /> Orders
                  </h4>
                  <div className="space-y-1">
                    {filteredOrders.map(o => (
                      <div
                        key={o.id}
                        onClick={() => handleSelect('/sales/orders')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{o.orderNo} - {o.customerName}</div>
                          <div className="text-xs text-slate-500">Amount: ₹{o.totalAmount} | Status: {o.status}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredProducts.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Products & Finished Goods
                  </h4>
                  <div className="space-y-1">
                    {filteredProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect('/inventory')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{p.name} ({p.id})</div>
                          <div className="text-xs text-slate-500">Stock: {p.currentStock} {p.unit} | Price: ₹{p.sellingPrice}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredCustomers.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Customers
                  </h4>
                  <div className="space-y-1">
                    {filteredCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect('/master/customers')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{c.name} - {c.city}</div>
                          <div className="text-xs text-slate-500">Outstanding: ₹{c.outstanding} | GSTIN: {c.gstin}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredInvoices.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Invoices
                  </h4>
                  <div className="space-y-1">
                    {filteredInvoices.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => handleSelect('/sales/invoices')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/30 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{inv.invoiceNo} - {inv.customerName}</div>
                          <div className="text-xs text-slate-500">Total: ₹{inv.total} | Paid: ₹{inv.paidAmount} | Status: {inv.status}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredOrders.length === 0 && filteredProducts.length === 0 && filteredCustomers.length === 0 && filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No matches found for "{query}"
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
