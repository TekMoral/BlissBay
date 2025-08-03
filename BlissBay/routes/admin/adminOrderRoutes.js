import express from 'express';
import {
  getAllOrders,
  updateOrderStatus,
  getOrderDetails
} from '../../controllers/admin/adminOrderController.js';

import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/update-status/:id', verifyToken, verifyAdmin, updateOrderStatus);
router.get('/', verifyToken, verifyAdmin, getAllOrders);
router.get('/:orderId', verifyToken, verifyAdmin, getOrderDetails)

export default router;
