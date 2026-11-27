import api from './api';

export const purchaseService = {
  getPurchases: async () => {
    return await api.get('/purchases');
  },

  createPurchase: async (purchaseData) => {
    return await api.post('/purchases', purchaseData);
  },
};

export default purchaseService;
