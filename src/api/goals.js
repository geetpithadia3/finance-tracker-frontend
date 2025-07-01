import { apiClient } from './client';

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

const updateStatus = (goalId, status) =>
  apiClient.put(`/goals/${goalId}/status?status=${status}`);

export const goalsApi = {
  // Create a new goal (optionally with a temporary category)
  create: async (goalData) => {
    // Ensure snake_case and correct types
    const payload = toSnake(goalData);
    if (payload.deadline === '') payload.deadline = null;
    const res = await apiClient.post('/goals', payload);
    return toCamel(res);
  },

  // Get all goals for the current user
  getAll: async () => {
    const res = await apiClient.get('/goals');
    return toCamel(res);
  },

  // Update a goal
  update: async (goalId, goalData) => {
    const payload = toSnake(goalData);
    if (payload.deadline === '') payload.deadline = null;
    const res = await apiClient.put(`/goals/${goalId}`, payload);
    return toCamel(res);
  },

  // Delete a goal (optionally delete the temp category)
  delete: async (goalId, deleteTempCategory = false) => {
    const res = await apiClient.delete(`/goals/${goalId}?delete_temp_category=${deleteTempCategory}`);
    return toCamel(res);
  },

  updateStatus,
}; 