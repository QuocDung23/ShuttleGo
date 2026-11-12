import { NotificationType } from '@/common/enums.js';
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

export const notificationPaths: OpenApiPaths = {
  '/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'List notifications',
      security: bearerSecurity,
      parameters: [
        ...paginationParameters,
        queryParameter('userId', { type: 'integer', minimum: 1 }, 'Admin only; ignored for other roles'),
        queryParameter('isRead', { type: 'boolean' }),
        queryParameter('type', { type: 'string', enum: Object.values(NotificationType) }),
      ],
      responses: {
        200: jsonResponse('Paginated notifications', pageOf(schemaRef('Notification'))),
        400: commonErrors[400],
        401: commonErrors[401],
      },
    },
    post: {
      tags: ['Notifications'],
      summary: 'Create a notification (admin)',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('CreateNotificationInput')),
      responses: {
        201: jsonResponse('Notification created', schemaRef('Notification')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
      },
    },
  },
  '/notifications/read-all': {
    patch: {
      tags: ['Notifications'],
      summary: 'Mark all notifications read',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('ReadAllNotificationsInput')),
      responses: {
        200: jsonResponse('Number updated', {
          type: 'object',
          properties: { updated: { type: 'integer' } },
        }),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
      },
    },
  },
  '/notifications/{id}': {
    get: {
      tags: ['Notifications'],
      summary: 'Get a notification',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Notification', schemaRef('Notification')),
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
    patch: {
      tags: ['Notifications'],
      summary: 'Update a notification',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('UpdateNotificationInput')),
      responses: {
        200: jsonResponse('Notification updated', schemaRef('Notification')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
    delete: {
      tags: ['Notifications'],
      summary: 'Delete a notification',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        204: { description: 'Notification deleted' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
  },
};
