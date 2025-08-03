import React from 'react';
import ProductForm from '../components/ProductForm';
import { Helmet } from 'react-helmet-async';

const AddProduct = () => {
  return (
    <>
      <Helmet>
        <title>Add New Product | Admin Dashboard</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <ProductForm />
      </div>
    </>
  );
};

export default AddProduct;