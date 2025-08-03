import express from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createProductSchema } from "../../validators/adminProductValidator.js";
import { verifyToken, verifyAdmin } from "../../middlewares/authMiddleware.js";
import productUpload from "../../utils/productUpload.js";

import {
  adminGetAllProducts,
  adminGetSingleProduct,
  adminCreateProduct,
  adminCreateManyProducts,
  adminUpdateProduct,
  adminDeleteProduct,
  getProductByFlag,
} from "../../controllers/admin/adminProductController.js";

const router = express.Router();

// @route   GET /api/admin/products
// @desc    Get all products (admin)
// @access  Admin
router.get("/", verifyToken, verifyAdmin, adminGetAllProducts);

// @route   GET /api/admin/products/:id
// @desc    Get single product by ID (admin)
// @access  Admin
router.get("/:id", verifyToken, verifyAdmin, adminGetSingleProduct);

// @route   POST /api/admin/products
// @desc    Create a new product (admin)
// @access  Admin
router.post(
  "/",
  verifyToken,
  verifyAdmin,
  productUpload.array("images", 5),
  adminCreateProduct
);

// @route Get /api/admin/flag
router.get("/flag/:flag", getProductByFlag);

// @route   POST /api/admin/products/bulk
// @desc    Create many products at once (admin)
// @access  Admin
router.post(
  "/bulk",
  verifyToken,
  validateRequest(createProductSchema),
  verifyAdmin,
  adminCreateManyProducts
);

// @route   PATCH /api/admin/products/:id
// @desc    Update product details (admin)
// @access  Admin
router.patch(
  "/:id",
  verifyToken,
  verifyAdmin,
  productUpload.array("images", 5),
  adminUpdateProduct
);

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product with full checks (admin)
// @access  Admin
router.delete("/:id", verifyToken, verifyAdmin, adminDeleteProduct);

export default router;
