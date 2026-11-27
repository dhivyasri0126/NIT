import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_COMPANY,
  INITIAL_ROLES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_MATERIALS,
  INITIAL_BOM,
  INITIAL_PRODUCTION_RUNS,
  INITIAL_PURCHASES,
  INITIAL_ORDERS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_AGEING,
} from '../data/benchmarkData';

// API Services
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { invoiceService } from '../services/invoiceService';
import { productionService } from '../services/productionService';
import { inventoryService } from '../services/inventoryService';
import { purchaseService } from '../services/purchaseService';
import { paymentService } from '../services/paymentService';
import { masterDataService } from '../services/masterDataService';

// Data normalizers (snake_case PostgreSQL -> camelCase Frontend)
const toNum = (v, fallback = 0) => (v !== undefined && v !== null && !isNaN(Number(v)) ? Number(v) : fallback);
const toDateStr = (d) => (d ? String(d).split('T')[0] : new Date().toISOString().split('T')[0]);

const normalizeOrders = (rows = []) =>
  rows.map((o) => ({
    ...o,
    id: o.id,
    orderNo: o.orderNo || o.order_no || o.id,
    orderDate: toDateStr(o.orderDate || o.order_date),
    customerId: o.customerId || o.customer_id,
    customerName: o.customerName || o.customer_name,
    customerAddress: o.customerAddress || o.customer_address || '',
    customerGstin: o.customerGstin || o.customer_gstin || '',
    salesmanId: o.salesmanId || o.salesman_id,
    taxableAmount: toNum(o.taxableAmount ?? o.taxable_amount),
    cgstTotal: toNum(o.cgstTotal ?? o.cgst_total),
    sgstTotal: toNum(o.sgstTotal ?? o.sgst_total),
    igstTotal: toNum(o.igstTotal ?? o.igst_total),
    totalAmount: toNum(o.totalAmount ?? o.total_amount),
    shortageQuantity: toNum(o.shortageQuantity ?? o.shortage_quantity),
    invoiceNo: o.invoiceNo || o.invoice_no || null,
    invoiceDate: o.invoiceDate || o.invoice_date ? toDateStr(o.invoiceDate || o.invoice_date) : null,
    rejectionReason: o.rejectionReason || o.rejection_reason || null,
    items: (o.items || []).map((it) => ({
      ...it,
      productId: it.productId || it.product_id,
      productName: it.productName || it.product_name,
      quantity: toNum(it.quantity),
      rate: toNum(it.rate),
      taxable: toNum(it.taxable),
      cgstRate: toNum(it.cgstRate ?? it.cgst_rate, 2.5),
      cgstAmount: toNum(it.cgstAmount ?? it.cgst_amount),
      sgstRate: toNum(it.sgstRate ?? it.sgst_rate, 2.5),
      sgstAmount: toNum(it.sgstAmount ?? it.sgst_amount),
      igstRate: toNum(it.igstRate ?? it.igst_rate),
      igstAmount: toNum(it.igstAmount ?? it.igst_amount),
      totalAmount: toNum(it.totalAmount ?? it.total_amount),
    })),
  }));

const normalizeInvoices = (rows = []) =>
  rows.map((inv) => ({
    ...inv,
    id: inv.id,
    invoiceNo: inv.invoiceNo || inv.invoice_no || inv.id,
    orderNo: inv.orderNo || inv.order_no,
    date: toDateStr(inv.date || inv.invoice_date),
    invoiceDate: toDateStr(inv.invoiceDate || inv.invoice_date),
    customerId: inv.customerId || inv.customer_id,
    customerName: inv.customerName || inv.customer_name,
    customerAddress: inv.customerAddress || inv.customer_address || '',
    customerGstin: inv.customerGstin || inv.customer_gstin || '',
    placeOfSupply: inv.placeOfSupply || inv.place_of_supply || 'Tamil Nadu (TN)',
    taxableValue: toNum(inv.taxableValue ?? inv.taxable_value),
    cgst: toNum(inv.cgst),
    sgst: toNum(inv.sgst),
    igst: toNum(inv.igst),
    total: toNum(inv.total),
    paidAmount: toNum(inv.paidAmount ?? inv.paid_amount),
    outstandingAmount: toNum(inv.outstandingAmount ?? inv.outstanding_amount),
    qrCodeValue: inv.qrCodeValue || inv.qr_code_value || '',
    items: (inv.items || []).map((it) => ({
      ...it,
      sNo: it.sNo ?? it.s_no,
      productId: it.productId || it.product_id,
      productName: it.productName || it.product_name,
      quantity: toNum(it.quantity),
      rate: toNum(it.rate),
      taxable: toNum(it.taxable),
      cgstRate: toNum(it.cgstRate ?? it.cgst_rate, 2.5),
      cgstAmount: toNum(it.cgstAmount ?? it.cgst_amount),
      sgstRate: toNum(it.sgstRate ?? it.sgst_rate, 2.5),
      sgstAmount: toNum(it.sgstAmount ?? it.sgst_amount),
      amount: toNum(it.amount),
    })),
  }));

