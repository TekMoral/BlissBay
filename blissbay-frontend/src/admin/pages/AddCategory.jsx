// src/admin/pages/AddCategory.jsx
import React from 'react';
import CategoryForm from '../components/CategoryForm';
import { Helmet } from 'react-helmet-async';

const AddCategory = () => {
  return (
    <>
      <Helmet>
        <title>Add New Category | Admin Dashboard</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <CategoryForm />
      </div>
    </>
  );
};

export default AddCategory;
