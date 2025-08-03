import express from 'express';
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getPaymentStatus, processPayment } from '../controllers/paymentController.js';

/**
 * Process a new payment
 * @route POST /api/payments/process
 * @access Private
 */
router.post('/process', verifyToken, processPayment);

/**
 * Get payment history for authenticated user
 * @route GET /api/payments/history
 * @access Private
 */
router.get('/history', verifyToken, getPaymentStatus);

export default router;
