const express = require('express');
const router = express.Router();
const { runScreening, getScreening } = require('../controllers/screeningController');

router.post('/run', runScreening);
router.get('/:jobId', getScreening);

module.exports = router;
