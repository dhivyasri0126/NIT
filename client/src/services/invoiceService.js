import api from './api';

export const invoiceService = {
  getInvoices: async () => {
    return await api.get('/invoices');
  },

  getInvoiceById: async (id) => {
    return await api.get(`/invoices/${id}`);
  },

  generateInvoice: async (orderId) => {
    return await api.post('/invoices', { orderId });
  },

  generateFromOrder: async (orderId) => {
    return await api.post('/invoices/generate-from-order', { orderId });
  },
};

export default invoiceService;
