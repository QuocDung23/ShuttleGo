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
      summary: 'Create a venue (owner/admin), its price rules and N courts',
      description:
        '`courtCount` is required for both owners and admins. Courts named `Sân 1..N` are created in the same transaction and returned in `courts` (ordered by id).',
      security: bearerSecurity,
      requestBody: {
        ...jsonBody(schemaRef('CreateVenueInput')),
        content: {
          'application/json': {
            schema: schemaRef('CreateVenueInput'),
            example: {
              name: 'Sân cầu lông Minh An',
              address: '12 Nguyễn Trãi',
              district: 'Quận 5',
              city: 'TP. Hồ Chí Minh',
              courtCount: 2,
              priceRules: [
                { label: 'Giờ thường', startTime: '06:00', endTime: '17:00', pricePerHour: 80000 },
                { label: 'Giờ cao điểm', startTime: '17:00', endTime: '22:00', pricePerHour: 120000 },
              ],
            },
          },
        },
      },
      responses: {
        201: {
          ...jsonResponse('Venue created', schemaRef('Venue')),
          content: {
            'application/json': {
              schema: schemaRef('Venue'),
              example: {
                id: 1,
                ownerId: 2,
                name: 'Sân cầu lông Minh An',
                address: '12 Nguyễn Trãi',
                district: 'Quận 5',
                city: 'TP. Hồ Chí Minh',
                status: 'pending',
                createdAt: '2026-11-18T08:00:00.000Z',
                updatedAt: '2026-11-18T08:00:00.000Z',
                courts: [
                  { id: 1, venueId: 1, name: 'Sân 1', isActive: true },
                  { id: 2, venueId: 1, name: 'Sân 2', isActive: true },
                ],
                priceRules: [
                  {
                    id: 1,
                    venueId: 1,
                    label: 'Giờ thường',
                    startTime: '06:00',
                    endTime: '17:00',
                    pricePerHour: 80000,
                  },
                  {
                    id: 2,
                    venueId: 1,
                    label: 'Giờ cao điểm',
                    startTime: '17:00',
                    endTime: '22:00',
                    pricePerHour: 120000,
                  },
                ],
              },
            },
          },
        },
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
      },
    },
  },
  '/venues/mine': {
    get: {
      tags: ['Venues'],
      summary: "List the authenticated owner's venues for onboarding/approval status",
      security: bearerSecurity,
      responses: {
        200: jsonResponse('Owner venues status', schemaRef('OwnerVenuesResponse')),
        401: commonErrors[401],
        403: commonErrors[403],
      },
    },
  },
  '/venues/{id}/resubmit': {
    post: {
      tags: ['Venues'],
      summary: 'Resubmit a rejected venue for review (owner)',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Venue resubmitted', schemaRef('Venue')),
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
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
