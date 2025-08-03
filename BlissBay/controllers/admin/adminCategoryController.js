import mongoose from 'mongoose';
import Category from '../../models/categorySchema.js';
import Product from '../../models/productSchema.js';
import Order from '../../models/orderSchema.js';
import Cart from '../../models/cartSchema.js';
import AdminLog from '../../models/activityLogSchema.js';
import cacheService from '../../services/cacheService.js';


/**
 * Create new category
 * @route POST /api/category
 * @access Private/Admin
 */
export const createCategory = async (req, res) => {
    try {
      let { name, description, image, order, isActive } = req.body;
  
      // Trim and normalize the name
      name = name?.trim();
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid category name',
        });
      }
  
      // Case-insensitive check for existing category
      const existingCategory = await Category.findOne({
        name: { $regex: `^${name}$`, $options: 'i' },
      });
  
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists',
        });
      }
  
      // Create new category
      const category = new Category({
        name,
        description,
        image,
        order,
        isActive,
        createdBy: req.user.id,  // Assuming the user is logged in as an admin
      });
  
      await category.save();

        // Invalidate categories cache
    await cacheService.delete('categories:active');
  
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error',
      });
    }
  };
  
  export const getCategories = async (req, res) => {
    try {
       // Try to get categories from cache first
    const cacheKey = 'categories:active';
    const cachedCategories = await cacheService.get(cacheKey);
    
    if (cachedCategories) {
            res.set('Cache-Control', 'public, max-age=600'); // Cache for 10 minutes
      console.log('Serving categories from cache');
      return res.status(200).json({
        success: true,
        categories: cachedCategories,
        fromCache: true
      });
    }
      // Fetch categories with all needed data
      const categories = await Category.find({ isActive: true })
        .select('_id name slug description image order isActive') 
        .sort({ name: 1 }) // Sorting by name alphabetically
        .lean(); // Return plain JavaScript objects for faster response and memory optimization
  
      // Process categories
      const processedCategories = categories.map(category => ({
        ...category,
        slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-/,'')
      }));

          await cacheService.set(cacheKey, processedCategories, 600);

  
      res.status(200).json({
        success: true,
        categories: processedCategories,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
  
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  };
  
export const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID',
      });
    }

    const category = await Category.findById(categoryId)
      .populate('parent', 'name slug')
      .populate('subcategories', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

/**
 * Get category by slug (Admin view)
 * @route GET /api/admin/categories/slug/:slug
 * @access Private/Admin
 */
export const getCategoryBySlug = async (req, res) => {
    const slug = req.params.slug;
  
    try {
      const category = await Category.findOne({ slug })
        .populate('parent', 'name slug')
        .populate('subcategories', 'name slug');
  
      if (!category) {
        return res.status(404).json({
          success: false,
          error: `No category found with slug: ${slug}`,
        });
      }
  
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error(`Error fetching category by slug "${slug}":`, error);
      res.status(500).json({
        success: false,
        error: 'Server Error',
      });
    }
  };
  
  /**
   * Update category
   * @route PUT /api/category/:id
   * @access Private/Admin
   */
  export const updateCategory = async (req, res) => {
    try {
      const categoryId = req.params.id;
  
      // Validate category ID
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category ID',
        });
      }
  
      let { name, description, parent, image, order, isActive } = req.body;
  
      // Normalize name
      if (name) name = name.trim();
  
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found',
        });
      }
  
      // Check if new name already exists (case-insensitive), excluding current
      if (name && name.toLowerCase() !== category.name.toLowerCase()) {
        const duplicate = await Category.findOne({
          _id: { $ne: categoryId },
          name: { $regex: `^${name}$`, $options: 'i' },
        });
  
        if (duplicate) {
          return res.status(400).json({
            success: false,
            error: 'Another category with this name already exists',
          });
        }
      }
  
      // Prevent circular reference
      if (parent && parent.toString() === categoryId) {
        return res.status(400).json({
          success: false,
          error: 'Category cannot be its own parent',
        });
      }
  
      // Prevent parent loop (descendant becomes parent)
      if (parent) {
        const descendants = await Category.find({ 'ancestors._id': categoryId });
        const isDescendant = descendants.some(
          (desc) => desc._id.toString() === parent.toString()
        );
  
        if (isDescendant) {
          return res.status(400).json({
            success: false,
            error: 'Cannot assign a descendant as parent (would create loop)',
          });
        }
      }
  
      // Update category fields
      category.name = name || category.name;
      category.description = description || category.description;
      category.parent = parent || null;
      category.image = image || category.image;
      category.order = order ?? category.order;
      category.isActive = isActive !== undefined ? isActive : category.isActive;
  
      await category.save();

      
    // Invalidate categories cache
    await cacheService.delete('categories:active');
    // Also invalidate specific category cache
    await cacheService.delete(`category:${categoryId}`);
    await cacheService.delete(`category:slug:${category.slug}`);
  
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error',
      });
    }
  };

