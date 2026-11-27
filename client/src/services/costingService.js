import api from './api';

export const costingService = {
  getProductCosting: async (productId, params = {}) => {
    return await api.get(`/costing/products/${productId}`, { params });
  },

  getRunCosting: async (runId) => {
    return await api.get(`/costing/runs/${runId}`);
  },
};

export default costingService;
