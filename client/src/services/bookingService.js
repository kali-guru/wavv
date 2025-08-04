import { api } from './api';

export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    return await api.post('/bookings', bookingData);
  },

  // Get user's bookings
  getMyBookings: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/bookings/my-bookings?${queryString}` : '/bookings/my-bookings';
    return await api.get(endpoint);
  },

  // Get single booking by ID
  getBooking: async (id) => {
    return await api.get(`/bookings/${id}`);
  },

  // Update booking status
  updateBookingStatus: async (id, status) => {
    return await api.patch(`/bookings/${id}/status`, { status });
  },

  // Cancel booking
  cancelBooking: async (id) => {
    return await api.post(`/bookings/${id}/cancel`);
  },

  // Get booking statistics for user
  getBookingStats: async () => {
    return await api.get('/bookings/stats/user');
  }
}; 