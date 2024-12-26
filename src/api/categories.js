import apiClient from './client';

export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
  
  update: (categoryId, categoryData) => 
    apiClient.put(`/categories/${categoryId}`, categoryData),
    
  updateName: (oldName, newName) => 
    apiClient.put(`/categories/${oldName}`, { newName }),
    
  toggleStatus: (categoryId, categoryData) => 
    apiClient.put(`/categories/${categoryId}`, categoryData)
};
