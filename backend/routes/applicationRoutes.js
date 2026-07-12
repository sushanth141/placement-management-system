import express from 'express';
import { applyForJob, getMyApplications, getApplicationsForJob, updateApplicationStatus, getAllApplications } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/all', protect, authorize('admin'), getAllApplications);
router.post('/:jobId', protect, authorize('student'), applyForJob);
router.get('/job/:jobId', protect, authorize('company', 'admin'), getApplicationsForJob);
router.patch('/:id/status', protect, authorize('company', 'admin'), updateApplicationStatus);

export default router;
