// routes/productRoutes.js
import express from 'express';
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware.js';

import { 
  getAllProducts, 
  getSingleProduct, 
  getFeaturedProducts, 
  getProductsWithWishlist,
  getProductsByFlag
} from '../controllers/productController.js';

// Public routes (no authentication required)
router.get('/', getAllProducts); // Regular products endpoint
router.get('/featured', getFeaturedProducts);
router.get('/flag/:flag', getProductsByFlag); // New route for products by flag
router.get('/:id', getSingleProduct);

// Protected routes (authentication required)
router.get('/products-with-wishlist', verifyToken, getProductsWithWishlist);

export default router;