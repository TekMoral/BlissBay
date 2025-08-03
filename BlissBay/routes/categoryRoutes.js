import express from 'express';
const router = express.Router();
import { 
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
} from '../controllers/categoryController.js';

/**
 * Get all categories
 * @route GET /api/category
 * @access Public
 */
router.get('/',  getAllCategories);

/**
 * Get category by ID
 * @route GET /api/category/:id
 * @access Public
 */
router.get('/:id', getCategoryById);

/**
 * Get category by slug
 * @route GET /api/category/slug/:slug
 * @access Public
 */
router.get('/slug/:slug', getCategoryBySlug);

export default router;
