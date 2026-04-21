import { Router } from 'express';
import upload from '../middleware/upload.js';
import { validateStructuredApplicant, validateUploadApplicant } from '../middleware/validate.js';
import {
  getAllApplicants,
  getApplicantsByJob,
  createStructured,
  uploadFile,
} from '../controllers/applicantController.js';

const router = Router();

router.get('/all', getAllApplicants);
router.get('/', getApplicantsByJob);
router.post('/structured', validateStructuredApplicant, createStructured);
router.post('/upload', upload.single('file'), validateUploadApplicant, uploadFile);

export default router;
