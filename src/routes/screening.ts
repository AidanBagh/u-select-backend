import { Router } from 'express';
import { runScreening, getAllScreenings, getScreening } from '../controllers/screeningController.js';

const router = Router();

router.post('/run', runScreening);
router.get('/', getAllScreenings);
router.get('/:jobId', getScreening);

export default router;
