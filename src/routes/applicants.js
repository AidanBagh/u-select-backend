const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { validateStructuredApplicant, validateUploadApplicant } = require('../middleware/validate');
const {
  getApplicantsByJob,
  createStructured,
  uploadFile,
} = require('../controllers/applicantController');

router.get('/', getApplicantsByJob);
router.post('/structured', validateStructuredApplicant, createStructured);
router.post('/upload', upload.single('file'), validateUploadApplicant, uploadFile);

module.exports = router;