const normalizeProductionRuns = (rows = []) =>
  rows.map((r) => ({
    ...r,
    id: r.id,
    runNumber: r.runNumber || r.run_number || r.id,
    batchNo: r.batchNo || r.batch_no,
    productId: r.productId || r.product_id,
    productName: r.productName || r.product_name,
    date: toDateStr(r.date),
    plannedOutput: toNum(r.plannedOutput ?? r.planned_output),
    actualOutput: toNum(r.actualOutput ?? r.actual_output),
    wastageQty: toNum(r.wastageQty ?? r.wastage_qty),
    efficiencyPercent: toNum(r.efficiencyPercent ?? r.efficiency_percent),
    supervisor: r.supervisor || r.supervisor_name || 'M. Selvam',
    materialsConsumed: (r.materialsConsumed || []).map((m) => ({
      ...m,
      plannedQty: toNum(m.plannedQty ?? m.planned_qty),
      actualQty: toNum(m.actualQty ?? m.actual_qty),
      varianceQty: toNum(m.varianceQty ?? m.variance_qty),
      variancePercent: toNum(m.variancePercent ?? m.variance_percent),
      rate: toNum(m.rate),
      totalCost: toNum(m.totalCost ?? m.total_cost),
    })),
  }));

const normalizePurchases = (rows = []) =>
  rows.map((p) => {
    const firstItem = p.items?.[0];
    return {
      ...p,
      id: p.id,
      poNumber: p.poNumber || p.po_number || p.id,
      supplierId: p.supplierId || p.supplier_id,
      supplierName: p.supplierName || p.supplier_name,
      date: toDateStr(p.date || p.order_date),
      item: p.item || firstItem?.itemName || 'Raw Material',
      quantity: toNum(p.quantity ?? firstItem?.quantity),
      unit: p.unit || firstItem?.unit || 'kg',
      unitPrice: toNum(p.unitPrice ?? firstItem?.unitPrice),
      totalAmount: toNum(p.totalAmount ?? p.total_amount),
      paymentStatus: p.paymentStatus || p.payment_status || 'Paid',
      invoiceRef: p.invoiceRef || p.invoice_ref || '',
    };
  });

const normalizePayments = (rows = []) =>
  rows.map((p) => ({
    ...p,
    id: p.id,
    receiptNo: p.receiptNo || p.receipt_no || p.id,
    invoiceNo: p.invoiceNo || p.invoice_no,
    customerId: p.customerId || p.customer_id,
    customerName: p.customerName || p.customer_name,
    date: toDateStr(p.date),
    amountPaid: toNum(p.amountPaid ?? p.amount_paid),
    paymentMode: p.paymentMode || p.payment_mode,
    referenceNo: p.referenceNo || p.reference_no || '',
  }));

const normalizeProducts = (rows = []) =>
  rows.map((p) => ({
    ...p,
    id: p.id,
    name: p.name,
    category: p.category || p.category_name || 'Snacks',
    hsn: p.hsn || '19059090',
    unit: p.unit || p.unit_id || 'packets',
    sellingPrice: toNum(p.sellingPrice ?? p.selling_price),
    costPrice: toNum(p.costPrice ?? p.cost_price),
    gstRate: toNum(p.gstRate ?? p.gst_rate, 5),
    currentStock: toNum(p.currentStock ?? p.current_stock),
    minStock: toNum(p.minStock ?? p.min_stock, 50),
  }));

