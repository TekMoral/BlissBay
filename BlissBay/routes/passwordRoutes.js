import express from 'express';
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware.js';
import { 
  resetPassword, 
  forgotPassword, 
  changePassword,
  validatePassword 
} from '../controllers/passwordController.js';


// Add this logging middleware
router.use((req, res, next) => {
  console.log('Product route accessed:', {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query
  });
  next();
});


/**
 * Request password reset (forgot password)
 * @route POST /api/password/forgot
 * @access Public
 */
router.post('/forgot', forgotPassword);

/**
 * Reset password with token
 * @route POST /api/password/reset
 * @access Public
 */
router.post('/reset', resetPassword);

/**
 * Change password (when logged in)
 * @route POST /api/password/change
 * @access Private
 */
router.post('/change', verifyToken, changePassword);

/**
 * Validate password strength
 * @route POST /api/password/validate
 * @access Public
 */
router.post('/validate', validatePassword);

export default router;
