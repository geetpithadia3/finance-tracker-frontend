import { apiClient } from './client';

/**
 * API methods for category management
 */

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

export const categoriesApi = {
  /**
   * Get all categories
   * @returns {Promise<Array>} List of categories
   */
  getAll: async () => {
    console.log('Calling categories API: getAll()');
    try {
      const response = await apiClient.get('/categories');
      console.log('Categories API response:', response);
      return toCamel(response);
    } catch (error) {
      console.error('Categories API error:', error);
      throw error;
    }
  },
  
  /**
   * Create new category
   * @param {Object} categoryData - Category creation data
   * @returns {Promise<Object>} Created category
   */
  create: async (categoryData) => {
    console.log('Creating category:', categoryData);
    const res = await apiClient.post('/categories', toSnake(categoryData));
    return toCamel(res);
  },
  
  /**
   * Update category
   * @param {string} categoryId - Category ID to update
   * @param {Object} categoryData - Category update data
   * @returns {Promise<Object>} Updated category
   */
  update: async (categoryId, categoryData) => {
    const res = await apiClient.put(`/categories/${categoryId}`, toSnake(categoryData));
    return toCamel(res);
  },
    
  /**
   * Update category name
   * @param {string} oldName - Current category name
   * @param {string} newName - New category name
   * @returns {Promise<Object>} Updated category
   */
  updateName: async (oldName, newName) => {
    const res = await apiClient.put(`/categories/${oldName}`, toSnake({ newName }));
    return toCamel(res);
  },
    
  /**
   * Toggle category status
   * @param {string} categoryId - Category ID to toggle
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Updated category
   */
  toggleStatus: async (categoryId, isActive) => {
    const res = await apiClient.put(`/categories/${categoryId}`, toSnake({ isActive }));
    return toCamel(res);
  },

  /**
   * Get all categories in formatted structure
   * @returns {Promise<Array>} Formatted list of categories
   */
  getAllFormatted: async () => {
    const data = await apiClient.get('/categories');
    return toCamel(data).map(category => ({
      name: typeof category === 'string' ? category : category.name,
      id: typeof category === 'string' ? category : category.id
    }));
  }
};
