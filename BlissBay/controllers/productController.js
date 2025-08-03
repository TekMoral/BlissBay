import Product from "../models/productSchema.js";
import Review from "../models/reviewRatingSchema.js";
import Wishlist from "../models/wishlistSchema.js";
import mongoose from "mongoose";

export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      priceRange,
      sortBy,
    } = req.query;

    console.log('Received query params:', req.query); // Debug log


    // Build filter object
    const filter = {};

    // Category filter - only add if category is not 'all'
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Price range filter - handle different formats
    if (priceRange && priceRange !== 'all') {
      if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          filter.price = { $gte: min, $lte: max };
        }
      } else if (priceRange.endsWith('+')) {
        // Handle cases like "200+"
        const min = parseInt(priceRange);
        if (!isNaN(min)) {
          filter.price = { $gte: min };
        }
      }
    }

    // Build sort options
    const sortOptions = {};
    switch (sortBy) {
      case 'priceAsc':
        sortOptions.price = 1;
        break;
      case 'priceDesc':
        sortOptions.price = -1;
        break;
      case 'latest':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.createdAt = -1; // Default sort
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute queries in parallel
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('name price description images category brand discountedPrice stock createdAt')
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Calculate if there are more products
    const hasMore = skip + products.length < totalProducts;

    // Log for debugging
    console.log('Filter:', filter);
    console.log('Sort:', sortOptions);
    console.log(`Found ${products.length} products, total: ${totalProducts}`);

    res.json({
      products,
      totalProducts,
      hasMore,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / parseInt(limit))
    });

  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ product: id })
      .select("user rating comment")
      .lean();

    res.json({ product, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get products with wishlist status (protected)
// Get products with wishlist status (protected)
export const getProductsWithWishlist = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      page = 1,
      sortBy = "default",
      category = "all",
      priceRange = "all",
    } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Add category filter if not 'all'
    if (category && category !== "all") {
      query.category = category;
    }
    
    // Add price range filter
    if (priceRange !== "all") {
      if (priceRange === "200") {
        query.price = { $gte: 200 };
      } else if (priceRange.includes("-")) {
        const [min, max] = priceRange.split("-");
        query.price = {
          $gte: Number(min),
          $lte: Number(max),
        };
      }
    }

    // Sort logic
    let sortOptions = {};
    switch (sortBy) {
      case "price-low-high":
        sortOptions = { price: 1 };
        break;
      case "price-high-low":
        sortOptions = { price: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    // Fetch products with the query and sort options
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Add wishlist status to products
    const productsWithWishlist = await Promise.all(
      products.map(async (product) => {
        const isWishlisted = await Wishlist.exists({
          userId: req.user._id,
          productId: product._id,
        });
        return {
          ...product.toObject(),
          isWishlisted: !!isWishlisted,
        };
      })
    );

    const total = await Product.countDocuments(query);

    res.json({
      products: productsWithWishlist,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error in getProductsWithWishlist:", error);
    res.status(500).json({
      message: "Failed to fetch products with wishlist",
      error: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
    console.log('📥 [GET] /api/products/featured - Incoming request');
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).limit(8);
    console.log(`✅ Found ${featuredProducts.length} featured products`);
    console.log('🧪 First product preview:', featuredProducts[0]);
    res.status(200).json({ success: true, data: featuredProducts });
  } catch (err) {
    console.error("Error fetching featured products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get products by flag (public)
export const getProductsByFlag = async (req, res) => {
  try {
    const { flag } = req.params;
    
    // Import PRODUCT_FLAGS from constants
    const { PRODUCT_FLAGS } = await import('../constants/productFlags.js');
    
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
    console.error("Error fetching products by flag:", error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};