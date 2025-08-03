import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Heart, Loader2, ChevronDown } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";

const ProductDetail = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onImageClick,
  showWishlistButton = true,
}) => {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [imageLoading, setImageLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  // State for selectable attributes
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [attributeDropdowns, setAttributeDropdowns] = useState({});
  
  // Process attributes on component mount
  useEffect(() => {
    if (product.attributes && Array.isArray(product.attributes)) {
      // Initialize selected attributes with first value
      const initialSelected = {};
      
      // Process attributes
      product.attributes.forEach(attr => {
        if (attr.name && attr.value) {
          const name = attr.name.toLowerCase();
          initialSelected[name] = attr.value;
        }
      });
      
      setSelectedAttributes(initialSelected);
    }
  }, [product.attributes]);

  const handleAttributeChange = (name, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [name.toLowerCase()]: value
    }));
  };
  
  const toggleDropdown = (attributeName) => {
    setAttributeDropdowns(prev => ({
      ...prev,
      [attributeName]: !prev[attributeName]
    }));
  };

  const calculateDiscount = () => {
    if (product.discountedPrice) {
      const discount =
        ((product.price - product.discountedPrice) / product.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const handleAddToCart = () => {
    // Check if size is selected when available
    const hasSize = product.attributes?.some(attr => 
      attr.name.toLowerCase() === 'size'
    );
    
    if (hasSize && !selectedAttributes.size) {
      toast.warning("Please select a size");
      return;
    }

    const cartItem = {
      ...product,
      selectedAttributes,
      quantity,
    };
    addToCart(cartItem);
    toast.success("Added to cart successfully");
  };

  const isOutOfStock = product.stock === 0;
  
  // Group attributes by type
  const selectableAttributes = product.attributes?.filter(attr => 
    ['color', 'size'].includes(attr.name.toLowerCase())
  ) || [];
  
  const displayAttributes = product.attributes?.filter(attr => 
    !['color', 'size'].includes(attr.name.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-8">
      {/* Image Gallery Section */}
      <div className="flex flex-col gap-4 w-full md:w-1/2">
        <div className="relative">
          {product.discountedPrice && (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md z-10">
              {calculateDiscount()}% OFF
            </span>
          )}
          {/* Main Image Container */}
          <div
            className="relative cursor-pointer group aspect-square"
            onClick={() => onImageClick(selectedImage)}
            role="button"
            tabIndex={0}
          >
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setImageLoading(false)}
              style={{ cursor: "pointer" }}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg">
              <div className="flex items-center justify-center h-full">
                <span className="text-white bg-black bg-opacity-50 px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to zoom
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {product.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedImage(img);
                setImageLoading(true);
              }}
              className={`flex-shrink-0 w-20 h-20 aspect-square border rounded-md overflow-hidden hover:opacity-80 transition-opacity duration-200
                ${selectedImage === img ? "ring-2 ring-blue-500" : ""}`}
            >
              <img
                src={img}
                alt={`${product.name} view ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.brand}</p>
          </div>
          {showWishlistButton && (
            <button
              onClick={() => onToggleWishlist(product._id)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={
                  isWishlisted ? "text-red-500 fill-red-500" : "text-gray-400"
                }
              />
            </button>
          )}
        </div>

        {/* Price Section */}
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-green-600">
            ${product.discountedPrice || product.price}
          </span>
          {product.discountedPrice && (
            <span className="text-xl text-red-500 line-through decoration-1">
              ${product.price}
            </span>
          )}
        </div>

        {/* Selectable Attributes (Color, Size) */}
        {selectableAttributes.length > 0 && (
          <div className="mt-6 space-y-4">
            {selectableAttributes.map((attr) => {
              const attributeName = attr.name.toLowerCase();
              const isOpen = attributeDropdowns[attributeName];
              const options = Array.isArray(attr.value) ? attr.value : [attr.value];
              
              return (
                <div key={attributeName} className="border rounded-md">
                  <button
                    type="button"
                    onClick={() => toggleDropdown(attributeName)}
                    className="w-full flex justify-between items-center px-4 py-2 text-left"
                  >
                    <span className="font-medium capitalize">{attr.name}</span>
                    <span className="flex items-center">
                      <span className="mr-2 text-gray-600">
                        {selectedAttributes[attributeName] || "Select"}
                      </span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="border-t p-2">
                      <div className="grid grid-cols-3 gap-2">
                        {options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleAttributeChange(attributeName, option)}
                            className={`py-2 px-3 text-sm font-medium rounded-md border
                              ${selectedAttributes[attributeName] === option
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 text-gray-900 hover:border-blue-500"
                              }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quantity Selector */}
        <div className="mt-6">
          <label
            htmlFor="quantity"
            className="text-sm font-medium text-gray-700"
          >
            Quantity
          </label>
          <div className="flex items-center mt-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 border rounded-l-md hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="number"
              id="quantity"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(product.stock, Math.max(1, parseInt(e.target.value)))
                )
              }
              className="w-16 text-center border-t border-b"
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="px-3 py-1 border rounded-r-md hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-6 w-full py-3 px-4 rounded-md font-semibold text-white
            ${
              isOutOfStock
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>

        {/* Product Details */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
          <div className="mt-4 prose prose-sm text-gray-500">
            <p>{product.description}</p>
          </div>
        </div>

        {/* Display Attributes (non-selectable) */}
        {displayAttributes.length > 0 && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Additional Information
            </h3>
            <dl className="mt-4 space-y-4">
              {displayAttributes.map((attr, index) => (
                <div key={index} className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500 capitalize">
                    {attr.name}
                  </dt>
                  <dd className="text-sm text-gray-900">{attr.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

ProductDetail.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    discountedPrice: PropTypes.number,
    brand: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    stock: PropTypes.number,
    attributes: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string)
        ]).isRequired
      })
    ),
  }).isRequired,
  isWishlisted: PropTypes.bool.isRequired,
  onToggleWishlist: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
  showWishlistButton: PropTypes.bool,
};

export default ProductDetail;