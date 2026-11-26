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
      description:
        'For players the server creates a five-minute checkout hold, not a completed booking. The slot stays in the temporary selected state until the player reports a transfer; only then does it enter the owner approval queue. Unpaid checkout holds are cancelled automatically when they expire and are hidden from owners.',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('CreateBookingInput')),
      responses: {
        201: jsonResponse('Booking created', schemaRef('Booking')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
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
      description:
        'Players may only send `{ "paymentStatus": "pending_verification" }` for their own pending/unpaid booking while its hold is live; the server clears the hold and keeps status pending. Any other field is rejected. Owners/admins keep the general update behaviour for confirmations and cancellation.',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              oneOf: [schemaRef('PaymentClaimInput'), schemaRef('UpdateBookingInput')],
            },
          },
        },
      },
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
  '/bookings/{id}/cancel': {
    post: {
      tags: ['Bookings'],
      summary: 'Cancel an unpaid player checkout hold',
      description: 'The player may cancel their own pending, unpaid booking before reporting a transfer. The court is released immediately.',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Cancelled hold', schemaRef('Booking')),
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
  },
};
