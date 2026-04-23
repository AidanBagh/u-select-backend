import { Router } from 'express';
import upload from '../middleware/upload.js';
import { validateStructuredApplicant, validateUploadApplicant } from '../middleware/validate.js';
import {
  getAllApplicants,
  getApplicantsByJob,
  createStructured,
  uploadFile,
  deleteApplicantById,
} from '../controllers/applicantController.js';

const router = Router();

router.get('/all', getAllApplicants);
router.get('/', getApplicantsByJob);
router.post('/structured', validateStructuredApplicant, createStructured);
router.post('/upload', upload.single('file'), validateUploadApplicant, uploadFile);
router.delete('/:id', deleteApplicantById);

export default router;
