"use client";

import { loginAction, logoutAction } from '@/actions/auth';
import { AUTH } from '@/lib/constants';

export function useAuth() {

  const login = async () => {
    await loginAction(AUTH.admin.token);
  };

  const logout = async () => {
    await logoutAction()
  };

  return {
    login,
    logout
  };
}