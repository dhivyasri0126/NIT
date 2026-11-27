import api from './api';

export const masterDataService = {
  getProducts: async () => {
    return await api.get('/products');
  },

  getCustomers: async () => {
    return await api.get('/customers');
  },

  getSuppliers: async () => {
    return await api.get('/suppliers');
  },

  getMaterials: async () => {
    return await api.get('/master-data/materials');
  },

  addProduct: async (data) => {
    return await api.post('/products', data);
  },

  addCustomer: async (data) => {
    return await api.post('/customers', data);
  },

  addSupplier: async (data) => {
    return await api.post('/suppliers', data);
  },
};

export default masterDataService;
