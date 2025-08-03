import express from 'express';
import {
  getAllUsers,
  getUserById,
  suspendUser,
  activateUser,
  promoteToAdmin,
} from '../../controllers/admin/adminUserController.js';
import { verifyToken, verifyAdmin } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Get all users
router.get('/', verifyToken, verifyAdmin, getAllUsers);

// Get a single user by ID
router.get('/:id', verifyToken, verifyAdmin, getUserById);


// Promote user to admin
router.patch('/:id/promote', verifyToken, verifyAdmin, promoteToAdmin);

// Suspend a user (soft ban)
router.patch('/:id/suspend', verifyToken, verifyAdmin, suspendUser);

// Reactivate a suspended user
router.patch('/:id/activate', verifyToken, verifyAdmin, activateUser);


export default router;
