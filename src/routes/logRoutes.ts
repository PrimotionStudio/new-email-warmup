import { Router } from 'express';
import { validate } from '../middleware/validate';
import { getLogsSchema, getLogByIdSchema } from '../schemas/logSchemas';
import { getLogs, getLogById } from '../controllers/logController';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.route('/')
  .get(validate(getLogsSchema), catchAsync(getLogs));

router.route('/:id')
  .get(validate(getLogByIdSchema), catchAsync(getLogById));

export default router;
