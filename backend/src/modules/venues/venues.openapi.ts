import { VenueStatus } from '@/common/enums.js';
import type { OpenApiPaths } from '@/docs/openapi.helpers.js';
import {
  bearerSecurity,
  commonErrors,
  idParameter,
  jsonBody,
  jsonResponse,
  pageOf,
  paginationParameters,
  queryParameter,
  schemaRef,
} from '@/docs/openapi.helpers.js';

export const venuePaths: OpenApiPaths = {
  '/venues': {
    get: {
      tags: ['Venues'],
      summary: 'List venues',
      parameters: [
        ...paginationParameters,
        queryParameter('ownerId', { type: 'integer', minimum: 1 }),
        queryParameter('status', { type: 'string', enum: Object.values(VenueStatus) }),
        queryParameter('city', { type: 'string' }),
        queryParameter('district', { type: 'string' }),
        queryParameter('search', { type: 'string' }, 'Search name or address'),
        queryParameter('sort', { type: 'string', enum: ['newest', 'name'], default: 'newest' }),
      ],
      responses: {
        200: jsonResponse('Paginated venues', pageOf(schemaRef('Venue'))),
        400: commonErrors[400],
      },
    },
    post: {
      tags: ['Venues'],
      summary: 'Create a venue (owner/admin)',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('CreateVenueInput')),
      responses: {
        201: jsonResponse('Venue created', schemaRef('Venue')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
      },
    },
  },
  '/venues/{id}': {
    get: {
      tags: ['Venues'],
      summary: 'Get venue details',
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Venue details', schemaRef('Venue')),
        404: commonErrors[404],
      },
    },
    patch: {
      tags: ['Venues'],
      summary: 'Update a venue (owner/admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('UpdateVenueInput')),
      responses: {
        200: jsonResponse('Venue updated', schemaRef('Venue')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
    delete: {
      tags: ['Venues'],
      summary: 'Delete a venue (owner/admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        204: { description: 'Venue deleted' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
  },
  '/venues/{id}/review': {
    patch: {
      tags: ['Venues'],
      summary: 'Review a venue (admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('ReviewVenueInput')),
      responses: {
        200: jsonResponse('Venue reviewed', schemaRef('Venue')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
  },
  '/venues/{id}/amenities': {
    get: {
      tags: ['Venues'],
      summary: 'List a venue’s amenities',
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Amenities', { type: 'array', items: schemaRef('Amenity') }),
        404: commonErrors[404],
      },
    },
    put: {
      tags: ['Venues'],
      summary: 'Replace a venue’s amenities (owner/admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('AmenityIdsInput')),
      responses: {
        200: jsonResponse('Updated amenities', { type: 'array', items: schemaRef('Amenity') }),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
  },
};
