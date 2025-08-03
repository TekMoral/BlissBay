import axiosInstance from '../../lib/axiosInstance';

// Get all products with pagination, search, and filters
export const getProducts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/admin/products', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/admin/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post('/api/admin/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (id, productData) => {
  try {
    const response = await axiosInstance.put(`/api/admin/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create multiple products at once (bulk import)
export const createManyProducts = async (productsData) => {
  try {
    const response = await axiosInstance.post('/api/admin/products/bulk', productsData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get product statistics
export const getProductStats = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/products/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get product categories
export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createManyProducts,
  getProductStats,
  getCategories
};