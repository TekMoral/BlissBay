import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../lib/axiosInstance';

export const useAdminAuth = () => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has admin role from context
        if (user.role === 'admin') {
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        // If role not in context, verify with backend
        const response = await axiosInstance.get('/api/admin/verify');
        setIsAdmin(response.data.success === true);
      } catch (error) {
        console.error('Admin verification failed:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user]);

  return {
    isAuthenticated: isAuthenticated && isAdmin,
    isLoading,
    user
  };
};