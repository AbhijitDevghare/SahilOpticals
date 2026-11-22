import { createContext, useEffect, useState, useCallback } from 'react';
import {
  loginRequest,
  logoutRequest,
  getCurrentUserRequest,
  updateCredentialsRequest,
} from '../services/auth.service';
import {
  clearAuthToken,
  getApiErrorMessage,
  getAuthToken,
  UNAUTHORIZED_EVENT,
} from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const token = getAuthToken();
      if (!token) {
        if (active) {
          setUser(null);
          setIsInitializing(false);
        }
        return;
      }

      try {
        const verifiedUser = await getCurrentUserRequest();
        if (active) {
          setUser(verifiedUser);
        }
      } catch {
        clearAuthToken();
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    };

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    verifySession();

    return () => {
      active = false;
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(async ({ username, password, rememberMe = true }) => {
    try {
      const result = await loginRequest({ username, password, rememberMe });
      setUser(result.user);
      return result;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid username or password'));
    }
  }, []);

  const updateCredentials = useCallback(async (payload) => {
    try {
      const result = await updateCredentialsRequest(payload);
      if (result?.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update account credentials'));
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        login,
        updateCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
