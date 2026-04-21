import { Router } from 'express';
import { validateJob } from '../middleware/validate.js';
import {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';

const router = Router();

router.get('/', getAllJobs);
router.post('/', validateJob, createJob);
router.get('/:id', getJobById);
router.put('/:id', validateJob, updateJob);
router.delete('/:id', deleteJob);

export default router;
