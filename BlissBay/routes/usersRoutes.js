import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { 
  registerUser, 
  updateProfile, 
  forgotPassword, 
  loginUser, 
  changePassword, 
  resetPassword, 
  deleteAccount, 
  displayProfile 
} from '../controllers/usersController.js';

// Rate limiter for password reset requests
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 2, // 2 requests per window
  message: "Too many requests from this IP, please try again later",
});

const router = express.Router();

// Auth routes
router.post('/register', (req, res, next) => {
  req.app.locals.upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        error: err.message,
        field: 'avatar'
      });
    }
    next();
  });
}, registerUser);

router.post("/login", loginUser);

// Profile routes
router.get("/me", verifyToken, displayProfile);  // Current user profile
router.get("/profile/:userId", verifyToken, displayProfile);  // Specific user profile
router.put("/profile", verifyToken, updateProfile);

// Password management
router.put("/change-password", verifyToken, changePassword);
router.post("/forgot-password", limiter, forgotPassword);
router.post("/reset-password", resetPassword);

// Account management
router.delete("/delete-account", verifyToken, deleteAccount);

export default router;
