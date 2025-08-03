import api from './api.js';

// Categories (Admin)
export const adminGetCategories = () => api.get('/admin/categories');
export const adminCreateCategory = (data) => api.post('/admin/categories', data);
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// Orders (Admin)
export const adminGetOrders = () => api.get('/admin/orders');
export const adminGetOrderById = (id) => api.get(`/admin/orders/${id}`);
export const adminUpdateOrder = (id, data) => api.put(`/admin/orders/${id}`, data);
export const adminDeleteOrder = (id) => api.delete(`/admin/orders/${id}`);

// Products (Admin)
export const adminGetProducts = () => api.get('/admin/products');
export const adminCreateProduct = (data) => api.post('/admin/products', data);
export const adminUpdateProduct = (id, data) => api.put(`/admin/products/${id}`, data);
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const adminGetProductsByFlag = (flag) => api.get(`/admin/products/flag/${flag}`);

// Reviews (Admin)
export const adminGetReviews = () => api.get('/admin/reviews');
export const adminUpdateReview = (id, data) => api.put(`/admin/reviews/${id}`, data);
export const adminDeleteReview = (id) => api.delete(`/admin/reviews/${id}`);

// Users (Admin)
export const adminGetUsers = () => api.get('/admin/users');
export const adminCreateUser = (data) => api.post('/admin/users', data);
export const adminUpdateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}`);

// Dashboard (Admin)
export const adminGetDashboardData = () => api.get('/admin/dashboard');

// Auth & Users
export const registerUser = (data) => api.post('/users/register', data);
export const loginUser = (data) => api.post('/users/login', data);
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const changePassword = (data) => api.put('/users/change-password', data);
export const forgotPassword = (data) => api.post('/users/forgot-password', data);
export const resetPassword = (data) => api.post('/users/reset-password', data);
export const deleteAccount = () => api.delete('/users/delete-account');

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const getProductsByFlag = (flag) => api.get(`/products/flag/${flag}`);

// Categories
export const getCategories = () => api.get('/categories');

// Cart
export const getCart = () => api.get('/carts');
export const addToCart = (item) => api.post('/carts', item);
export const updateCartItem = (itemId, item) => api.put(`/carts/${itemId}`, item);
export const removeCartItem = (itemId) => api.delete(`/carts/${itemId}`);

// Reviews
export const createReview = (review) => api.post('/reviews', review);
export const getReviewsByProduct = (productId) => api.get(`/reviews/product/${productId}`);
export const updateReview = (reviewId, review) => api.put(`/reviews/${reviewId}`, review);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);

// Comments
export const createComment = (comment) => api.post('/comments', comment);
export const getCommentsByReview = (reviewId) => api.get(`/comments/review/${reviewId}`);
export const updateComment = (commentId, comment) => api.put(`/comments/${commentId}`, comment);
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);

// Addresses
export const getAddresses = () => api.get('/addresses');
export const createAddress = (address) => api.post('/addresses', address);
export const updateAddress = (id, address) => api.put(`/addresses/${id}`, address);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);
export const setDefaultAddress = (id) => api.put(`/addresses/default/${id}`);

// Payments
export const checkout = (data) => api.post('/payments/checkout', data);

// Orders
export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);

// Wishlist
export const getWishlist = () => api.get('/wishlists');
export const addToWishlist = (data) => api.post('/wishlists', data);
export const removeFromWishlist = (productId) => api.delete(`/wishlists/${productId}`);

// Discounts
export const getDiscounts = () => api.get('/discounts');
export const applyDiscount = (data) => api.post('/discounts/apply', data);