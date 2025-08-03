import Comment from '../models/commentSchema.js';
import Review from '../models/reviewRatingSchema.js';
import mongoose from 'mongoose' ;
import { commentSchema } from '../validators/commentValidator.js'; 

/**
 * Create new comment
 * @route POST /api/comment
 * @access Private
 */
export const createComment = async (req, res) => {
  try {
    const { reviewId, comment, parentCommentId } = req.body;

    // Assuming req.user is set by auth middleware
    const userId = req.user.userId;

    // Validate request body using Joi schema
    const { error } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message, // Provide detailed validation message
      });
    }

    if (!userId || !reviewId || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId, reviewId, and comment',
      });
    }

    // Validate reviewId exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    // Validate parentCommentId exists if provided
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return res.status(400).json({ success: false, error: 'Invalid parent comment ID' });
      }

      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: 'Parent comment not found',
        });
      }

      // Ensure parent comment belongs to the same review
      if (parentComment.reviewId.toString() !== reviewId) {
        return res.status(400).json({
          success: false,
          error: 'Parent comment must belong to the same review',
        });
      }
    }

    // Create the new comment
    const newComment = await Comment.create({
      userId,
      reviewId,
      comment,
      parentCommentId: parentCommentId || null,
    });

    // Populate the new comment with user, review, and parent comment details
    const populatedComment = await Comment.findById(newComment._id)
      .populate('userId', 'username profileImage')
      .populate('reviewId')
      .populate('parentCommentId');

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
/**
 * Get all comments
 * @route GET /api/comment
 * @access Public
 */
export const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    const comments = await Comment.find({})
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'username profileImage')
      .populate('reviewId')
      .populate('parentCommentId');
    
    const total = await Comment.countDocuments();
    
    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: comments
    });
  } catch (error) {
    console.error('Error getting all comments:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get single comment by ID
 * @route GET /api/comment/:id
 * @access Public
 */
export const getCommentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(req.params.id)
      .populate('userId', 'username profileImage')
      .populate('reviewId')
      .populate('parentCommentId');
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error getting comment by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get comments by review ID
 * @route GET /api/comment/review/:reviewId
 * @access Public
 */
export const getCommentsByReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.reviewId)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID' });
    }

    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Get only top-level comments (no parent comment)
    const comments = await Comment.find({ 
      reviewId: req.params.reviewId,
      parentCommentId: null
    })
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'username profileImage');
    
    const total = await Comment.countDocuments({ 
      reviewId: req.params.reviewId,
      parentCommentId: null
    });
    
    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments by review:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get comments by user ID
 * @route GET /api/comment/user/:userId
 * @access Public
 */
export const getCommentsByUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    const comments = await Comment.find({ userId: req.params.userId })
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('reviewId')
      .populate('parentCommentId');
    
    const total = await Comment.countDocuments({ userId: req.params.userId });
    
    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments by user:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get replies to a specific comment
 * @route GET /api/comment/:id/replies
 * @access Public
 */
export const getCommentReplies = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid comment ID' });
    }

    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    const replies = await Comment.find({ parentCommentId: req.params.id })
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'username profileImage');
    
    const total = await Comment.countDocuments({ parentCommentId: req.params.id });
    
    res.status(200).json({
      success: true,
      count: replies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: replies
    });
  } catch (error) {
    console.error('Error getting comment replies:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const updateComment = async (req, res) => {
    try {
      const commentId = req.params.id;
      const { content, parentCommentId } = req.body;
  
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid comment ID format",
        });
      }
  
      // Validate request body with Joi
      const { error } = commentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
      }
  
      // Find the comment and update
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: "Comment not found",
        });
      }
  
      // Update content and parentCommentId
      comment.content = content;
      comment.parentCommentId = parentCommentId || null;
  
      await comment.save();
  
      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        comment,
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update comment",
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

/**
 * Delete comment
 * @route DELETE /api/comment/:id
 * @access Private
 */
export const deleteComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    // Check if user is the owner of the comment
    // Assuming req.user is set by auth middleware
    const userId = req.user ? req.user.id : req.body.userId;
    
    if (comment.userId.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }
    
    // Check if this comment has replies
    const hasReplies = await Comment.exists({ parentCommentId: req.params.id });
    
    if (hasReplies) {
      // If comment has replies, we might want to keep the structure but mark as deleted
      await Comment.findByIdAndUpdate(req.params.id, {
        comment: '[Comment deleted]',
        updatedAt: new Date()
      });
      
      res.status(200).json({
        success: true,
        message: 'Comment content removed but structure preserved due to existing replies',
        data: {}
      });
    } else {
      // If no replies, we can safely delete the comment
      await Comment.findByIdAndDelete(req.params.id);
      
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        data: {}
      });
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};