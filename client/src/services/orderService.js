import api from './api';

export const orderService = {
  getOrders: async (params = {}) => {
    return await api.get('/orders', { params });
  },

  getOrderById: async (id) => {
    return await api.get(`/orders/${id}`);
  },

  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  approveOrder: async (id) => {
    return await api.put(`/orders/${id}/approve`);
  },

  rejectOrder: async (id, reason) => {
    return await api.put(`/orders/${id}/reject`, { reason });
  },

  dispatchOrder: async (id, dispatchDetails = {}) => {
    return await api.put(`/orders/${id}/dispatch`, dispatchDetails);
  },

  syncOfflineOrders: async (orders) => {
    return await api.post('/orders/sync', { orders });
  },
};

export default orderService;
