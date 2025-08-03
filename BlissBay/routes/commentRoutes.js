import express from 'express';
const router = express.Router();
import { 
  getAllComments, 
  getCommentById, 
  createComment, 
  updateComment, 
  deleteComment,
  getCommentsByReview,
  getCommentsByUser,
  getCommentReplies
} from '../controllers/commentControllers.js';

/**
 * Get all comments
 * @route GET /api/comments
 * @access Public
 */
router.get('/', getAllComments);

/**
 * Get single comment by ID
 * @route GET /api/comments/:id
 * @access Public
 */
router.get('/:id', getCommentById);

/**
 * Get comments by review ID
 * @route GET /api/comments/review/:reviewId
 * @access Public
 */
router.get('/review/:reviewId', getCommentsByReview);

/**
 * Get comments by user ID
 * @route GET /api/comments/user/:userId
 * @access Public
 */
router.get('/user/:userId', getCommentsByUser);

/**
 * Get replies to a specific comment
 * @route GET /api/comments/:id/replies
 * @access Public
 */
router.get('/:id/replies', getCommentReplies);

/**
 * Create new comment
 * @route POST /api/comments
 * @access Private
 */
router.post('/', createComment);

/**
 * Update comment
 * @route PUT /api/comments/:id
 * @access Private
 */
router.put('/:id', updateComment);

/**
 * Delete comment
 * @route DELETE /api/comments/:id
 * @access Private
 */
router.delete('/:id', deleteComment);

export default router;
