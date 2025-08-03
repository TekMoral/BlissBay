import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authMiddleware.js";

import {
  
  addShippingAddress,
  getAllAddresses,
  getDefaultAddress,
  getAddressById,
  setDefaultAddress,
  deleteAddress,
  updateAddress,
} from "../controllers/addressController.js";

/**
 * @route   POST /api/addresses
 * @desc    Create a new address
 * @access  Private
 */
router.post("/", verifyToken, addShippingAddress);

/**
 * @route   GET /api/addresses
 * @desc    Get all addresses for the authenticated user
 * @access  Private
 */
router.get("/", verifyToken, getAllAddresses);

/**
 * @route   GET /api/addresses/default
 * @desc    Get the default address for the authenticated user
 * @access  Private
 */
router.get("/default", verifyToken, getDefaultAddress);

/**
 * @route   GET /api/addresses/:id
 * @desc    Get a single address by ID
 * @access  Private
 */
router.get("/:id", verifyToken, getAddressById);

/**
 * @route   PUT /api/addresses/:id
 * @desc    Update an address
 * @access  Private
 */
router.put("/:id", verifyToken, updateAddress);

/**
 * @route   PATCH /api/addresses/:id/set-default
 * @desc    Set an address as default
 * @access  Private
 */
router.patch("/:id/set-default", verifyToken, setDefaultAddress);

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Delete an address
 * @access  Private
 */
router.delete("/:id", verifyToken, deleteAddress);

export default router;
