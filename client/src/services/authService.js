import { api, setAuthToken } from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  // Logout user
  logout: () => {
    setAuthToken(null);
  },

  // Get current user profile
  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put('/auth/change-password', passwordData);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
}; 