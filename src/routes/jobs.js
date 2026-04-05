const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

router.get('/', getAllJobs);
router.post('/', createJob);
router.get('/:id', getJobById);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
