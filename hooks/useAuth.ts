"use client";

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on client mount
    const token = localStorage.getItem('admin-token');
    const cookieToken = Cookies.get('admin-token');
    setIsAuthenticated(!!(token || cookieToken));
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('admin-token');
    Cookies.remove('admin-token');
    setIsAuthenticated(false);
  };

  return { 
    isAuthenticated, 
    login, 
    logout,
    setIsAuthenticated // Export this so it can be set from server state
  };
}