import { Router } from 'express';
import { runScreening, getScreening } from '../controllers/screeningController.js';

const router = Router();

router.post('/run', runScreening);
router.get('/:jobId', getScreening);

export default router;
