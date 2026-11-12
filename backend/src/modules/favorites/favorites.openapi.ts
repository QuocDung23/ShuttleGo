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

export const favoritePaths: OpenApiPaths = {
  '/favorites': {
    get: {
      tags: ['Favorites'],
      summary: 'List favorites',
      security: bearerSecurity,
      parameters: [
        ...paginationParameters,
        queryParameter('userId', { type: 'integer', minimum: 1 }, 'Admin only; ignored for other roles'),
        queryParameter('venueId', { type: 'integer', minimum: 1 }),
      ],
      responses: {
        200: jsonResponse('Paginated favorites', pageOf(schemaRef('Favorite'))),
        400: commonErrors[400],
        401: commonErrors[401],
      },
    },
    post: {
      tags: ['Favorites'],
      summary: 'Add a favorite',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('CreateFavoriteInput')),
      responses: {
        201: jsonResponse('Favorite added', schemaRef('Favorite')),
        400: commonErrors[400],
        401: commonErrors[401],
      },
    },
  },
  '/favorites/{userId}/{venueId}': {
    delete: {
      tags: ['Favorites'],
      summary: 'Remove a favorite',
      security: bearerSecurity,
      parameters: [idParameter('userId'), idParameter('venueId')],
      responses: {
        204: { description: 'Favorite removed' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
  },
};
