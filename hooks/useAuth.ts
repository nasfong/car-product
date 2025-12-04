import { useState } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('admin-token');
    return !!token;
  });

  const logout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      localStorage.removeItem('admin-token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const login = () => {
    setIsAuthenticated(true);
  };

  return {
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
  };
}
