import { apiClient } from './client';

/**
 * API methods for category management
 */
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
      return response;
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
  create: (categoryData) => {
    console.log('Creating category:', categoryData);
    return apiClient.post('/categories', categoryData);
  },
  
  /**
   * Update category
   * @param {string} categoryId - Category ID to update
   * @param {Object} categoryData - Category update data
   * @returns {Promise<Object>} Updated category
   */
  update: (categoryId, categoryData) => 
    apiClient.put(`/categories/${categoryId}`, categoryData),
    
  /**
   * Update category name
   * @param {string} oldName - Current category name
   * @param {string} newName - New category name
   * @returns {Promise<Object>} Updated category
   */
  updateName: (oldName, newName) => 
    apiClient.put(`/categories/${oldName}`, { newName }),
    
  /**
   * Toggle category status
   * @param {string} categoryId - Category ID to toggle
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Updated category
   */
  toggleStatus: (categoryId, isActive) => 
    apiClient.put(`/categories/${categoryId}`, { isActive }),

  /**
   * Get all categories in formatted structure
   * @returns {Promise<Array>} Formatted list of categories
   */
  getAllFormatted: async () => {
    const data = await apiClient.get('/categories');
    return data.map(category => ({
      name: typeof category === 'string' ? category : category.name,
      id: typeof category === 'string' ? category : category.id
    }));
  }
};
