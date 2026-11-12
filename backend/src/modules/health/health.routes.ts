import { Router } from 'express';
import * as controller from '@/modules/health/health.controller.js';

export const healthRouter = Router();

healthRouter.get('/', controller.show);
