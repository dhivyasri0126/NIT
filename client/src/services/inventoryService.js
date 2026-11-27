import api from './api';

export const inventoryService = {
  getItems: async () => {
    return await api.get('/inventory/items');
  },

  getRawMaterials: async () => {
    return await api.get('/inventory/raw-materials');
  },

  getPackagingMaterials: async () => {
    return await api.get('/inventory/packaging');
  },

  getFinishedGoods: async () => {
    return await api.get('/inventory/finished-goods');
  },

  getLedger: async (params = {}) => {
    return await api.get('/inventory/ledger', { params });
  },

  recordAdjustment: async (adjustmentData) => {
    return await api.post('/inventory/adjustments', adjustmentData);
  },
};

export default inventoryService;
