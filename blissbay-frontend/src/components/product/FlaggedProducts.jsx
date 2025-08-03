// components/product/FlaggedProducts.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import HorizontalScroll from '../UI/HorizontalScroll';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getProductsByFlag, addToWishlist } from '../../api/endpoints';

const FlaggedProducts = ({ flag, title }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, openLoginModal } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [flag]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProductsByFlag(flag);
      setProducts(response.data.data || []);
    } catch (err) {
      console.error(`Error fetching ${flag} products:`, err);
      setError(`Failed to load ${flag} products`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      showToast('warning', 'Please login to manage wishlist');
      openLoginModal();
      return;
    }

    try {
      const updatedProducts = [...products];
      const index = updatedProducts.findIndex(p => p._id === productId);
      
      if (index !== -1) {
        const product = updatedProducts[index];
        await addToWishlist({ productId });
        updatedProducts[index] = {
          ...product,
          isWishlisted: !product.isWishlisted
        };
        setProducts(updatedProducts);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      showToast('error', 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      showToast('warning', 'Please login to add items to cart');
      openLoginModal();
      return;
    }

    try {
      const product = products.find(p => p._id === productId);
      await addToCart(product);
      showToast('success', 'Product added to cart successfully!');
    } catch (err) {
      console.error('Add to cart error:', err);
      showToast('error', 'Failed to add item to cart');
    }
  };

  const renderProduct = (product) => (
    <ProductCard
      key={product._id}
      product={product}
      isWishlisted={product.isWishlisted}
      onToggleWishlist={handleToggleWishlist}
      onAddToCart={handleAddToCart}
      showWishlistButton={true}
    />
  );

  return (
    <HorizontalScroll
      title={title}
      items={products}
      renderItem={renderProduct}
      loading={loading}
      error={error}
    />
  );
};

export default FlaggedProducts;