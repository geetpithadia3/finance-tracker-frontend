import { sessionManager } from './session';

export const getAuthHeaders = () => {
  const token = sessionManager.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};