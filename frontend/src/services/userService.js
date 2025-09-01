/**
 * User management service for API calls
 */

import api from './api';

class UserService {
  constructor() {
    this.baseURL = '/users';
  }

  /**
   * Get paginated list of users with filtering
   */
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.role && params.role !== 'all') queryParams.append('role', params.role);
      if (params.zone && params.zone !== 'all') queryParams.append('zone', params.zone);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      if (params.search) queryParams.append('search', params.search);

      const response = await api.get(`${this.baseURL}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const response = await api.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`${this.baseURL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`${this.baseURL}/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete/deactivate user
   */
  async deleteUser(userId) {
    try {
      console.log('UserService: Attempting to delete user:', userId);
      console.log('UserService: Making DELETE request to:', `${this.baseURL}/${userId}`);
      const response = await api.delete(`${this.baseURL}/${userId}`);
      console.log('UserService: Delete response:', response);
      return response.data;
    } catch (error) {
      console.error('UserService: Error deleting user:', error);
      console.error('UserService: Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  }

  /**
   * Assign user to zone
   */
  async assignUserToZone(userId, zoneName) {
    try {
      const response = await api.post(`${this.baseURL}/assign-zone`, { userId, zoneName });
      return response.data;
    } catch (error) {
      console.error('Error assigning zone:', error);
      throw error;
    }
  }

  /**
   * Get responder locations
   */
  async getResponderLocations() {
    try {
      const response = await api.get(`${this.baseURL}/responders/locations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching responder locations:', error);
      throw error;
    }
  }
}

export default new UserService();
