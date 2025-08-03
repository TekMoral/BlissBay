import express from 'express';
import { verifyToken, verifyAdmin }  from '../middlewares/authMiddleware.js';

const router = express.Router();


import { 
  getAllCoupons,
  createCoupon,
  getAllActiveCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  updateCouponStatus,
} from '../controllers/discountController.js';

/**
 * @route   POST /api/coupons
 * @desc    Create a new coupon
 * @access  Private (Admin)
 */
router.post("/", verifyToken, verifyAdmin, createCoupon);

/**
 * @route   GET /api/coupons
 * @desc    Get all coupons
 * @access  Private (Admin)
 */
router.get("/", verifyToken, verifyAdmin, getAllCoupons);

/**
 * @route   GET /api/coupons/active
 * @desc    Get all active coupons
 * @access  Public
 */
router.get("/active", getAllActiveCoupons);

/**
 * @route   GET /api/coupons/:id
 * @desc    Get coupon by ID
 * @access  Private (Admin)
 */
router.get("/:id", verifyToken, verifyAdmin, getCouponById);

/**
 * @route   PUT /api/coupons/:id
 * @desc    Update a coupon
 * @access  Private (Admin)
 */
router.put("/:id", verifyToken, verifyAdmin, updateCoupon);

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Delete a coupon
 * @access  Private (Admin)
 */
router.delete("/:id", verifyToken, verifyAdmin, deleteCoupon);

/**
 * @route   POST /api/coupons/apply
 * @desc    Apply a coupon to an order (validate coupon and calculate discount)
 * @access  Public
 */
router.post("/apply", applyCoupon);

/**
 * @route   PATCH /api/coupons/:id/status
 * @desc    Update coupon status (activate/deactivate)
 * @access  Private (Admin)
 */
router.patch("/:id/status", verifyToken, verifyAdmin, updateCouponStatus);

export default router;
