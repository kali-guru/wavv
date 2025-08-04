import { api } from './api';

export const reviewService = {
  // Create a new review
  createReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  },

  // Get reviews for a specific package
  getPackageReviews: async (packageId, filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reviews/package/${packageId}?${queryString}` : `/reviews/package/${packageId}`;
    return await api.get(endpoint);
  },

  // Get user's reviews
  getMyReviews: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reviews/my-reviews?${queryString}` : '/reviews/my-reviews';
    return await api.get(endpoint);
  },

  // Get recent reviews
  getRecentReviews: async (limit = 10) => {
    return await api.get(`/reviews/recent/${limit}`);
  },

  // Update user's review
  updateReview: async (id, reviewData) => {
    return await api.put(`/reviews/${id}`, reviewData);
  },

  // Delete user's review
  deleteReview: async (id) => {
    return await api.delete(`/reviews/${id}`);
  }
}; 