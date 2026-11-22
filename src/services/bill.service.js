import api from './api';

export const getNextBillNumber = async () => {
  const response = await api.get('/bills/next-number');
  return response.data?.data?.billNumber || '';
};

export const calculateBill = async (payload) => {
  const response = await api.post('/bills/calculate', payload);
  return response.data?.data;
};

export const createBill = async (payload) => {
  const response = await api.post('/bills', payload);
  return response.data?.data;
};

export const getBills = async (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && String(val).trim() !== '' && val !== 'All') {
      cleanParams[key] = val;
    }
  });
  const response = await api.get('/bills', { params: cleanParams });
  return response.data?.data || [];
};

export const getBillById = async (id) => {
  const response = await api.get(`/bills/${id}`);
  return response.data?.data;
};

export const deleteBill = async (id) => {
  const response = await api.delete(`/bills/${id}`);
  return response.data?.data;
};

export const downloadBillPdf = async (id, billNumber = 'Invoice') => {
  const response = await api.get(`/bills/${id}/pdf`, {
    params: { download: 'true' },
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `Invoice-${billNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
};
