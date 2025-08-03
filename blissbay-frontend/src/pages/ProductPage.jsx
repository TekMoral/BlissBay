// ProductPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { toast } from "react-toastify";
import ProductDetail from "../components/product/ProductDetail";
import ReviewCard from "../components/product/ReviewCard";
import { Loader2, X } from "lucide-react";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);


  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(`/api/products/${id}`);
      console.log("Product data:", res.data.product);

      // Process the product data to ensure image URLs are complete
      const productData = res.data.product;
      const backendBaseUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      if (productData.images && productData.images.length > 0) {
        productData.images = productData.images.map((img) =>
          img.startsWith("http") ? img : `${backendBaseUrl}${img}`
        );
      }

      setProduct(productData);
      setReviews(res.data.reviews || []);
      setIsWishlisted(productData.isWishlisted || false);

      // Set initial selected image with complete URL
      if (productData.images && productData.images.length > 0) {
        setSelectedImage(productData.images[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch product");
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (productId) => {
    try {
      if (isWishlisted) {
        await axiosInstance.delete(`/api/wishlist/${productId}`);
        toast.success("Removed from wishlist");
      } else {
        await axiosInstance.post(`/api/wishlist/${productId}`);
        toast.success("Added to wishlist");
      }
      setIsWishlisted((prev) => !prev);
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async (productId, selectedVariant, quantity) => {
    try {
      await axiosInstance.post(`/api/cart`, {
        productId,
        variantId: selectedVariant,
        quantity,
      });
      toast.success("Added to cart successfully!");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  // handler for opening the modal
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => fetchProduct()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail
        product={product}
        isWishlisted={isWishlisted}
        onToggleWishlist={handleToggleWishlist}
        onImageClick={handleImageClick}
        onAddToCart={handleAddToCart}
      />

      {/* Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsModalOpen(false);
            setIsZoomed(false);
          }}
        >
          <div className="relative max-w-screen-xl max-h-screen">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
                setIsZoomed(false);
              }}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image */}
            <div className="overflow-hidden">
              <img
                src={selectedImage}
                alt={product.name}
                className={`max-h-screen max-w-full object-contain transition-transform duration-300
                  ${isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(!isZoomed);
                }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet</p>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
