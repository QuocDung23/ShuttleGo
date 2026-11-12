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

export const priceRulePaths: OpenApiPaths = {
  '/price-rules': {
    get: {
      tags: ['Price rules'],
      summary: 'List price rules',
      parameters: [queryParameter('venueId', { type: 'integer', minimum: 1 })],
      responses: {
        200: jsonResponse('Price rules', { type: 'array', items: schemaRef('PriceRule') }),
        400: commonErrors[400],
      },
    },
    post: {
      tags: ['Price rules'],
      summary: 'Create a price rule (owner/admin)',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('CreatePriceRuleInput')),
      responses: {
        201: jsonResponse('Price rule created', schemaRef('PriceRule')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        409: commonErrors[409],
      },
    },
  },
  '/price-rules/{id}': {
    get: {
      tags: ['Price rules'],
      summary: 'Get a price rule',
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Price rule', schemaRef('PriceRule')),
        404: commonErrors[404],
      },
    },
    patch: {
      tags: ['Price rules'],
      summary: 'Update a price rule (owner/admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('UpdatePriceRuleInput')),
      responses: {
        200: jsonResponse('Price rule updated', schemaRef('PriceRule')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
    delete: {
      tags: ['Price rules'],
      summary: 'Delete a price rule (owner/admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        204: { description: 'Price rule deleted' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
  },
};
