import mongoose from "mongoose";
import Product from '../../models/productSchema.js';
import Review from "../../models/reviewRatingSchema.js";
import User from "../../models/userSchema.js";
import Category from "../../models/categorySchema.js";
import Order from "../../models/orderSchema.js"
import logger from "../../config/logger.js";
import { createProductSchema, createManyProductsSchema } from "../../validators/adminProductValidator.js";
import { PRODUCT_FLAGS, getDefaultProductFlags, extractProductFlags } from "../../constants/productFlags.js";

export const adminGetAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};

    // Full-text search on name, brand, category
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') }
      ];
    }

    // Stock-based status filtering
    if (status === 'in-stock') {
      filter.stock = { $gt: 0 };
    } else if (status === 'out-of-stock') {
      filter.stock = { $lte: 0 };
    }
 
    // Query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    // ✨ Log for audit trail
    console.log(`[ADMIN_LOG] ${req.user?.id || 'Unknown'} accessed /admin/products from IP ${req.ip} at ${new Date().toISOString()}`);
   console.log(products.map(p => ({ name: p.name, images: p.image })));

    return res.status(200).json({
      success: true,
      data: {
        products,
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      error: null
    });

  } catch (err) {
    console.error('Admin getAllProducts error:', err);
    return res.status(500).json({
      success: false,
      data: null,
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

  // Get Product By Flag
export const getProductByFlag = async (req, res) => {
  try {
    const { flag } = req.params;
   if (!PRODUCT_FLAGS.includes(flag)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product flag'
      });
    }
  

    const query = { [flag]: true };

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};


export const adminGetSingleProduct = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid product ID",
        });
      }
  
      // Fetch product
      const product = await Product.findById(id).lean();
      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }
  
      // Fetch associated reviews
      const reviews = await Review.find({ product: id })
        .select("user rating comment")
        .lean();
  
      // Log admin action
      console.log(`[ADMIN] ${req.user?.email || "Unknown"} viewed product: ${id}`);
  
      res.status(200).json({
        success: true,
        data: { product, reviews },
      });
  
    } catch (error) {
      console.error("Error in adminGetSingleProduct:", error);
      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error",
      });
    }
  };
  
//Create A ProductProduct
export const adminCreateProduct = async (req, res) => {
  try {
    // Parse the JSON string from the request body if it exists
    let productData;
    try {
      productData = req.body.productData ? JSON.parse(req.body.productData) : req.body;
    } catch (parseError) {
      console.error("JSON parse error", parseError.message)
      return res.status(400).json({
        success: false,
        error: "Invalid product data format",
      });
    }

    console.log("Received product data:", productData);

    // Validate the product data
    const { error, value } = createProductSchema.validate(productData, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }
     const hasNewImages = req.files && req.files.length > 0;
    const hasExistingImages = req.body.imageUrls && JSON.parse(req.body.imageUrls || '[]').length > 0;
    
    if (!hasNewImages && !hasExistingImages) {
      return res.status(400).json({
        success: false,
        error: "At least one product image is required",
      });
    }
    const {
      name,
      description,
      price,
      discountedPrice,
      stock,
      category,
      sellerId,
      brand,
      attributes
    } = value;

    const sellerExists = await User.findById(sellerId);
    if (!sellerExists) {
      logger.warn(`Seller not found: ${sellerId}`);
      return res.status(404).json({
        success: false,
        error: "Seller not found.",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      logger.warn(`Invalid category: ${category}`);
      return res.status(400).json({
        success: false,
        error: "Invalid category ID.",
      });
    }

    const existingProduct = await Product.findOne({ name, sellerId });
    if (existingProduct) {
      logger.warn(`Duplicate product name for seller ${sellerId}: ${name}`);
      return res.status(400).json({
        success: false,
        error: "Product with this name already exists for this seller.",
      });
    }

    // Process uploaded images if any
    const images = [];
    if (hasNewImages) {
      images.push(...req.files.map(file => `/uploads/products/${file.filename}`));
    } else if (hasExistingImages) {
      images.push(...JSON.parse(req.body.imageUrls));
    }

    const product = new Product({
      name,
      description,
      price,
      discountedPrice,
      stock,
      category,
      sellerId,
      images,
      brand,
      attributes,
      ...getDefaultProductFlags(),
      ...extractProductFlags(value)
    });

    const newProduct = await product.save();

    logger.info(`[ADMIN] Product created: ${newProduct._id} by ${req.user?.email || 'Unknown Admin'}`);

    res.status(201).json({
      success: true,
      data: newProduct,
    });

  } catch (error) {
    logger.error("adminCreateProduct error: " + error.message);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error",
    });
  }
};
  
