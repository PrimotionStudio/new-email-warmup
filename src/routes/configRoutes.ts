import { Router } from 'express';
import { validate } from '../middleware/validate';
import { updateConfigSchema } from '../schemas/configSchemas';
import { getConfig, updateConfig } from '../controllers/configController';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.route('/')
  .get(catchAsync(getConfig))
  .put(validate(updateConfigSchema), catchAsync(updateConfig));

export default router;
