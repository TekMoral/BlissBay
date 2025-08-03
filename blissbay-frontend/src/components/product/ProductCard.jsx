import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Heart, Loader2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance'

const ProductCard = ({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart = () => {},
  showWishlistButton = true,
  isAuthenticated = false
}) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (isAuthenticated) {
      onToggleWishlist(product._id);
    } else {
      const shouldLogin = window.confirm('Please login to add items to your wishlist. Would you like to login?');
      if (shouldLogin) {
        navigate('/login');
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    try {
      await onAddToCart(product);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCardClick = () => {
    setIsNavigating(true);
    navigate(`/products/${product._id}`);
  };

  const calculateDiscount = () => {
    if (product.price && product.discountedPrice && product.price > product.discountedPrice) {
      const discount = ((product.price - product.discountedPrice) / product.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

const getImageUrl = () => {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const imagePath = product?.images?.[0];

  return imagePath
    ? `${backendBaseUrl}${imagePath}`
    : '/images/product-placeholder.png';
};



  // Helper function to get display price
  const getDisplayPrice = () => {
    return product.discountedPrice || product.price || 0;
  };

  // Check if there's a valid discount
  const hasDiscount = () => {
    return product.price && product.discountedPrice && product.price > product.discountedPrice;
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 w-[280px] border border-transparent hover:border-blue-500 cursor-pointer relative transform hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50 rounded-lg">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full h-[280px] overflow-hidden rounded-t-lg bg-gray-100 flex-shrink-0">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        )}
        <img
          src={getImageUrl()}
          alt={product.name || 'Product image'}
          className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            setImageLoading(false);
            e.target.src = '/images/product-placeholder.png';
            e.target.onerror = null;
          }}
        />
        
        {/* Discount Badge */}
        {calculateDiscount() > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            -{calculateDiscount()}%
          </div>
        )}

        {showWishlistButton && (
          <button
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform duration-200 z-10 hover:bg-gray-50"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? "text-red-500" : "text-gray-400"
              }`}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>
        )}
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white font-medium px-4 py-2 rounded-md bg-black/50">
            View Details
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-blue-600 transition-colors duration-300">
            {product.name || 'Unknown Product'}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 overflow-hidden text-ellipsis whitespace-nowrap">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xl font-bold text-green-600">
              ${getDisplayPrice().toFixed(2)}
            </span>
            {hasDiscount() && (
              <span className="text-sm text-red-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button - Always at bottom */}
        <div className="mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center justify-center gap-2 disabled:bg-blue-400"
          >
            {isAddingToCart ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    discountedPrice: PropTypes.number,
    price: PropTypes.number.isRequired,
    brand: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isWishlisted: PropTypes.bool,
  onToggleWishlist: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func,
  showWishlistButton: PropTypes.bool,
  isAuthenticated: PropTypes.bool
};

export default ProductCard;















