import express from 'express';
const router = express.Router();
import {verifyToken } from '../middlewares/authMiddleware.js'; 
import cartRateLimiter from '../middlewares/cartrateLimiter.js';

import {
  createCart,
  getCart,
  updateCart,
  deleteItemFromCart,
  deleteCart as clearCart,
  checkoutCart,
} from '../controllers/cartController.js';

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/add', verifyToken, cartRateLimiter, createCart);

/**
 * @route   GET /api/cart
 * @desc    Get cart contents
 * @access  Private
 */
router.get('/', verifyToken, getCart);

/**
 * @route   PUT /api/cart/update
 * @desc    Update item quantity in cart
 * @access  Private
 */
router.put('/update', verifyToken, cartRateLimiter, updateCart);

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/remove/:productId', verifyToken, deleteItemFromCart);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/clear', verifyToken, clearCart);

/**
 * @route   POST /api/cart/checkout
 * @desc    Checkout cart
 * @access  Private
 */
router.post('/checkout', verifyToken, cartRateLimiter, checkoutCart);

export default router;
