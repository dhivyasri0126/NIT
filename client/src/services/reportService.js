import api from './api';

export const reportService = {
  getSalesRegister: async (params = {}) => {
    return await api.get('/reports/sales', { params });
  },

  getPurchaseRegister: async () => {
    return await api.get('/reports/purchases');
  },

  getInventoryReport: async () => {
    return await api.get('/reports/inventory');
  },

  getProductionReport: async () => {
    return await api.get('/reports/production');
  },

  getGSTSummary: async () => {
    return await api.get('/reports/gst-summary');
  },

  getStockSummary: async () => {
    return await api.get('/reports/stock-summary');
  },

  getVarianceReport: async () => {
    return await api.get('/reports/variance');
  },

  getProductProfitability: async () => {
    return await api.get('/reports/costing');
  },

  getAuditLogs: async () => {
    return await api.get('/reports/audit-logs');
  },
};

export default reportService;
