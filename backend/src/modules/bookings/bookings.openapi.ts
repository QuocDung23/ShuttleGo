import { BookingStatus, PaymentStatus } from '@/common/enums.js';
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

export const bookingPaths: OpenApiPaths = {
  '/bookings': {
    get: {
      tags: ['Bookings'],
      summary: 'List accessible bookings',
      security: bearerSecurity,
      parameters: [
        ...paginationParameters,
        queryParameter('courtId', { type: 'integer', minimum: 1 }),
        queryParameter('venueId', { type: 'integer', minimum: 1 }),
        queryParameter('playerId', { type: 'integer', minimum: 1 }),
        queryParameter('createdBy', { type: 'integer', minimum: 1 }),
        queryParameter('status', { type: 'string', enum: Object.values(BookingStatus) }),
        queryParameter('paymentStatus', { type: 'string', enum: Object.values(PaymentStatus) }),
        queryParameter('code', { type: 'string' }),
        queryParameter('date', { type: 'string', format: 'date' }),
        queryParameter('from', { type: 'string', format: 'date' }),
        queryParameter('to', { type: 'string', format: 'date' }),
      ],
      responses: {
        200: jsonResponse('Paginated bookings', pageOf(schemaRef('Booking'))),
        400: commonErrors[400],
        401: commonErrors[401],
      },
    },
    post: {
      tags: ['Bookings'],
      summary: 'Create a booking',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('CreateBookingInput')),
      responses: {
        201: jsonResponse('Booking created', schemaRef('Booking')),
        400: commonErrors[400],
        401: commonErrors[401],
        409: commonErrors[409],
      },
    },
  },
  '/bookings/{id}': {
    get: {
      tags: ['Bookings'],
      summary: 'Get an accessible booking',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Booking', schemaRef('Booking')),
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
    patch: {
      tags: ['Bookings'],
      summary: 'Update an accessible booking',
      description: 'Also confirms, cancels, or marks a booking paid by updating status fields.',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('UpdateBookingInput')),
      responses: {
        200: jsonResponse('Booking updated', schemaRef('Booking')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
    delete: {
      tags: ['Bookings'],
      summary: 'Delete an accessible booking',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        204: { description: 'Booking deleted' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
  },
};
