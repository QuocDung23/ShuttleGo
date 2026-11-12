import type { OpenApiPaths } from '@/docs/openapi.helpers.js';
import {
  bearerSecurity,
  commonErrors,
  jsonBody,
  jsonResponse,
  schemaRef,
} from '@/docs/openapi.helpers.js';

export const authPaths: OpenApiPaths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a player or owner account',
      requestBody: jsonBody(schemaRef('RegisterInput')),
      responses: {
        201: jsonResponse('Account created', schemaRef('AuthResponse')),
        400: commonErrors[400],
        409: commonErrors[409],
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Log in and receive a JWT',
      requestBody: jsonBody(schemaRef('LoginInput')),
      responses: {
        200: jsonResponse('Authenticated', schemaRef('AuthResponse')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
      },
    },
  },
  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get the current user',
      security: bearerSecurity,
      responses: {
        200: jsonResponse('Current user', schemaRef('User')),
        401: commonErrors[401],
        404: commonErrors[404],
      },
    },
  },
};
