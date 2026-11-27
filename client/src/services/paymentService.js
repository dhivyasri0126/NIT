import api from './api';

export const paymentService = {
  getPayments: async () => {
    return await api.get('/payments');
  },

  recordPayment: async (paymentData) => {
    return await api.post('/payments', paymentData);
  },

  getReceivables: async () => {
    return await api.get('/payments/receivables');
  },

  getAgeing: async () => {
    return await api.get('/payments/ageing');
  },

  getCustomerHistory: async (customerId) => {
    return await api.get(`/payments/customers/${customerId}`);
  },
};

export default paymentService;
