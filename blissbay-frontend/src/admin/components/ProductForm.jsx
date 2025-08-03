import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import ProductFlagSelector, { productFlags } from "./ProductFlagSelector";

const ProductForm = ({ product, isEditing = false }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountedPrice: "",
    stock: "",
    category: "",
    brand: "",
    attributes: [],
    sellerId: "",
    // Initialize all product flags to false
    ...Object.fromEntries(productFlags.map((flag) => [flag.id, false])),
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    setCurrentUser(user);

    if (isEditing && product) {
      console.log("Pre-filling Form with product", product);

      // Handle nested product data structure
      const productData = product.product || product;

      if (!productData) {
        console.error("Product data is null or undefined:", product);
        return;
      }

      const flagValues = Object.fromEntries(
        productFlags.map((flag) => [flag.id, productData[flag.id] || false])
      );

      // Simplified category extraction
      const categoryId =
        typeof productData.category === "object"
          ? productData.category?._id || ""
          : productData.category || "";

      setForm({
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price?.toString() || "",
        discountedPrice: productData.discountedPrice?.toString() || "",
        stock: productData.stock?.toString() || "",
        category: categoryId,
        brand: productData.brand || "",
        attributes: productData.attributes || [],
        sellerId: productData.sellerId || user?.id || "",
        ...flagValues,
      });

      if (productData.images?.length > 0) {
        setImagePreviews(productData.images);
      }
    } else if (user) {
      console.log("Creating new product, setting sellerId:", user.id);

      // Only set sellerId when not editing
      setForm((prev) => ({
        ...prev,
        sellerId: user.id,
      }));
    }
  }, [isEditing, product]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/categories");
        console.log("Categories API response:", response.data);
        if (response.data.success) {
          // Check the structure of the response
          const categoriesData =
            response.data.data || response.data.categories || [];
          setCategories(categoriesData);
        } else {
          console.error("API returned success:false", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle numeric inputs with validation
  const handleNumericChange = (e) => {
    const { name, value } = e.target;

    // Allow empty string or valid numbers
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      handleChange(e);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {
      setErrors((prev) => ({
        ...prev,
        images: "Only image files are allowed",
      }));
      return;
    }

    // Check if adding these files would exceed the 5 image limit
    if (imageFiles.length + validFiles.length > 5) {
      setErrors((prev) => ({
        ...prev,
        images: "Maximum 5 images allowed per product",
      }));
      return;
    }

    // Create preview URLs
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Clear any previous errors
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Attribute management functions
  const addAttribute = () => {
    setForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: "", value: "" }],
    }));
  };

  const updateAttribute = (index, field, value) => {
    const updatedAttributes = [...form.attributes];
    updatedAttributes[index] = {
      ...updatedAttributes[index],
      [field]: value,
    };

    setForm((prev) => ({
      ...prev,
      attributes: updatedAttributes,
    }));
  };

  const removeAttribute = (index) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setErrors({});

  //   // Validate form
  //   const validationErrors = {};
  //   if (!form.name) validationErrors.name = "Product name is required";
  //   if (!form.description)
  //     validationErrors.description = "Description is required";
  //   if (!form.price) validationErrors.price = "Price is required";
  //   if (!form.stock) validationErrors.stock = "Stock quantity is required";
  //   if (!form.category) validationErrors.category = "Category is required";
  //   if (imageFiles.length === 0 && (!isEditing || imagePreviews.length === 0)) {
  //     validationErrors.images = "At least one product image is required";
  //   }

  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     console.log("Submitting form with values:", form);

  //     // Step 1: Build processed form
  //     const processedForm = {
  //       name: form.name,
  //       description: form.description,
  //       price: parseFloat(form.price),
  //       discountedPrice: form.discountedPrice
  //         ? parseFloat(form.discountedPrice)
  //         : undefined,
  //       stock: parseInt(form.stock, 10),
  //       category: form.category,
  //       brand: form.brand || "",
  //       sellerId: form.sellerId || "",
  //       attributes: form.attributes.filter(
  //         (attr) => attr.name.trim() !== "" && attr.value.trim() !== ""
  //       ),
  //       // Include all dynamic flags
  //       ...productFlags.reduce((acc, flag) => {
  //         acc[flag.id] = form[flag.id] || false;
  //         return acc;
  //       }, {}),
  //     };

  //     // Step 2: Create FormData with productData as JSON string
  //     const simpleFormData = new FormData();

  //     // Add all product data as a single JSON string
  //     simpleFormData.append("productData", JSON.stringify(processedForm));

  //     // Step 3: Submit to backend
  //     let productId;

  //     if (isEditing) {
  //       // Safely extract product ID, handling potential undefined values
  //       if (!product) {
  //         console.error("Product is undefined in edit mode");
  //         throw new Error("Product data is missing");
  //       }

  //       const productData = product.product || product;
  //       productId = productData?._id;

  //       if (!productId) {
  //         console.error("Missing product ID for edit operation:", productData);
  //         throw new Error("Product ID is required for editing");
  //       }
  //     }

  //     const url = isEditing
  //       ? `/api/admin/products/${productId}`
  //       : "/api/admin/products";

  //     const method = isEditing ? "patch" : "post";

  //     console.log(`Sending ${method.toUpperCase()} request to ${url}`);

  //     let response;

  //     if (isEditing && imageFiles.length === 0) {
  //       // For editing without new images
  //       if (imagePreviews.length > 0) {
  //         // Include existing images in the JSON payload
  //         processedForm.images = imagePreviews;
  //       }
  //       const token = localStorage.getItem("token");
  //       response = await axiosInstance[method](url, processedForm, {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //     } else {
  //       // For new products or editing with new images

  //       // Add images to FormData
  //       if (imageFiles.length > 0) {
  //         imageFiles.forEach((file) => {
  //           simpleFormData.append("product", file);
  //         });
  //       } else if (isEditing && imagePreviews.length > 0) {
  //         simpleFormData.append("imageUrls", JSON.stringify(imagePreviews));
  //       }

  //       // Get auth token
  //       const token = localStorage.getItem("token");

  //       // Debug what's being sent
  //       console.log("Form data entries:");
  //       for (let [key, value] of simpleFormData.entries()) {
  //         console.log(`${key}: ${value instanceof File ? value.name : value}`);
  //       }

  //       // Add auth token to headers
  //       response = await axiosInstance[method](url, simpleFormData, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //     }

  //     console.log("API response:", response.data);

  //     if (response.data.success) {
  //       navigate("/admin/products");
  //     } else {
  //       setErrors({ form: response.data.error || error.response?.data.message || "Failed to save product" });
  //     }
  //   } catch (error) {
  //     console.error("Error saving product:", error);
  //       console.error("Error details:", error.response?.data); // ADD THIS

  //     setErrors({
  //       form:
  //         error.response?.data?.message ||
  //         "An error occurred while saving the product",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };





















  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrors({});

  // Validate form
  const validationErrors = {};
  if (!form.name) validationErrors.name = "Product name is required";
  if (!form.description) validationErrors.description = "Description is required";
  if (!form.price) validationErrors.price = "Price is required";
  if (!form.stock) validationErrors.stock = "Stock quantity is required";
  if (!form.category) validationErrors.category = "Category is required";
  
  // Check for images - either new files or existing previews
  if (imageFiles.length === 0 && imagePreviews.length === 0) {
    validationErrors.images = "At least one product image is required";
  }

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    setLoading(false);
    return;
  }

  try {
    console.log("Submitting form with values:", form);
    console.log("Image files:", imageFiles);
    console.log("Image previews:", imagePreviews);

    // Build processed form data
    const processedForm = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      discountedPrice: form.discountedPrice ? parseFloat(form.discountedPrice) : undefined,
      stock: parseInt(form.stock, 10),
      category: form.category,
      brand: form.brand || "",
      sellerId: form.sellerId || "",
      attributes: form.attributes.filter(
        (attr) => attr.name.trim() !== "" && attr.value.trim() !== ""
      ),
      // Include all dynamic flags
      ...productFlags.reduce((acc, flag) => {
        acc[flag.id] = form[flag.id] || false;
        return acc;
      }, {}),
    };

    // Always use FormData for consistency
    const formData = new FormData();
    formData.append("productData", JSON.stringify(processedForm));

    // Handle images - add new files
    if (imageFiles.length > 0) {
      console.log("Adding new image files:", imageFiles.length);
      imageFiles.forEach((file, index) => {
        console.log(`Adding image ${index}:`, file.name);
        formData.append("product", file); // Use "product" to match backend expectation
      });
    }

    // Handle existing images for editing
    if (isEditing && imagePreviews.length > 0) {
      // Filter out blob URLs (new images) and keep only existing server URLs
      const existingImageUrls = imagePreviews.filter(url => !url.startsWith('blob:'));
      if (existingImageUrls.length > 0) {
        console.log("Adding existing image URLs:", existingImageUrls);
        formData.append("imageUrls", JSON.stringify(existingImageUrls));
      }
    }

    // Determine request details
    let productId;
    if (isEditing) {
      if (!product) {
        console.error("Product is undefined in edit mode");
        throw new Error("Product data is missing");
      }

      const productData = product.product || product;
      productId = productData?._id;

      if (!productId) {
        console.error("Missing product ID for edit operation:", productData);
        throw new Error("Product ID is required for editing");
      }
    }

    const url = isEditing ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = isEditing ? "patch" : "post";

    console.log(`Sending ${method.toUpperCase()} request to ${url}`);

    // Debug FormData contents
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Get auth token
    const token = localStorage.getItem("token");

    // Send request
    const response = await axiosInstance[method](url, formData, {
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary for multipart/form-data
      },
    });

    console.log("API response:", response.data);

    if (response.data.success) {
      navigate("/admin/products");
    } else {
      setErrors({ form: response.data.error || response.data.message || "Failed to save product" });
    }
  } catch (error) {
    console.error("Error saving product:", error);
    console.error("Error details:", error.response?.data);
    
    setErrors({
      form: error.response?.data?.error || error.response?.data?.message || "An error occurred while saving the product",
    });
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h2>

      {errors.form && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name*
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md p-2`}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              disabled={loading}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description*
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={`w-full border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } rounded-md p-2`}
            disabled={loading}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* Pricing and Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)*
            </label>
            <input
              type="text"
              name="price"
              value={form.price}
              onChange={handleNumericChange}
              className={`w-full border ${
                errors.price ? "border-red-500" : "border-gray-300"
              } rounded-md p-2`}
              disabled={loading}
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discounted Price ($)
            </label>
            <input
              type="text"
              name="discountedPrice"
              value={form.discountedPrice}
              onChange={handleNumericChange}
              className={`w-full border ${
                errors.discountedPrice ? "border-red-500" : "border-gray-300"
              } rounded-md p-2`}
              disabled={loading}
            />
            {errors.discountedPrice && (
              <p className="text-red-500 text-xs mt-1">
                {errors.discountedPrice}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity*
            </label>
            <input
              type="text"
              name="stock"
              value={form.stock}
              onChange={handleNumericChange}
              className={`w-full border ${
                errors.stock ? "border-red-500" : "border-gray-300"
              } rounded-md p-2`}
              disabled={loading}
            />
            {errors.stock && (
              <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category*
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={`w-full border ${
              errors.category ? "border-red-500" : "border-gray-300"
            } rounded-md p-2`}
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value="">No categories available</option>
            )}
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        {/* Product Flags */}
        <ProductFlagSelector
          flags={form}
          onChange={(updatedFlags) => setForm({ ...form, ...updatedFlags })}
          disabled={loading}
        />

        {/* Product Attributes */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Product Attributes
            </label>
            <button
              type="button"
              onClick={addAttribute}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              disabled={loading}
            >
              Add Attribute
            </button>
          </div>

          {form.attributes.length > 0 ? (
            <div className="space-y-3">
              {form.attributes.map((attr, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Name (e.g. Color)"
                    value={attr.name}
                    onChange={(e) =>
                      updateAttribute(index, "name", e.target.value)
                    }
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. Blue)"
                    value={attr.value}
                    onChange={(e) =>
                      updateAttribute(index, "value", e.target.value)
                    }
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              No attributes added yet
            </p>
          )}
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images* (Max 5)
          </label>

          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              disabled={
                loading || imageFiles.length + imagePreviews.length >= 5
              }
            />
            {errors.images && (
              <p className="text-red-500 text-xs mt-1">{errors.images}</p>
            )}
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Product preview ${index + 1}`}
                    className="h-32 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : isEditing ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
