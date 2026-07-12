import express from 'express';
import { createJob, getAllJobs, getJobById, updateJob, deleteJob, getMyJobs } from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllJobs);
router.get('/my', protect, authorize('company'), getMyJobs);
router.get('/:id', protect, getJobById);
router.post('/', protect, authorize('company', 'admin'), createJob);
router.put('/:id', protect, authorize('company', 'admin'), updateJob);
router.delete('/:id', protect, authorize('company', 'admin'), deleteJob);

export default router;
