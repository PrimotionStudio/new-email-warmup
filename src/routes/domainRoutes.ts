import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createDomainSchema, updateDomainSchema } from '../schemas/domainSchemas';
import {
  createDomain,
  getDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
  testDomainConnection,
} from '../controllers/domainController';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.route('/')
  .post(validate(createDomainSchema), catchAsync(createDomain))
  .get(catchAsync(getDomains));

router.route('/:id')
  .get(catchAsync(getDomainById))
  .put(validate(updateDomainSchema), catchAsync(updateDomain))
  .delete(catchAsync(deleteDomain));

router.post('/:id/test', catchAsync(testDomainConnection));

export default router;
