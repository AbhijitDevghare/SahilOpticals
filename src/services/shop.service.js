import api from './api';

export const getShopSettings = async () => {
  const response = await api.get('/shop');
  return response.data?.data;
};

export const updateShopSettings = async (payload) => {
  const response = await api.put('/shop', payload);
  return response.data?.data;
};
