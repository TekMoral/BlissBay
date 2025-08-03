import express from 'express';
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getOrderById, createOrder, getOrders } from '../controllers/orderController.js';

// Route to create a new order
router.post('/', verifyToken, createOrder);

// Route to get order details
router.get('/:orderId', verifyToken, getOrderById);


// Route to get all orders for a user
router.get('/user/:userId', verifyToken, getOrders);

export default router;
