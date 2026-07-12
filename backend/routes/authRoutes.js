import express from 'express';
import { login, adminLogin, changePassword, getMe, updateProfile, forgotPasswordRequest } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/forgot-password-request', forgotPasswordRequest);
router.post('/change-password', protect, changePassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'aadharProof', maxCount: 1 }
]), updateProfile);

export default router;
