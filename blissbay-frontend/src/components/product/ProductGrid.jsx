import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../lib/axiosInstance';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';

const ProductGrid = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all'
  });
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories with proper error handling
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);


      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
      setError('Failed to load categories. Please refresh the page.');
    }
  }, []);

  // Optimized fetchProducts function
  const fetchProducts = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pageNumber,
        limit: 12,
      };



     // Only add filters if they're not set to 'all'
    if (filters.category && filters.category !== 'all') {
      params.category = filters.category;
    }

    if (filters.priceRange && filters.priceRange !== 'all') {
      params.priceRange = filters.priceRange;
    }

    if (sortBy && sortBy !== 'default') {
      params.sortBy = sortBy;
    }


      



      const response = await axiosInstance.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`, { 
        params,
        // Add this to see the actual request URL in console
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });

      


      const { products: newProducts, totalProducts: total, hasMore: backendHasMore } = response.data;

      if (!Array.isArray(newProducts)) {
        throw new Error('Invalid response format: products is not an array');
      }

      setProducts(prev => pageNumber === 1 ? newProducts : [...prev, ...newProducts]);
      setTotalProducts(total);
      setHasMore(typeof backendHasMore === 'boolean' ? backendHasMore : (newProducts.length === 12));
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]); // Removed products dependency

  // Optimized filter change handler
  const handleFilterChange = useCallback((filterType, value) => {
    console.log(`Filter changed: ${filterType} = ${value}`);
    setProducts([]); // Clear existing products
    setPage(1); // Reset to first page
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Optimized sort change handler
  const handleSortChange = useCallback((value) => {
    console.log(`Sort changed to: ${value}`);
    setProducts([]); // Clear existing products
    setPage(1); // Reset to first page
    setSortBy(value);
  }, []);

  // Optimized load more handler
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  // Initial categories fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Effect for filters/sort changes
  useEffect(() => {
    fetchProducts(1);
  }, [filters, sortBy, fetchProducts]);

  // Effect for page changes (load more)
  useEffect(() => {
    if (page > 1) {
      console.log('Loading more products, page:', page);
      fetchProducts(page);
    }
  }, [page, fetchProducts]);

  // Example handlers for wishlist/cart
  const handleToggleWishlist = useCallback((productId) => {
    console.log('Toggle wishlist:', productId);
    // Implement your wishlist logic here
  }, []);

  const handleAddToCart = useCallback(async (product) => {
    console.log('Add to cart:', product.name);
    // Implement your add to cart logic here
  }, []);


return (
  <div className="container mx-auto">
    {/* Filters Section - Full width at top */}
    <div className="w-full mb-8">
      <ProductFilters
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        isLoading={loading}
      />
    </div>

    {/* Main Content */}
    <div className="px-4">
      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-center py-4 mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            disabled={loading}
          />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8" role="status">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!products || products.length === 0) && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && products.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={loading}
          >
            Load More Products
          </button>
        </div>
      )}

      {/* Products Count */}
      {products.length > 0 && (
        <div className="text-center mt-6 text-gray-600">
          Showing {products.length} of {totalProducts} products
        </div>
      )}
    </div>
  </div>
);

};

export default ProductGrid;
