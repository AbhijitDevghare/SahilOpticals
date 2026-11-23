import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'sahil_optical_token';
export const UNAUTHORIZED_EVENT = 'sahil:unauthorized';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

export const getAuthToken = () => {
  try {
    return (
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      sessionStorage.getItem(TOKEN_STORAGE_KEY)
    );
  } catch {
    return null;
  }
};

export const setAuthToken = (token, rememberMe = true) => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    if (token) {
      if (rememberMe) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
    }
  } catch {
    // Ignore storage errors
  }
};

export const isPersistentSession = () => {
  try {
    return Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
  } catch {
    return true;
  }
};

export const clearAuthToken = () => {
  setAuthToken(null);
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;
  if (error.response?.data?.message) {
    const errors = error.response.data.errors;
    if (Array.isArray(errors) && errors.length > 0 && errors[0] !== error.response.data.message) {
      return `${error.response.data.message}: ${errors.join(', ')}`;
    }
    return error.response.data.message;
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please check if the backend server is running.';
  }
  if (error.message === 'Network Error') {
    return 'Unable to connect to the backend server. Please verify it is running on port 5000.';
  }
  return error.message || fallback;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401 && !requestUrl.includes('/auth/login')) {
      clearAuthToken();
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  }
);

export default api;
