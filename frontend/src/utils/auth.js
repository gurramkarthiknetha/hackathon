/**
 * Authentication utilities for testing and development
 */

// Set authentication token for testing
export const setTestAuthToken = () => {
  // Use the fresh token from admin login
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGI1YWNjOWQyNjc0NmU4ZWYyMjdjODMiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NTY4MjMzODR9.6D0mDQrLZm4uC85RZWpeo8l_XjdyDxxUT6Vtsx1t7H4';
  localStorage.setItem('auth_token', testToken);
  console.log('Fresh admin authentication token set');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

// Get current auth token
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Clear authentication
export const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

// Auto-set token if not present (for development)
export const ensureAuthentication = () => {
  if (!isAuthenticated()) {
    setTestAuthToken();
  }
};
