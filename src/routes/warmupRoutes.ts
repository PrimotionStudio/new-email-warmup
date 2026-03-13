import { Router } from 'express';
import { triggerWarmup, triggerWarmupForDomainById } from '../controllers/warmupController';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.post('/trigger', catchAsync(triggerWarmup));
router.post('/trigger/:domainId', catchAsync(triggerWarmupForDomainById));

export default router;
