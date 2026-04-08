const express = require('express');
const router = express.Router();
const { validateJob } = require('../middleware/validate');
const {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

router.get('/', getAllJobs);
router.post('/', validateJob, createJob);
router.get('/:id', getJobById);
router.put('/:id', validateJob, updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
