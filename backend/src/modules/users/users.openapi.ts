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
import { UserRole, UserStatus } from '@/common/enums.js';

const security = bearerSecurity;

export const userPaths: OpenApiPaths = {
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'List users (admin)',
      security,
      parameters: [
        ...paginationParameters,
        queryParameter('role', { type: 'string', enum: Object.values(UserRole) }),
        queryParameter('status', { type: 'string', enum: Object.values(UserStatus) }),
        queryParameter('search', { type: 'string' }, 'Search full name or phone'),
      ],
      responses: {
        200: jsonResponse('Paginated users', pageOf(schemaRef('User'))),
        401: commonErrors[401],
        403: commonErrors[403],
      },
    },
    post: {
      tags: ['Users'],
      summary: 'Create a user (admin)',
      security,
      requestBody: jsonBody(schemaRef('CreateUserInput')),
      responses: {
        201: jsonResponse('User created', schemaRef('User')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        409: commonErrors[409],
      },
    },
  },
  '/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get a user (admin)',
      security,
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('User', schemaRef('User')),
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
    patch: {
      tags: ['Users'],
      summary: 'Update a user (admin)',
      security,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('UpdateUserInput')),
      responses: {
        200: jsonResponse('User updated', schemaRef('User')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete a user (admin)',
      security,
      parameters: [idParameter()],
      responses: {
        204: { description: 'User deleted' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
        409: commonErrors[409],
      },
    },
  },
};
