import express from 'express';
const router = express.Router();

import { 
  createReview, 
  showReviews, 
  updateReview, 
  deleteReview, 
  getSingleReviewWithComments 
} from '../controllers/reviewController.js';

// Create a new review
router.post('/', createReview);

// Get reviews for a specific product
router.get('/product/:productId', showReviews);

// Update a specific review
router.put('/:reviewId', updateReview);

// Delete a specific review
router.delete('/:reviewId', deleteReview);

// Get a single review with its comments
router.get('/:reviewId/comments', getSingleReviewWithComments);

export default router;
