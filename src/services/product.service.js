import api from './api';

export const getProducts = async (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && String(val).trim() !== '' && val !== 'All') {
      cleanParams[key] = val;
    }
  });
  const response = await api.get('/products', { params: cleanParams });
  return response.data?.data || [];
};

export const getProductCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data?.data || [];
};

export const createProduct = async (payload) => {
  const response = await api.post('/products', payload);
  return response.data?.data;
};

export const updateProduct = async (id, payload) => {
  const response = await api.put(`/products/${id}`, payload);
  return response.data?.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data?.data;
};
