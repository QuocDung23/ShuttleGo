import type { OpenApiPaths } from '@/docs/openapi.helpers.js';
import {
  bearerSecurity,
  commonErrors,
  idParameter,
  jsonBody,
  jsonResponse,
  schemaRef,
} from '@/docs/openapi.helpers.js';

export const amenityPaths: OpenApiPaths = {
  '/amenities': {
    get: {
      tags: ['Amenities'],
      summary: 'List amenities',
      responses: {
        200: jsonResponse('Amenities', { type: 'array', items: schemaRef('Amenity') }),
      },
    },
    post: {
      tags: ['Amenities'],
      summary: 'Create an amenity (admin)',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('CreateAmenityInput')),
      responses: {
        201: jsonResponse('Amenity created', schemaRef('Amenity')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        409: commonErrors[409],
      },
    },
  },
  '/amenities/{id}': {
    get: {
      tags: ['Amenities'],
      summary: 'Get an amenity',
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Amenity', schemaRef('Amenity')),
        404: commonErrors[404],
      },
    },
    patch: {
      tags: ['Amenities'],
      summary: 'Update an amenity (admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('UpdateAmenityInput')),
      responses: {
        200: jsonResponse('Amenity updated', schemaRef('Amenity')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
    delete: {
      tags: ['Amenities'],
      summary: 'Delete an amenity (admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        204: { description: 'Amenity deleted' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
  },
};
