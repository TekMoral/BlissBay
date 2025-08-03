import mongoose from 'mongoose';
import User from "../../models/userSchema.js";
import ActivityLog from "../../models/activityLogSchema.js"
import Order from "../../models/orderSchema.js";
import { suspendUserSchema } from "../../validators/userValidator.js"


/**
 * Get all users with pagination, filtering and sorting
 * @route GET /api/users
 * @access Admin only
 */
export const getAllUsers = async (req, res) => {
    try {
      // Extract query parameters with defaults
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sortField = req.query.sortField || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const search = req.query.search || '';
      const role = req.query.role || '';
      const status = req.query.status || '';
      
      // Calculate pagination skip value
      const skip = (page - 1) * limit;
      
      // Build query filters
      const query = {};
      
      // Add search functionality
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Add role filter
      if (role) {
        query.role = role;
      }
      
      // Add status filter if your User model has status field
      if (status) {
        query.status = status;
      }
      
      // Execute query with pagination, sorting and field selection
      const users = await User.find(query)
        .select('-password -resetToken -resetTokenExpiry -__v')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean();
      
      // Get total count for pagination
      const totalUsers = await User.countDocuments(query);
      
      // Enhanced user data with additional metrics
      const enhancedUsers = await Promise.all(users.map(async (user) => {
        const orderCount = await Order.countDocuments({ userId: user._id });
        
        return {
          ...user,
          orderCount
        };
      }));
      
      // Log admin activity
      await ActivityLog.create({
        entityType: 'User', // optional but recommended
        entityId: null, // or a specific user ID if the action targets a specific user
        action: 'VIEW_ALL_USERS',
        performedBy: req.user.id,
        details: {
          filters: { search, role, status },
          pagination: { page, limit }
        },
        timestamp: new Date()
      });
      
      
      // Return paginated results with metadata
      return res.status(200).json({
        success: true,
        data: {
          users: enhancedUsers,
          pagination: {
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            perPage: limit,
            hasNextPage: page < Math.ceil(totalUsers / limit),
            hasPrevPage: page > 1
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching all users:', error);
      
      return res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving users',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  /**
 * Controller function to get user by ID (Admin access only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
  export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId early
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Check for admin privileges (middleware should set req.user)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const user = await User.findById(userId).select('-password'); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error in getUserById:', error);
    return next(error); // Use centralized error handler
  }
};


  export const promoteToAdmin = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Input validation
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
  
      // Find the user by ID
      const user = await User.findById(id);
      
      // Check if user exists
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if the user is already an admin
      if (user.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'User is already an admin'
        });
      }
      
      // Update user role to admin
      user.role = 'admin';
      
      // Optional: Add audit information
      user.updatedBy = req.user.id;
      user.updatedAt = new Date();
      
      // Save the updated user
      await user.save();
      
      // Log the action for audit purposes
      console.log(`User ${id} promoted to admin by ${req.user.id} at ${new Date()}`);
  
      // Return the updated user
      return res.status(200).json({
        success: true,
        message: 'User promoted to admin successfully',
        data: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      });
      
    } catch (error) {
      console.error('Error in promoteToAdmin :', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      return next(error);
    }
  };
//✅Suspend User Account
 export const suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate body
    const { error } = suspendUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.status === 'suspended') {
      return res.status(400).json({ success: false, message: 'User is already suspended' });
    }

    if (user.role === 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Cannot suspend another admin user' });
    }

    user.status = 'suspended';
    user.suspensionReason = reason || 'Suspended by administrator';
    user.suspendedAt = new Date();
    user.suspendedBy = req.user.id;
    user.updatedBy = req.user.id;
    user.updatedAt = new Date();

    await user.save();

    console.log(`User ${id} suspended by ${req.user.id}. Reason: ${reason || 'Not specified'}`);

    return res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: {
        id: user._id,
        email: user.email,
        status: user.status,
        suspendedAt: user.suspendedAt
      }
    });

  } catch (error) {
    console.error('Error in suspendUser controller:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    return next(error);
  }
};

 //✅Activate User Account
 export const activateUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Input validation
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      // Find the user by ID
      const user = await User.findById(id);
      
      // Check if user exists
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is already active
      if (user.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'User is already active'
        });
      }
      
      // Update user status
      user.status = 'active';
      user.suspensionReason = null;
      user.activatedAt = new Date();
      user.activatedBy = req.user.id;
      
      // Optional: Add audit information
      user.updatedBy = req.user.id;
      user.updatedAt = new Date();
      
      // Save the updated user
      await user.save();
      
      // Log the action for audit purposes
      console.log(`User ${id} activated by ${req.user.id} at ${new Date()}`);
      
      // Return success response
      return res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: {
          id: user._id,
          email: user.email,
          status: user.status,
          activatedAt: user.activatedAt
        }
      });
      
    } catch (error) {
      console.error('Error in activateUser controller:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      return next(error);
    }
  };