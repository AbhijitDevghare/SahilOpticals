import api from './api';

export const getReports = async (params = {}) => {
  const cleanParams = {};
  if (params.startDate) cleanParams.startDate = params.startDate;
  if (params.endDate) cleanParams.endDate = params.endDate;
  const response = await api.get('/reports', { params: cleanParams });
  return response.data?.data;
};