/**
 * Delete category
 * @route DELETE /api/category/:id
 * @access Private/Admin
 */
export const deleteCategory = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const categoryId = req.params.id;
    const protectedName = 'uncategorized';

    // 1. Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID format'
      });
    }

    // 2. Find the category
    const category = await Category.findById(categoryId).session(session);
    if (!category) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // 3. Prevent deletion of protected category
    if (category.name.toLowerCase() === protectedName) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: 'The "Uncategorized" category cannot be deleted as it serves as a fallback.'
      });
    }

    // 4. Find product IDs in the category
    const productsInCategory = await Product.find(
      { category: categoryId },
      { _id: 1 }
    ).session(session).lean();

    const productIds = productsInCategory.map(p => p._id);

    // 5. Block deletion if products exist in orders
    if (productIds.length > 0) {
      const ordersWithProducts = await Order.countDocuments({
        'items.product': { $in: productIds }
      }).session(session);

      if (ordersWithProducts > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          error: 'Cannot delete category: products in this category are referenced in orders.'
        });
      }
    }

    // 6. Find or create fallback category
    let fallbackCategory = await Category.findOne({
      name: new RegExp(`^${protectedName}$`, 'i')
    }).session(session);

    if (!fallbackCategory) {
      fallbackCategory = new Category({
        name: 'Uncategorized',
        description: 'Default fallback category for reassigned products',
        isActive: true,
        createdBy: req.user.id,
        updatedAt: new Date()
      });

      await fallbackCategory.save({ session });

      console.log(`Created fallback category (${fallbackCategory._id}) by user ${req.user.id}`);
    }

    // 7. Reassign products to fallback and remove from carts
    if (productIds.length > 0) {
      const productUpdateResult = await Product.updateMany(
        { category: categoryId },
        {
          $set: {
            category: fallbackCategory._id,
            updatedAt: new Date(),
            updatedBy: req.user.id
          }
        },
        { session }
      );

      const cartUpdateResult = await Cart.updateMany(
        { 'items.product': { $in: productIds } },
        {
          $pull: { items: { product: { $in: productIds } } },
          $set: { updatedAt: new Date() }
        },
        { session }
      );

      console.log(`Reassigned ${productUpdateResult.modifiedCount} products and updated ${cartUpdateResult.modifiedCount} carts`);
    }

    // 8. Delete the category
    await Category.deleteOne({ _id: categoryId }).session(session);

    // 9. Log admin action
  await AdminLog.create([{
  action: 'DELETE_CATEGORY',
  performedBy: req.user.id, 
  entityId: categoryId,      
  entityType: 'Category',    
  details: {
    categoryName: category.name,
    productsReassigned: productIds.length,
    fallbackCategoryId: fallbackCategory._id
  },
  timestamp: new Date()
}], { session });


    // 10. Commit transaction
    await session.commitTransaction();
    session.endSession();


    // Invalidate caches
    await cacheService.delete('categories:active');
    await cacheService.delete(`category:${categoryId}`);

    return res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
      details: {
        productsReassigned: productIds.length,
        fallbackCategory: fallbackCategory.name
      }
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error deleting category:', err);

    return res.status(500).json({
      success: false,
      error: 'An error occurred while deleting the category',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

  