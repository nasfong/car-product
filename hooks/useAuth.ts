import { useState, useEffect } from 'react';

export function useAuth() {
  // Always start with false on both server and client
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Only check localStorage after component mounts (client-side only)
  // This setState in useEffect is intentional to prevent hydration mismatch
  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

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