//Create Bulk Products
export const adminCreateManyProducts = async (req, res) => {
  try {
    const { error, value: validatedProducts } = createManyProductsSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    const uniqueSellerIds = [...new Set(validatedProducts.map(p => p.sellerId))];
    const uniqueCategoryIds = [...new Set(validatedProducts.map(p => p.category))];

    const sellers = await User.find({ _id: { $in: uniqueSellerIds } }).select('_id');
    const sellerIdsFound = new Set(sellers.map(s => s._id.toString()));

    const categories = await Category.find({ _id: { $in: uniqueCategoryIds } }).select('_id');
    const categoryIdsFound = new Set(categories.map(c => c._id.toString()));

    for (const product of validatedProducts) {
      if (!sellerIdsFound.has(product.sellerId)) {
        logger.warn(`Seller not found: ${product.sellerId}`);
        return res.status(404).json({
          success: false,
          error: `Seller not found: ${product.sellerId}`,
        });
      }

      if (!categoryIdsFound.has(product.category)) {
        logger.warn(`Category not found: ${product.category}`);
        return res.status(400).json({
          success: false,
          error: `Category not found: ${product.category}`,
        });
      }
    }

    const timestamp = new Date();

    const productsToInsert = validatedProducts.map(product => ({
      ...product,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    const insertedProducts = await Product.insertMany(productsToInsert);

    logger.info(`[ADMIN] Inserted ${insertedProducts.length} products by ${req.user?.email || "Unknown Admin"}`);

    res.status(201).json({
      success: true,
      data: insertedProducts,
    });

  } catch (error) {
    logger.error("adminCreateManyProducts error: " + error.message);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

 //Update Product
export const adminUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    // Parse the JSON string from the request body if it exists
    let productData;
    try {
      productData = req.body.productData ? JSON.parse(req.body.productData) : req.body;
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return res.status(400).json({
        success: false,
        error: "Invalid product data format",
      });
    }

    const updates = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      discountedPrice: productData.discountedPrice,
      stock: productData.stock,
      category: productData.category,
      brand: productData.brand,
      attributes: productData.attributes,
      // Product flags
      ...extractProductFlags(productData)
    };

    // Process uploaded images if any
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(file => `/uploads/products/${file.filename}`);
    } else if (productData.imageUrls) {
      // If no new files but existing image URLs provided
      updates.images = Array.isArray(productData.imageUrls) 
        ? productData.imageUrls 
        : JSON.parse(productData.imageUrls);
    }

    // Remove undefined fields
    Object.keys(updates).forEach(key => 
      updates[key] === undefined && delete updates[key]
    );

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    logger.info(`[ADMIN] Product updated: ${id} by ${req.user?.email || 'Unknown Admin'}`);

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    logger.error("adminUpdateProduct error: " + error.message);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error",
    });
  }
};

// Delete Product
export const adminDeleteProduct = async (req, res) => {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    // Check if product exists
    const product = await Product.findById(id).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check for related data (optional)
    const hasOrders = await Order.exists({ 'items.product': id }).session(session);
    if (hasOrders) {
      // Soft delete for products with orders
      product.isActive = false;
      await product.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      logger.info(`[ADMIN] Product soft-deleted (has orders): ${id} by ${req.user?.email || 'Unknown Admin'}`);
      
      return res.status(200).json({
        success: true,
        message: "Product has been deactivated because it has associated orders",
      });
    }

    // Delete related reviews
    await Review.deleteMany({ product: id }).session(session);
    
    // Delete the product
    await Product.findByIdAndDelete(id).session(session);
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    logger.info(`[ADMIN] Product deleted: ${id} by ${req.user?.email || 'Unknown Admin'}`);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    logger.error("adminDeleteProduct error: " + error.message);
    return res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error",
    });
  }
};