import type { OpenApiPaths } from '@/docs/openapi.helpers.js';
import {
  bearerSecurity,
  commonErrors,
  idParameter,
  jsonBody,
  jsonResponse,
  schemaRef,
} from '@/docs/openapi.helpers.js';

const venueId = idParameter('venueId', 'Venue ID');
const dayOfWeek = {
  name: 'dayOfWeek',
  in: 'path',
  required: true,
  description: '0 = Sunday, 6 = Saturday',
  schema: { type: 'integer', minimum: 0, maximum: 6 },
};

export const operatingHourPaths: OpenApiPaths = {
  '/venues/{venueId}/operating-hours': {
    get: {
      tags: ['Operating hours'],
      summary: 'List operating hours for a venue',
      parameters: [venueId],
      responses: {
        200: jsonResponse('Operating hours', {
          type: 'array',
          items: schemaRef('OperatingHour'),
        }),
        404: commonErrors[404],
      },
    },
    put: {
      tags: ['Operating hours'],
      summary: 'Replace the full week (owner/admin)',
      security: bearerSecurity,
      parameters: [venueId],
      requestBody: jsonBody(schemaRef('ReplaceOperatingHoursInput')),
      responses: {
        200: jsonResponse('Updated operating hours', {
          type: 'array',
          items: schemaRef('OperatingHour'),
        }),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
  },
  '/venues/{venueId}/operating-hours/{dayOfWeek}': {
    put: {
      tags: ['Operating hours'],
      summary: 'Create or update one day (owner/admin)',
      security: bearerSecurity,
      parameters: [venueId, dayOfWeek],
      requestBody: jsonBody(schemaRef('UpsertOperatingHourInput')),
      responses: {
        200: jsonResponse('Operating hour updated', schemaRef('OperatingHour')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
    delete: {
      tags: ['Operating hours'],
      summary: 'Delete one day (owner/admin)',
      security: bearerSecurity,
      parameters: [venueId, dayOfWeek],
      responses: {
        204: { description: 'Operating hour deleted' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
  },
};
