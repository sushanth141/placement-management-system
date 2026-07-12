import express from 'express';
import multer from 'multer';
import { createUser, bulkCreateUsers, getPendingUsers, getAllUsers, updateUserStatus, resetUserPassword, deleteUser } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/users/create', protect, authorize('admin'), createUser);
router.post('/users/bulk-create', protect, authorize('admin'), upload.single('file'), bulkCreateUsers);
router.get('/users/pending', protect, authorize('admin'), getPendingUsers);
router.get('/users/all', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/status', protect, authorize('admin'), updateUserStatus);
router.patch('/users/:id/reset-password', protect, authorize('admin'), resetUserPassword);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
