const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { validateStructuredApplicant, validateUploadApplicant } = require('../middleware/validate');
const {
  getAllApplicants,
  getApplicantsByJob,
  createStructured,
  uploadFile,
} = require('../controllers/applicantController');

router.get('/all', getAllApplicants);
router.get('/', getApplicantsByJob);
router.post('/structured', validateStructuredApplicant, createStructured);
router.post('/upload', upload.single('file'), validateUploadApplicant, uploadFile);

module.exports = router;
