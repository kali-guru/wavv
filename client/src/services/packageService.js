import { api } from './api';

export const packageService = {
  // Get all packages with optional filters
  getPackages: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/packages?${queryString}` : '/packages';
    return await api.get(endpoint);
  },

  // Get single package by ID
  getPackage: async (id) => {
    return await api.get(`/packages/${id}`);
  },

  // Get popular packages
  getPopularPackages: async (limit = 6) => {
    return await api.get(`/packages/popular/${limit}`);
  },

  // Get packages by destination
  getPackagesByDestination: async (destination) => {
    return await api.get(`/packages/by-destination/${destination}`);
  },

  // Create new package (admin only)
  createPackage: async (packageData) => {
    return await api.post('/packages', packageData);
  },

  // Update package (admin only)
  updatePackage: async (id, packageData) => {
    return await api.put(`/packages/${id}`, packageData);
  },

  // Delete package (admin only)
  deletePackage: async (id) => {
    return await api.delete(`/packages/${id}`);
  }
}; 