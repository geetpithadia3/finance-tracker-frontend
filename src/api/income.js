import { apiClient } from './client';

// Utility functions for snake_case <-> camelCase mapping
function toSnake(obj) {
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
        toSnake(v)
      ])
    );
  }
  return obj;
}

function toCamel(obj) {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, g => g[1].toUpperCase()),
        toCamel(v)
      ])
    );
  }
  return obj;
}

export const incomeApi = {
  getSources: async () => {
    const res = await apiClient.get('/income-sources');
    return toCamel(res);
  },
  
  create: async (incomeData) => {
    const res = await apiClient.post('/income-sources', toSnake(incomeData));
    return toCamel(res);
  },
  
  update: async (incomeId, incomeData) => {
    const res = await apiClient.put(`/income-sources/${incomeId}`, toSnake(incomeData));
    return toCamel(res);
  },
    
  delete: async (incomeId) => {
    const res = await apiClient.delete(`/income-sources/${incomeId}`);
    return toCamel(res);
  }
};
