// Authentication Service
import api from './api';
import { API_ENDPOINTS } from '../constants';

export const authService = {
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
    return response.data;
  },
};