const normalizeCustomers = (rows = []) =>
  rows.map((c) => ({
    ...c,
    id: c.id,
    name: c.name,
    city: c.city,
    state: c.state || 'Tamil Nadu',
    gstin: c.gstin || '',
    phone: c.phone || '',
    creditLimit: toNum(c.creditLimit ?? c.credit_limit),
    outstanding: toNum(c.outstanding ?? c.outstanding_balance),
  }));

const normalizeAgeing = (rows = []) =>
  rows.map((a) => ({
    ...a,
    customerId: a.customerId || a.customer_id,
    customerName: a.customerName || a.customer_name,
    days0to30: toNum(a.days0to30 ?? a.bucket_0_30),
    days31to60: toNum(a.days31to60 ?? a.bucket_31_60),
    days61to90: toNum(a.days61to90 ?? a.bucket_61_90),
    days90Plus: toNum(a.days90Plus ?? a.bucket_above_90),
    totalOutstanding: toNum(a.totalOutstanding ?? a.total_outstanding),
  }));

const normalizeMaterials = (rawRows = [], pkgRows = []) => [
  ...rawRows.map((m) => ({
    ...m,
    id: m.id,
    name: m.name,
    category: 'Raw Material',
    unit: m.unit_id || m.unit || 'kg',
    openingStock: toNum(m.opening_stock),
    purchased: toNum(m.purchased),
    consumed: toNum(m.consumed),
    closingStock: toNum(m.closing_stock),
    reorderLevel: toNum(m.reorder_level),
    rate: toNum(m.standard_rate ?? m.rate),
    status: toNum(m.closing_stock) <= toNum(m.reorder_level) ? 'Low Stock' : 'In Stock',
  })),
  ...pkgRows.map((m) => ({
    ...m,
    id: m.id,
    name: m.name,
    category: 'Packaging',
    unit: m.unit_id || m.unit || 'pcs',
    openingStock: toNum(m.opening_stock),
    purchased: toNum(m.purchased),
    consumed: toNum(m.consumed),
    closingStock: toNum(m.closing_stock),
    reorderLevel: toNum(m.reorder_level),
    rate: toNum(m.standard_rate ?? m.rate),
    status: toNum(m.closing_stock) <= toNum(m.reorder_level) ? 'Low Stock' : 'In Stock',
  })),
];

const ERPContext = createContext();

