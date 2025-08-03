import express from 'express';
import { 
  getDashboardStats, 
  getRecentOrders,
  getPopularProducts 
} from '../../controllers/admin/dashboardController.js';
import { verifyAdmin, verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();


// Dashboard statistics
router.get('/getDashboardStats', verifyToken, verifyAdmin, getDashboardStats);

// Additional useful endpoints
router.get('/getRecentOrders', verifyToken, verifyAdmin, getRecentOrders);
router.get('/getPopularProducts', verifyToken, verifyAdmin, getPopularProducts);

export default router;