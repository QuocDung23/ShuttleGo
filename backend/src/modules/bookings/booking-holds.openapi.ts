import type { OpenApiPaths } from '@/docs/openapi.helpers.js';
import { bearerSecurity, commonErrors, jsonBody, jsonResponse, schemaRef } from '@/docs/openapi.helpers.js';

export const bookingHoldPaths: OpenApiPaths = {
  '/booking-holds/mine': {
    get: {
      tags: ['Booking holds'],
      summary: 'Get the signed-in player’s temporary time selection',
      description: 'Returns null when the four-minute selection hold is absent or expired. A hold is not a booking.',
      security: bearerSecurity,
      responses: {
        200: jsonResponse('Current hold or null', schemaRef('BookingHoldNullable')),
        401: commonErrors[401],
        403: commonErrors[403],
      },
    },
    delete: {
      tags: ['Booking holds'],
      summary: 'Release the signed-in player’s temporary selection',
      security: bearerSecurity,
      responses: {
        204: { description: 'Selection released' },
        401: commonErrors[401],
        403: commonErrors[403],
      },
    },
  },
  '/booking-holds': {
    post: {
      tags: ['Booking holds'],
      summary: 'Select and temporarily hold a time range',
      description: 'Creates or replaces the player’s selection for four minutes. This does not create a booking; POST /bookings does that after checkout.',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('SelectBookingHoldInput')),
      responses: {
        201: jsonResponse('Temporary selection hold', schemaRef('BookingHold')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        409: commonErrors[409],
      },
    },
  },
};
