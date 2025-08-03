// adminReviewRoutes.js
import express from 'express';
import {
  getReviewWithComments,
  showReviews
} from '../../controllers/admin/adminReviewController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// View all reviews (with optional query filters like page, rating, etc.)
router.get('/', verifyToken, verifyAdmin, getReviewWithComments);

// View reviews for a specific product
router.get('/product/:productId', verifyToken, verifyAdmin, showReviews);


export default router;
