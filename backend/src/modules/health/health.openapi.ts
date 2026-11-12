import type { OpenApiPaths } from '@/docs/openapi.helpers.js';
import { jsonResponse } from '@/docs/openapi.helpers.js';

export const healthPaths: OpenApiPaths = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Check API health',
      responses: {
        200: jsonResponse('API is healthy', {
          type: 'object',
          properties: { status: { type: 'string', example: 'ok' } },
        }),
      },
    },
  },
};
