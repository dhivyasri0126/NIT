import api from './api';

export const authService = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  refreshToken: async (refreshToken) => {
    return await api.post('/auth/refresh-token', { refreshToken });
  },

  logout: () => {
    localStorage.removeItem('sri_murukku_token');
    localStorage.removeItem('sri_murukku_user');
    localStorage.removeItem('sri_murukku_role');
  },
};

export default authService;
