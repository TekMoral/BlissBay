// src/admin/components/CategoryList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../lib/axiosInstance';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, categoryName, isLoading }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
        <p className="mb-6">
          Are you sure you want to delete the category <span className="font-semibold">{categoryName}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDisabled, setDeleteDisabled] = useState({});
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: ''
  });

const fetchCategories = async () => {
  try {
    setLoading(true);
    
    // A single request that returns all needed data
    const response = await axiosInstance.get('/api/admin/categories', {
      headers: {
        'Cache-Control': 'max-age=300' // Tell the browser to cache for 5 minutes
      }
    });
    
    console.log('Categories response:', response.data);
    
    if (response.data.success && response.data.categories) {
      setCategories(response.data.categories);
    } else {
      setError('Failed to load categories');
      setCategories([]);
    }
  } catch (err) {
    console.error('Error details:', err.response || err);
    setError(`Error fetching categories: ${err.message}`);
    setCategories([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchCategories();
  }, []);
  
  const openDeleteModal = (categoryId, categoryName) => {
    // Rate limit the delete button for this category
    setDeleteDisabled(prev => ({
      ...prev,
      [categoryId]: true
    }));
    
    // Set a timeout to re-enable the button after 4 seconds
    setTimeout(() => {
      setDeleteDisabled(prev => ({
        ...prev,
        [categoryId]: false
      }));
    }, 8000);
    
    setDeleteModal({
      isOpen: true,
      categoryId,
      categoryName
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      categoryId: null,
      categoryName: ''
    });
  };
  
  const handleDeleteCategory = async () => {
    const { categoryId } = deleteModal;
    if (!categoryId) return;
    
    try {
      setDeleteLoading(true);
      
      // Log the request for debugging
      console.log(`Attempting to delete category with ID: ${categoryId}`);
      
      // Make sure we're sending the request to the correct endpoint
      const response = await axiosInstance.delete(`/api/admin/categories/delete/${categoryId}`);
      console.log('Delete response:', response.data);
      
      if (response.data.success) {
        toast.success('Category deleted successfully');
        // Wait a moment before refreshing to ensure backend has completed the operation
        setTimeout(() => {
          fetchCategories();
        }, 500);
      } else {
        toast.error(response.data.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      
      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        // Show more specific error message
        const errorMessage = err.response.data?.error || 
                            err.response.data?.message || 
                            `Server error (${err.response.status}): Unable to delete category`;
        toast.error(errorMessage);
      } else if (err.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(`Error: ${err.message}`);
      }
    } finally {
      setDeleteLoading(false);
      closeDeleteModal();
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteCategory}
        categoryName={deleteModal.categoryName}
        isLoading={deleteLoading}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Link 
          to="/admin/categories/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Category
        </Link>
      </div>
      
      {categories.length === 0 ? (
        <p className="text-gray-500">No categories found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories && categories.map((category) => (
                <tr key={category?._id || Math.random()}>
                  <td className="px-6 py-4 whitespace-nowrap">{category?.name}</td>
                  <td className="px-6 py-4">{category?.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/admin/categories/${category?._id}/edit`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => openDeleteModal(category?._id, category?.name)}
                        disabled={deleteDisabled[category?._id]}
                        className={`px-3 py-1 rounded flex items-center transition-colors ${
                          deleteDisabled[category?._id] 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryList;