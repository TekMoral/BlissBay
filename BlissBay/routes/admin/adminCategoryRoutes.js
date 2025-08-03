import express from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug
} from '../../controllers/admin/adminCategoryController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', verifyToken, verifyAdmin, createCategory);
router.put('/update/:id', verifyToken, verifyAdmin, updateCategory);
router.delete('/delete/:id', verifyToken, verifyAdmin, deleteCategory);
router.get('/', verifyToken, verifyAdmin, getCategories);
router.get('/:id', verifyToken, verifyAdmin, getCategoryById);
router.get('/slug/:slug', verifyToken, verifyAdmin, getCategoryBySlug);

export default router;
