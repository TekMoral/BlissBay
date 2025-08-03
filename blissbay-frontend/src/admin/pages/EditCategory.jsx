import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CategoryForm from '../components/CategoryForm';
import axiosInstance from '../../lib/axiosInstance';
import { Helmet } from 'react-helmet-async';

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axiosInstance.get(`/api/admin/categories/${id}`);
        if (response.data.success) {
          setCategory(response.data.data);
        } else {
          setError('Failed to load category');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'An error occurred while loading the category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <h3 className="font-semibold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/admin/categories')}
          className="mt-2 text-blue-600 hover:underline"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Category | Admin Dashboard</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <CategoryForm category={category} isEditing={true} />
      </div>
    </>
  );
};

export default EditCategory;
