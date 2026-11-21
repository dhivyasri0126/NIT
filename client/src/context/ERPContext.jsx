import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Offline capture simulation
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
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

  const switchRole = (roleId) => {
    const role = INITIAL_ROLES.find(r => r.id === roleId);
    if (role) {
      setCurrentUser(role);
      localStorage.setItem('sri_murukku_role', roleId);
    }
  };

  // 1. Order Management Actions
  const createOrder = (orderData) => {
    const nextOrderNumber = `SO-${String(orders.length + 22).padStart(4, '0')}`;
    const newOrder = {
      id: nextOrderNumber,
      orderNo: nextOrderNumber,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      salesmanId: currentUser.id,
      ...orderData,
    };

    if (isOffline) {
      setOfflineQueue(prev => [...prev, newOrder]);
      return { success: true, offline: true, order: newOrder };
    }

    setOrders(prev => [newOrder, ...prev]);

    // Check stock availability
    const mainItem = newOrder.items?.[0];
    if (mainItem) {
      const prod = products.find(p => p.id === mainItem.productId);
      if (prod && prod.currentStock < mainItem.quantity) {
        newOrder.status = 'Insufficient Stock';
        newOrder.shortageQuantity = mainItem.quantity - prod.currentStock;
      }
    }

    return { success: true, offline: false, order: newOrder };
  };

  const approveOrder = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Approved' };
      }
      return o;
    }));
  };

  const rejectOrder = (orderId, reason = 'Administrative cancellation') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Rejected', rejectionReason: reason };
      }
      return o;
    }));
  };

  const generateInvoiceForOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const nextInvNo = `INV-${String(invoices.length + 15).padStart(4, '0')}`;
    const newInvoice = {
      id: nextInvNo,
      invoiceNo: nextInvNo,
      orderNo: order.orderNo,
      date: new Date().toISOString().split('T')[0],
      customerName: order.customerName,
      customerAddress: order.customerAddress || "Tamil Nadu, India",
      customerGstin: order.customerGstin || "Unregistered",
      placeOfSupply: "Tamil Nadu (TN)",
      items: order.items.map((it, idx) => ({
        sNo: idx + 1,
        productName: it.productName,
        hsn: it.hsn || "19059090",
        quantity: it.quantity,
        rate: it.rate,
        taxable: it.taxable,
        cgstRate: it.cgstRate || 2.5,
        cgstAmount: it.cgstAmount || (it.taxable * 0.025),
        sgstRate: it.sgstRate || 2.5,
        sgstAmount: it.sgstAmount || (it.taxable * 0.025),
        amount: it.totalAmount,
      })),
      taxableValue: order.taxableAmount,
      cgst: order.cgstTotal,
      sgst: order.sgstTotal,
      total: order.totalAmount,
      paidAmount: 0,
      outstandingAmount: order.totalAmount,
      status: "Unpaid",
      qrCodeValue: `GSTIN:${company.gstin};INV:${nextInvNo};DATE:${new Date().toISOString().split('T')[0]};VAL:${order.totalAmount}`,
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Invoiced', invoiceNo: nextInvNo } : o));

    return newInvoice;
  };

  const dispatchOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Deduct stock from finished goods
    order.items?.forEach(item => {
      setProducts(prev => prev.map(prod => {
        if (prod.id === item.productId || prod.name === item.productName) {
          return {
            ...prod,
            currentStock: Math.max(0, prod.currentStock - item.quantity)
          };
        }
        return prod;
      }));
    });

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Dispatched' } : o));
  };

  // 2. Production Actions
  const createProductionRun = (runData) => {
    const nextPrNo = `PR-${String(productionRuns.length + 1).padStart(3, '0')}`;
    const newRun = {
      id: nextPrNo,
      date: new Date().toISOString().split('T')[0],
      supervisor: currentUser.name,
      status: 'Completed',
      ...runData,
    };

    // Deduct raw materials & packaging
    setMaterials(prev => prev.map(mat => {
      const consumedItem = runData.materialsConsumed?.find(m => m.materialId === mat.id || m.name === mat.name);
      if (consumedItem) {
        return {
          ...mat,
          consumed: mat.consumed + consumedItem.actualQty,
          closingStock: Math.max(0, mat.closingStock - consumedItem.actualQty),
          status: (mat.closingStock - consumedItem.actualQty) <= mat.reorderLevel ? 'Low Stock' : 'In Stock'
        };
      }
      return mat;
    }));

    // Add finished goods
    setProducts(prev => prev.map(p => {
      if (p.id === runData.productId || p.name === runData.productName) {
        return {
          ...p,
          currentStock: p.currentStock + runData.actualOutput,
        };
      }
      return p;
    }));

    setProductionRuns(prev => [newRun, ...prev]);
    return newRun;
  };

  // 3. Purchase Actions
  const createPurchase = (purchaseData) => {
    const nextPoNo = `PO-${String(purchases.length + 1).padStart(3, '0')}`;
    const newPurchase = {
      id: nextPoNo,
      poNumber: nextPoNo,
      date: new Date().toISOString().split('T')[0],
      status: 'Received',
      paymentStatus: 'Paid',
      ...purchaseData,
    };

    // Update material stock
    setMaterials(prev => prev.map(m => {
      if (m.name.toLowerCase().includes(purchaseData.item.toLowerCase()) || m.id === purchaseData.materialId) {
        const newPurchased = m.purchased + purchaseData.quantity;
        const newClosing = m.closingStock + purchaseData.quantity;
        return {
          ...m,
          purchased: newPurchased,
          closingStock: newClosing,
          status: newClosing <= m.reorderLevel ? 'Low Stock' : 'In Stock'
        };
      }
      return m;
    }));

    setPurchases(prev => [newPurchase, ...prev]);
    return newPurchase;
  };

  // 4. Payment Actions
  const recordPayment = (paymentData) => {
    const nextPayId = `PAY-${String(payments.length + 1).padStart(3, '0')}`;
    const newPayment = {
      id: nextPayId,
      receiptNo: `REC-2025-${String(payments.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...paymentData,
    };

    // Update invoice paid & outstanding
    setInvoices(prev => prev.map(inv => {
      if (inv.invoiceNo === paymentData.invoiceNo) {
        const newPaid = inv.paidAmount + paymentData.amountPaid;
        const newOutstanding = Math.max(0, inv.total - newPaid);
        return {
          ...inv,
          paidAmount: newPaid,
          outstandingAmount: newOutstanding,
          status: newOutstanding === 0 ? 'Paid' : 'Partially Paid',
        };
      }
      return inv;
    }));

    // Update customer outstanding
    setCustomers(prev => prev.map(cust => {
      if (cust.name === paymentData.customerName) {
        return {
          ...cust,
          outstanding: Math.max(0, cust.outstanding - paymentData.amountPaid),
        };
      }
      return cust;
    }));

    setPayments(prev => [newPayment, ...prev]);
    return newPayment;
  };

  // 5. Sync Offline Queue
  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return 0;
    const count = offlineQueue.length;
    setOrders(prev => [...offlineQueue, ...prev]);
    setOfflineQueue([]);
    setIsOffline(false);
    return count;
  };

  // Read all notifications
  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Master Data Add/Edit Handlers
  const addProduct = (p) => setProducts(prev => [...prev, { id: `PROD-${String(prev.length + 1).padStart(3, '0')}`, ...p }]);
  const addCustomer = (c) => setCustomers(prev => [...prev, { id: `CUST-${String(prev.length + 1).padStart(3, '0')}`, ...c }]);
  const addSupplier = (s) => setSuppliers(prev => [...prev, { id: `SUPP-${String(prev.length + 1).padStart(3, '0')}`, ...s }]);
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
