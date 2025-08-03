import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import { Loader2 } from "lucide-react";
import useCache from "../../hooks/useCache";

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [imageLoading, setImageLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Create a fetch function for the cache hook
  const fetchProducts = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: pageSize,
      search,
      status,
      sortBy,
      sortOrder,
    };

    const response = await axiosInstance.get("/api/admin/products", { params });

    if (response.data.success) {
      return {
        products: response.data.data.products,
        totalPages: response.data.data.totalPages,
        totalProducts: response.data.data.total,
      };
    } else {
      throw new Error(response.data.error || "Failed to fetch products");
    }
  }, [currentPage, pageSize, search, status, sortBy, sortOrder]);

  // Use the cache hook
  const {
    data: productData,
    loading,
    error,
    refetch,
  } = useCache(fetchProducts, [
    currentPage,
    pageSize,
    search,
    status,
    sortBy,
    sortOrder,
  ]);

  // Extract data from the cache result
  const products = productData?.products || [];
  const totalPages = productData?.totalPages || 1;
  const totalProducts = productData?.totalProducts || 0;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleDeleteClick = (productId) => {
    setDeleteConfirm(productId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await axiosInstance.delete(
        `/api/admin/products/${deleteConfirm}`
      );

      if (response.data.success) {
        // Force refetch to update the product list
        refetch();

        // Show success message
        alert("Product deleted successfully");
      } else {
        alert(response.data.error || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(
        err.response?.data?.error ||
          "An error occurred while deleting the product"
      );
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];

    // Always show first page
    buttons.push(
      <button
        key="first"
        onClick={() => handlePageChange(1)}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === 1
            ? "bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        1
      </button>
    );

    // If there are many pages, add ellipsis
    if (currentPage > 3) {
      buttons.push(
        <span key="ellipsis1" className="px-3 py-1">
          ...
        </span>
      );
    }

    // Show current page and surrounding pages
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown

      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    // If there are many pages, add ellipsis
    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="ellipsis2" className="px-3 py-1">
          ...
        </span>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === totalPages
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => {
    if (!deleteConfirm) return null;

    const productToDelete = products.find((p) => p._id === deleteConfirm);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
          <p className="mb-4">
            Are you sure you want to delete the product:{" "}
            <span className="font-medium">{productToDelete?.name}</span>?
          </p>
          <p className="text-red-600 text-sm mb-6">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleDeleteCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="mt-3">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <h3 className="font-semibold">Error</h3>
        <p>{error.message}</p>
        <button
          onClick={refetch}
          className="mt-2 text-blue-600 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search and filters */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, brand, or category"
                className="border rounded-l px-4 py-2 w-full"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex gap-3">
            <select
              value={status}
              onChange={handleStatusChange}
              className="border rounded px-3 py-2"
            >
              <option value="">All Stock Status</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border rounded px-3 py-2"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Products</h2>
        <Link
          to="/admin/products/new"
          className="text-blue-600 hover:underline"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-600">No products found</p>
          {search || status ? (
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setStatus("");
              }}
              className="text-blue-600 hover:underline block mt-2 mx-auto"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleSortChange("name")}
            >
              <span className="text-sm font-medium mr-1">Sort by Name</span>
              {sortBy === "name" && (
                <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
            </div>
            <div
              className="flex items-center ml-4 cursor-pointer"
              onClick={() => handleSortChange("price")}
            >
              <span className="text-sm font-medium mr-1">Sort by Price</span>
              {sortBy === "price" && (
                <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col"
              >
                {/* Admin Image Display */}

                <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                  )}
                  <img
                    src={
                      product.images?.[0]
                        ? `${
                            import.meta.env.VITE_BACKEND_URL ||
                            "http://localhost:5000"
                          }${product.images[0]}`
                        : "/images/product-placeholder.png"
                    }
                    alt={product.name || "Product image"}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      imageLoading ? "opacity-0" : "opacity-100"
                    }`}
                    onLoad={() => setImageLoading(false)}
                    onError={(e) => {
                      setImageLoading(false);
                      e.target.src = "/images/product-placeholder.png";
                      e.target.onerror = null;
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="p-4 flex-grow">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">
                    {product.name}
                  </h3>

                  <div className="flex justify-between items-center mb-2">
                    <div className="text-green-600 font-bold">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                          product.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Category: {product.category?.name || product.category}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between mt-auto">
                    <Link
                      to={`/products/${product._id}`}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(product._id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalProducts)}
                </span>{" "}
                of <span className="font-medium">{totalProducts}</span> products
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>

                {renderPaginationButtons()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default ProductList;
