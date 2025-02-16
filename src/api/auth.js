import apiClient from './client';

export const authApi = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response;
  },
  
  register: async (username, password) => {
    const response = await apiClient.post('/auth/register', { username, password });
    return response;
  },
};