export const ERPProvider = ({ children }) => {
  // Current user & role (admin, salesman, supervisor, auditor, owner)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sri_murukku_role');
    const matched = INITIAL_ROLES.find(r => r.id === saved);
    return matched || INITIAL_ROLES[0]; // Admin by default
  });

  const [company, setCompany] = useState(INITIAL_COMPANY);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [bom, setBom] = useState(INITIAL_BOM);
  const [productionRuns, setProductionRuns] = useState(INITIAL_PRODUCTION_RUNS);
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [ageing, setAgeing] = useState(INITIAL_AGEING);

  // Connection & loading states
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  // Offline capture simulation
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('sri_murukku_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Low Stock Alert',
      message: 'Cartons (20-pack) stock is at 21 pcs (below reorder level of 25 pcs).',
      type: 'warning',
      timestamp: '10 mins ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Yield Variance Alert',
      message: 'Batch BATCH-001 yield variance is -6.0% (expected 200, actual 188 pkts).',
      type: 'danger',
      timestamp: '25 mins ago',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Oil Consumption Alert',
      message: 'Cooking oil consumption exceeded standard BOM by +5.0% (+0.5 L).',
      type: 'warning',
      timestamp: '30 mins ago',
      read: false,
    },
    {
      id: 'notif-4',
      title: 'Order Shortage Warning',
      message: 'Order SO-0026 for Distributor B has shortage of 32 packets Murukku.',
      type: 'info',
      timestamp: '1 hour ago',
      read: true,
    }
  ]);

  // Persist offline queue
  useEffect(() => {
    localStorage.setItem('sri_murukku_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Fetch all live data from backend PostgreSQL
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Ensure token exists for current user
      let token = localStorage.getItem('sri_murukku_token');
      if (!token) {
        try {
          const authRes = await authService.login(currentUser.email, 'Password@123');
          const fetchedToken = authRes?.data?.accessToken || authRes?.data?.token;
          if (fetchedToken) {
            token = fetchedToken;
            localStorage.setItem('sri_murukku_token', token);
          }
        } catch (e) {
          console.warn('Initial token acquisition notice:', e.message);
        }
      }

      // 2. Fetch parallel entities (role-restricted endpoints safely settle as rejected if unauthorized)
      const [
        ordersRes,
        invoicesRes,
        productionRes,
        materialsRes,
        purchasesRes,
        paymentsRes,
        customersRes,
        productsRes,
        suppliersRes,
        ageingRes
      ] = await Promise.allSettled([
        orderService.getOrders(),
        invoiceService.getInvoices(),
        productionService.getProductionRuns(),
        masterDataService.getMaterials(),
        purchaseService.getPurchases(),
        paymentService.getPayments(),
        masterDataService.getCustomers(),
        masterDataService.getProducts(),
        masterDataService.getSuppliers(),
        paymentService.getAgeing(),
      ]);

      setBackendConnected(true);

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
        setOrders(normalizeOrders(ordersRes.value.data));
      }
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value?.data) {
        setInvoices(normalizeInvoices(invoicesRes.value.data));
      }
      if (productionRes.status === 'fulfilled' && productionRes.value?.data) {
        setProductionRuns(normalizeProductionRuns(productionRes.value.data));
      }
      if (materialsRes.status === 'fulfilled' && materialsRes.value?.data) {
        const { rawMaterials = [], packagingMaterials = [] } = materialsRes.value.data;
        setMaterials(normalizeMaterials(rawMaterials, packagingMaterials));
      }
      if (purchasesRes.status === 'fulfilled' && purchasesRes.value?.data) {
        setPurchases(normalizePurchases(purchasesRes.value.data));
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data) {
        setPayments(normalizePayments(paymentsRes.value.data));
      }
      if (customersRes.status === 'fulfilled' && customersRes.value?.data) {
        setCustomers(normalizeCustomers(customersRes.value.data));
      }
      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        setProducts(normalizeProducts(productsRes.value.data));
      }
      if (suppliersRes.status === 'fulfilled' && suppliersRes.value?.data) {
        setSuppliers(suppliersRes.value.data);
      }
      if (ageingRes.status === 'fulfilled' && ageingRes.value?.data) {
        setAgeing(normalizeAgeing(ageingRes.value.data));
      }
    } catch (err) {
      console.warn('Backend synchronization warning, keeping offline/cached data:', err);
      setBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Switch role with backend token update
  const switchRole = async (roleId) => {
    const role = INITIAL_ROLES.find(r => r.id === roleId);
    if (role) {
      setCurrentUser(role);
      localStorage.setItem('sri_murukku_role', roleId);

      // Attempt to switch JWT token for this user
      try {
        const authRes = await authService.login(role.email, 'Password@123');
        const fetchedToken = authRes?.data?.accessToken || authRes?.data?.token;
        if (fetchedToken) {
          localStorage.setItem('sri_murukku_token', fetchedToken);
          localStorage.setItem('sri_murukku_user', JSON.stringify(authRes.data.user));
        }
      } catch (err) {
        console.warn('Role switch token error:', err.message);
      }
    }
  };

  // 1. Order Management Actions
  const createOrder = async (orderData) => {
    if (isOffline) {
      const nextOrderNumber = `SO-${String(orders.length + offlineQueue.length + 22).padStart(4, '0')}`;
      const offlineOrder = {
        id: nextOrderNumber,
        orderNo: nextOrderNumber,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Offline Queued',
        salesmanName: currentUser.name,
        salesmanId: currentUser.id,
        items: orderData.items || [],
        ...orderData,
      };
      setOfflineQueue(prev => [...prev, offlineOrder]);
      return { success: true, offline: true, order: offlineOrder };
    }

    try {
      const res = await orderService.createOrder({
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        customerAddress: orderData.customerAddress,
        customerGstin: orderData.customerGstin,
        salesmanName: currentUser.name,
        paymentTerms: orderData.paymentTerms || 'Cash on Delivery',
        items: orderData.items,
        notes: orderData.notes,
      });

      await refreshData();
      return { success: true, offline: false, order: res?.data };
    } catch (err) {
      console.warn('API createOrder error, creating local fallback order:', err);
      const nextOrderNumber = `SO-${String(orders.length + 22).padStart(4, '0')}`;
      const fallbackOrder = {
        id: nextOrderNumber,
        orderNo: nextOrderNumber,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        salesmanName: currentUser.name,
        ...orderData,
      };
      setOrders(prev => [fallbackOrder, ...prev]);
      return { success: true, offline: false, order: fallbackOrder };
    }
  };

  const approveOrder = async (orderId) => {
    try {
      await orderService.approveOrder(orderId);
      await refreshData();
    } catch (err) {
      console.warn('API approveOrder error, falling back locally:', err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Approved' } : o));
    }
  };

  const rejectOrder = async (orderId, reason = 'Administrative cancellation') => {
    try {
      await orderService.rejectOrder(orderId, reason);
      await refreshData();
    } catch (err) {
      console.warn('API rejectOrder error, falling back locally:', err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Rejected', rejectionReason: reason } : o));
    }
  };

  const generateInvoiceForOrder = async (orderId) => {
    try {
      const res = await invoiceService.generateInvoice(orderId);
      await refreshData();
      return res?.data;
    } catch (err) {
      console.warn('API generateInvoice error, creating local invoice:', err);
      const order = orders.find(o => o.id === orderId);
      if (!order) return null;

      const nextInvNo = `INV-${String(invoices.length + 15).padStart(4, '0')}`;
      const newInvoice = {
        id: nextInvNo,
        invoiceNo: nextInvNo,
        orderNo: order.orderNo,
        invoiceDate: new Date().toISOString().split('T')[0],
        customerName: order.customerName,
        customerAddress: order.customerAddress || "Tamil Nadu, India",
        customerGstin: order.customerGstin || "Unregistered",
        placeOfSupply: "Tamil Nadu (TN)",
        items: (order.items || []).map((it, idx) => ({
          sNo: idx + 1,
          productName: it.productName,
          hsn: it.hsn || "19059090",
          quantity: it.quantity,
          rate: it.rate,
          taxable: it.taxable,
          cgstRate: 2.5,
          cgstAmount: it.taxable * 0.025,
          sgstRate: 2.5,
          sgstAmount: it.taxable * 0.025,
          amount: it.totalAmount,
        })),
        taxableValue: order.taxableAmount,
        cgst: order.cgstTotal,
        sgst: order.sgstTotal,
        total: order.totalAmount,
        paidAmount: 0,
        outstandingAmount: order.totalAmount,
        status: "Unpaid",
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Invoiced', invoiceNo: nextInvNo } : o));
      return newInvoice;
    }
  };

  const dispatchOrder = async (orderId) => {
    try {
      await orderService.dispatchOrder(orderId, {
        vehicleNo: 'TN-45-AZ-9988',
        driverName: 'K. Murugan',
        dispatchedBy: currentUser.name,
      });
      await refreshData();
    } catch (err) {
      console.warn('API dispatchOrder error, falling back locally:', err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Dispatched', dispatchStatus: 'Dispatched' } : o));
    }
  };

  // 2. Production Actions
  const createProductionRun = async (runData) => {
    try {
      const res = await productionService.createProductionRun({
        productId: runData.productId || 'PROD-001',
        productName: runData.productName || 'Murukku (200 g)',
        batchNo: runData.batchNo || `BATCH-${String(productionRuns.length + 1).padStart(3, '0')}`,
        plannedOutput: runData.plannedOutput || 200,
        actualOutput: runData.actualOutput || 188,
        wastageQty: runData.wastageQty || 12,
        supervisorName: currentUser.name,
        materialsConsumed: runData.materialsConsumed || [],
        labourCost: runData.labourCost || 1200,
        powerGasCost: runData.powerGasCost || 600,
      });

      await refreshData();
      return res?.data;
    } catch (err) {
      console.warn('API createProductionRun error, falling back locally:', err);
      const nextPrNo = `PR-${String(productionRuns.length + 1).padStart(3, '0')}`;
      const newRun = {
        id: nextPrNo,
        date: new Date().toISOString().split('T')[0],
        supervisor: currentUser.name,
        status: 'Completed',
        ...runData,
      };
      setProductionRuns(prev => [newRun, ...prev]);
      return newRun;
    }
  };

  // 3. Purchase Actions
  const createPurchase = async (purchaseData) => {
    try {
      const res = await purchaseService.createPurchase({
        supplierId: purchaseData.supplierId || 'SUPP-001',
        supplierName: purchaseData.supplierName || 'Cauvery Rice Mill, Trichy',
        item: purchaseData.item,
        quantity: purchaseData.quantity,
        unit: purchaseData.unit || 'kg',
        unitPrice: purchaseData.unitPrice,
        totalAmount: purchaseData.totalAmount || (purchaseData.quantity * purchaseData.unitPrice),
        invoiceRef: purchaseData.invoiceRef || `BILL-${Date.now().toString().slice(-4)}`,
        notes: purchaseData.notes,
      });

      await refreshData();
      return res?.data;
    } catch (err) {
      console.warn('API createPurchase error, falling back locally:', err);
      const nextPoNo = `PO-${String(purchases.length + 1).padStart(3, '0')}`;
      const newPurchase = {
        id: nextPoNo,
        poNumber: nextPoNo,
        date: new Date().toISOString().split('T')[0],
        status: 'Received',
        paymentStatus: 'Paid',
        ...purchaseData,
      };
      setPurchases(prev => [newPurchase, ...prev]);
      return newPurchase;
    }
  };

  // 4. Payment Actions
  const recordPayment = async (paymentData) => {
    try {
      const res = await paymentService.recordPayment({
        invoiceNo: paymentData.invoiceNo,
        customerName: paymentData.customerName,
        amountPaid: paymentData.amountPaid,
        paymentMode: paymentData.paymentMode || 'UPI / Bank Transfer',
        referenceNo: paymentData.referenceNo,
        notes: paymentData.notes,
      });

      await refreshData();
      return res?.data;
    } catch (err) {
      console.warn('API recordPayment error, falling back locally:', err);
      const nextPayId = `PAY-${String(payments.length + 1).padStart(3, '0')}`;
      const newPayment = {
        id: nextPayId,
        receiptNo: `REC-2025-${String(payments.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        ...paymentData,
      };
      setPayments(prev => [newPayment, ...prev]);
      return newPayment;
    }
  };

  // 5. Sync Offline Queue
  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return 0;
    const count = offlineQueue.length;

    try {
      await orderService.syncOfflineOrders(offlineQueue);
      setOfflineQueue([]);
      setIsOffline(false);
      localStorage.removeItem('sri_murukku_offline_queue');
      await refreshData();
      return count;
    } catch (err) {
      console.warn('API syncOfflineQueue error, merging locally:', err);
      setOrders(prev => [...offlineQueue, ...prev]);
      setOfflineQueue([]);
      setIsOffline(false);
      localStorage.removeItem('sri_murukku_offline_queue');
      return count;
    }
  };

  // Notifications
  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Master Data Add Handlers
  const addProduct = async (p) => {
    try {
      await masterDataService.addProduct(p);
      await refreshData();
    } catch (err) {
      setProducts(prev => [...prev, { id: `PROD-${String(prev.length + 1).padStart(3, '0')}`, ...p }]);
    }
  };

  const addCustomer = async (c) => {
    try {
      await masterDataService.addCustomer(c);
      await refreshData();
    } catch (err) {
      setCustomers(prev => [...prev, { id: `CUST-${String(prev.length + 1).padStart(3, '0')}`, ...c }]);
    }
  };

  const addSupplier = async (s) => {
    try {
      await masterDataService.addSupplier(s);
      await refreshData();
    } catch (err) {
      setSuppliers(prev => [...prev, { id: `SUPP-${String(prev.length + 1).padStart(3, '0')}`, ...s }]);
    }
  };

  const addMaterial = (m) => setMaterials(prev => [...prev, { id: `MAT-${String(prev.length + 1).padStart(3, '0')}`, ...m }]);

  return (
    <ERPContext.Provider
      value={{
        currentUser,
        switchRole,
        company,
        setCompany,
        products,
        setProducts,
        customers,
        setCustomers,
        suppliers,
        setSuppliers,
        materials,
        setMaterials,
        bom,
        setBom,
        productionRuns,
        purchases,
        orders,
        invoices,
        payments,
        ageing,
        isLoading,
        backendConnected,
        refreshData,
        isOffline,
        setIsOffline,
        offlineQueue,
        syncOfflineQueue,
        notifications,
        markNotificationsAsRead,
        createOrder,
        approveOrder,
        rejectOrder,
        generateInvoiceForOrder,
        dispatchOrder,
        createProductionRun,
        createPurchase,
        recordPayment,
        addProduct,
        addCustomer,
        addSupplier,
        addMaterial,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => useContext(ERPContext);
