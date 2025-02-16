import apiClient from './client';

export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
  
  create: (categoryData) => {
    return apiClient.post('/categories', categoryData);
  },
  
  update: (categoryId, categoryData) => 
    apiClient.put(`/categories/${categoryId}`, categoryData),
    
  updateName: (oldName, newName) => 
    apiClient.put(`/categories/${oldName}`, { newName }),
    
  toggleStatus: (categoryId, isActive) => 
    apiClient.put(`/categories/${categoryId}`, { isActive }),

  getAllFormatted: async () => {
    const data = await apiClient.get('/categories');
    return data.map(category => ({
      name: typeof category === 'string' ? category : category.name,
      id: typeof category === 'string' ? category : category.id
    }));
  }
};
