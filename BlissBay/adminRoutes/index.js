import express from 'express';

import adminCategoryRoutes from '../routes/admin/adminCategoryRoutes.js';
import adminOrderRoutes from '../routes/admin/adminOrderRoutes.js';
import adminProductRoutes from '../routes/admin/adminProductRoutes.js';
import adminReviewRoutes from '../routes/admin/adminReviewRoutes.js';
import adminUserRoutes from '../routes/admin/adminUserRoutes.js';
import dashboardRoutes from '../routes/admin/dashboardRoutes.js';


const router = express.Router();

router.use('/categories', adminCategoryRoutes);
router.use('/orders', adminOrderRoutes);
router.use('/products', adminProductRoutes);
router.use('/reviews', adminReviewRoutes);
router.use('/users', adminUserRoutes);
router.use('/dashboard', dashboardRoutes);


export default router;
