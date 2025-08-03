// Custom Auth Hook
import { useAuthStore } from '../store/authStore';
import { authService } from '../services';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, signup } = useAuthStore();

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      login(response.user, response.token);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const handleSignup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      signup(response.user, response.token);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Logged out successfully!');
    } catch (error) {
      // Still logout locally even if server request fails
      logout();
      toast.success('Logged out successfully!');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
  };
};
