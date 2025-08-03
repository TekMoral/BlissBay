import { createContext, useContext, useReducer, useRef, useCallback } from 'react';
import axiosInstance from '../../lib/axiosInstance';

const AdminDataContext = createContext();

// Reducer for managing categories state
const categoriesReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_SUCCESS':
      return {
        categories: action.payload,
        loading: false,
        error: null,
        lastFetched: new Date()
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        categories: []
      };
    case 'RESET':
      return {
        categories: [],
        loading: false,
        error: null,
        lastFetched: null
      };
    default:
      return state;
  }
};

const initialState = {
  categories: [],
  loading: false,
  error: null,
  lastFetched: null
};

export function AdminDataProvider({ children }) {
  const [categoriesData, dispatch] = useReducer(categoriesReducer, initialState);
  
  // Use ref to track ongoing requests to prevent duplicate calls
  const fetchingRef = useRef(false);
  
  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;
  
  const fetchCategories = useCallback(async (forceRefresh = false) => {
    // Prevent duplicate concurrent requests
    if (fetchingRef.current && !forceRefresh) {
      return categoriesData.categories;
    }
    
    // Check cache validity
    if (!forceRefresh && categoriesData.categories.length > 0 && categoriesData.lastFetched) {
      const cacheExpiry = new Date(categoriesData.lastFetched.getTime() + CACHE_DURATION);
      if (new Date() < cacheExpiry) {
        return categoriesData.categories;
      }
    }
    
    fetchingRef.current = true;
    dispatch({ type: 'FETCH_START' });
    
    try {
      // Option 1: If your API supports batch fetching with details
      const response = await axiosInstance.get('/api/admin/categories?includeDetails=true');
      
      if (response.data.success && response.data.categories) {
        dispatch({ type: 'FETCH_SUCCESS', payload: response.data.categories });
        return response.data.categories;
      }
      
      // Option 2: If you must fetch individually, use Promise.allSettled for better performance
      const listResponse = await axiosInstance.get('/api/admin/categories');
      
      if (listResponse.data.success && listResponse.data.categories) {
        const categoryPromises = listResponse.data.categories.map(async (category) => {
          try {
            const detailResponse = await axiosInstance.get(`/api/admin/categories/${category._id}`);
            return detailResponse.data.success && detailResponse.data.data 
              ? detailResponse.data.data 
              : category;
          } catch (error) {
            console.error(`Error fetching details for category ${category._id}:`, error);
            return category; // Return basic category data if detail fetch fails
          }
        });
        
        // Wait for all requests to complete (even if some fail)
        const results = await Promise.allSettled(categoryPromises);
        const detailedCategories = results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
        
        dispatch({ type: 'FETCH_SUCCESS', payload: detailedCategories });
        return detailedCategories;
      } else {
        throw new Error('Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      dispatch({ type: 'FETCH_ERROR', payload: `Error fetching categories: ${errorMessage}` });
      return [];
    } finally {
      fetchingRef.current = false;
    }
  }, []); // Empty dependency array - stable reference
  
  // Additional helper functions for better UX
  const refreshCategories = useCallback(() => {
    return fetchCategories(true);
  }, [fetchCategories]);
  
  const clearCategories = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  
  // Memoized context value to prevent unnecessary re-renders
  const contextValue = {
    categoriesData,
    fetchCategories,
    refreshCategories,
    clearCategories,
    // Helper getters for common use cases
    isLoading: categoriesData.loading,
    hasError: !!categoriesData.error,
    hasCategories: categoriesData.categories.length > 0,
    isCacheValid: categoriesData.lastFetched && 
      (new Date() - categoriesData.lastFetched) < CACHE_DURATION
  };
  
  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
}