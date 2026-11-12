import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from '@/docs/openapi.js';
import * as controller from '@/modules/docs/docs.controller.js';

export const docsRouter = Router();

docsRouter.get('/openapi.json', controller.showSpec);
docsRouter.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'ShuttleGo API Docs',
    swaggerOptions: { persistAuthorization: true },
  }),
);
