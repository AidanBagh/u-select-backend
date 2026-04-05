const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getApplicantsByJob,
  createStructured,
  uploadFile,
} = require('../controllers/applicantController');

router.get('/', getApplicantsByJob);
router.post('/structured', createStructured);
router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;
