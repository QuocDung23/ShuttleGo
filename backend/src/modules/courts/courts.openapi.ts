import type { OpenApiPaths } from '@/docs/openapi.helpers.js';
import {
  bearerSecurity,
  commonErrors,
  idParameter,
  jsonBody,
  jsonResponse,
  queryParameter,
  schemaRef,
} from '@/docs/openapi.helpers.js';

export const courtPaths: OpenApiPaths = {
  '/courts': {
    get: {
      tags: ['Courts'],
      summary: 'List courts',
      parameters: [
        queryParameter('venueId', { type: 'integer', minimum: 1 }),
        queryParameter('isActive', { type: 'boolean' }),
      ],
      responses: {
        200: jsonResponse('Courts', { type: 'array', items: schemaRef('Court') }),
        400: commonErrors[400],
      },
    },
    post: {
      tags: ['Courts'],
      summary: 'Create a court (owner/admin)',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('CreateCourtInput')),
      responses: {
        201: jsonResponse('Court created', schemaRef('Court')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        409: commonErrors[409],
      },
    },
  },
  '/courts/{id}': {
    get: {
      tags: ['Courts'],
      summary: 'Get a court',
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Court', schemaRef('Court')),
        404: commonErrors[404],
      },
    },
    patch: {
      tags: ['Courts'],
      summary: 'Update a court (owner/admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('UpdateCourtInput')),
      responses: {
        200: jsonResponse('Court updated', schemaRef('Court')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
    delete: {
      tags: ['Courts'],
      summary: 'Delete a court (owner/admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        204: { description: 'Court deleted' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
  },
};
