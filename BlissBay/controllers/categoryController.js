import Category from '../models/categorySchema.js';
import mongoose from 'mongoose';

/**
 * Get all categories
 * @route GET /api/category
 * @access Public
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('_id name slug')
      .sort({ name: 1 })
      .lean();

    console.log('Categories being sent:', categories); // Debug log

    res.status(200).json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


/**
 * Get category by ID
 * @route GET /api/category/:id
 * @access Public
 */
export const getCategoryById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      });
    }
    
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug')
      .populate('subcategories');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get category by slug
 * @route GET /api/category/slug/:slug
 * @access Public
 */
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('parent', 'name slug')
      .populate('subcategories');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error getting category by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

