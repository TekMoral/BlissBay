// src/pages/EditProductPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import ProductForm from '../components/ProductForm';
import axiosInstance from '../../lib/axiosInstance';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get(`/api/admin/products/${id}`);
        console.log('API Response:', res.data);
        
        // Extract product data from response
        let productData;
        if (res.data) {
          // Based on the console error, we know the structure is {product: {...}, reviews: [...]}
          if (res.data.product) {
            productData = res.data;  // Pass the whole object with product and reviews
          } else if (res.data.data) {
            productData = res.data.data;
          } else {
            productData = res.data;
          }
        } else {
          // Handle error response
          throw new Error('Failed to fetch product data');
        }
        
        console.log('Extracted Product Data:', productData);

        // Ensure image URLs are absolute
        const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

        if (productData.images && productData.images.length > 0) {
          productData.images = productData.images.map(img =>
            img.startsWith('http') ? img : `${backendBaseUrl}${img}`
          );
        }

        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err?.response?.data?.message || 'Failed to load product data');
        toast.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle loading
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 text-lg">Loading product data...</div>
    );
  }

  // Handle error
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-md max-w-xl mx-auto mt-10 shadow">
        <h3 className="text-xl font-semibold">Error</h3>
        <p className="mt-2">{error}</p>
        <button
          onClick={() => navigate('/admin/products')}
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Handle no product found
  if (!product) {
    return (
      <div className="text-center py-10 text-gray-600">
        Product not found.
        <br />
        <button
          onClick={() => navigate('/admin/products')}
          className="mt-3 text-blue-600 hover:underline"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Render form
  return (
    <>
      <Helmet>
        <title>Edit Product | Admin Dashboard</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        <ProductForm product={product} isEditing={true} />
      </div>
    </>
  );
};

export default EditProductPage;
