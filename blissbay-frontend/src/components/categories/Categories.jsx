// components/categories/Categories.jsx
import React from 'react';
import { useCategories } from '../../hooks/useCategory'; 
import CategoryCard from './CategoryCard'; // import the CategoryCard component

const Categories = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div
          role="status"
          aria-busy="true"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {typeof error === 'string' ? error : 'An unexpected error occurred.'}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No categories found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {categories.map((category) => (
        <CategoryCard key={category._id} category={category} />
      ))}
    </div>
  );
};

export default Categories;
