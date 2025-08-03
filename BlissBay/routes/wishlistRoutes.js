import express from 'express';
import { verifyToken} from '../middlewares/authMiddleware.js';
import { 
  addProductToWishlist,
  getUserWishlist,
  removeProductFromWishlist,
  deleteProductFromWishlist,
  restoreRemovedProduct,
  removeUserWishlist,
  deleteUserWishlist,
  checkIfProductInWishlist,
  getPaginatedWishlist
} from '../controllers/wishlistController.js';

const router = express.Router();

router.get("/", verifyToken, getUserWishlist);

router.post("/add/:productId", verifyToken, addProductToWishlist);

/**
 * DELETE /wishlist/remove/:productId
 * Soft remove (delete) a product from wishlist
 */
router.delete("/remove/:productId", verifyToken, removeProductFromWishlist);

/**
 * DELETE /wishlist/hard-remove/:productId
 * Hard remove a product from wishlist
 */
router.delete("/hard-remove/:productId", verifyToken, deleteProductFromWishlist);

/**
 * DELETE /wishlist/soft-delete
 * Soft delete the user's entire wishlist
 */
router.delete("/soft-delete", verifyToken, removeUserWishlist);

/**
 * PATCH /wishlist/restore
 * Restore a soft-deleted wishlist
 */
router.patch("/restore", verifyToken, restoreRemovedProduct);

/**
 * DELETE /wishlist/permanent-delete
 * Permanently delete the user's wishlist
 */
router.delete("/permanent-delete", verifyToken, deleteUserWishlist);

/**
 * GET /wishlist/check/:productId
 * Check if a product is in the user's wishlist
 */
router.get("/check/:productId", verifyToken, checkIfProductInWishlist);

/**
 * GET /wishlist/paginated?page=1&limit=10
 * Get paginated wishlist items
 */
router.get("/paginated", verifyToken, getPaginatedWishlist);

export default router;
