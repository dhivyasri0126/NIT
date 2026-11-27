import api from './api';

export const productionService = {
  getProductionRuns: async () => {
    return await api.get('/production/runs');
  },

  getProductionRunById: async (id) => {
    return await api.get(`/production/runs/${id}`);
  },

  createProductionRun: async (runData) => {
    return await api.post('/production/runs', runData);
  },

  getBOM: async (productId) => {
    return await api.get(`/production/boms/${productId}`);
  },
};

export default productionService;
