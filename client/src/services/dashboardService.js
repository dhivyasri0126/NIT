import api from './api';

export const dashboardService = {
  getSummary: async () => {
    return await api.get('/dashboard/summary');
  },
};

export default dashboardService;
