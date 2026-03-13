import { Router } from 'express';
import { validate } from '../middleware/validate';
import { getDailyStatsSchema } from '../schemas/statsSchemas';
import { getStatsSummary, getDailyStats } from '../controllers/statsController';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.get('/summary', catchAsync(getStatsSummary));
router.get('/daily', validate(getDailyStatsSchema), catchAsync(getDailyStats));

export default router;
