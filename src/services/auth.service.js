import api, {
  clearAuthToken,
  getAuthToken,
  isPersistentSession,
  setAuthToken,
} from './api';

export const loginRequest = async ({ username, password, rememberMe = true }) => {
  const response = await api.post('/auth/login', {
    username: String(username || '').trim().toLowerCase(),
    password: String(password || ''),
  });

  const payload = response.data?.data;
  if (!payload?.token || !payload?.user) {
    throw new Error('Invalid authentication response from server');
  }

  setAuthToken(payload.token, rememberMe);
  return payload;
};

export const getCurrentUserRequest = async () => {
  const token = getAuthToken();
  if (!token) return null;

  const response = await api.get('/auth/me');
  return response.data?.data || null;
};

export const updateCredentialsRequest = async (payload) => {
  const response = await api.put('/auth/credentials', payload);
  const data = response.data?.data;
  if (data?.token) {
    setAuthToken(data.token, isPersistentSession());
  }
  return data;
};

export const logoutRequest = async () => {
  try {
    if (getAuthToken()) {
      await api.post('/auth/logout');
    }
  } catch {
    // Clear client session even if server logout call fails
  } finally {
    clearAuthToken();
  }
};
