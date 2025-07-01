import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      // Verify token is still valid by making a test request
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(response => {
        console.log("response", response);
        if (!response.ok) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          setUser(null);
          setIsAuthenticated(false);
          window.location.href = '/login';
        } else {
          setUser({ username, token });
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      }).catch(() => {
        console.log("error");
        // Network error or other issue
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};