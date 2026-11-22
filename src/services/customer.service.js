import api from './api';

export const getCustomers = async (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      cleanParams[key] = val;
    }
  });
  const response = await api.get('/customers', { params: cleanParams });
  return response.data?.data || [];
};

export const lookupCustomerByMobile = async (mobile) => {
  const clean = encodeURIComponent(String(mobile || '').trim());
  const response = await api.get(`/customers/mobile/${clean}`);
  return response.data?.data || { found: false, customer: null, latestPrescription: null };
};

export const getCustomerHistory = async (id) => {
  const response = await api.get(`/customers/${id}/bills`);
  return response.data?.data;
};

export const createCustomer = async (payload) => {
  const response = await api.post('/customers', payload);
  return {
    data: response.data?.data,
    message: response.data?.message || 'Customer saved successfully',
  };
};

export const updateCustomer = async (id, payload) => {
  const response = await api.put(`/customers/${id}`, payload);
  return response.data?.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data?.data;
};
