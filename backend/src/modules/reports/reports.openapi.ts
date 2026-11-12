import { ReportStatus } from '@/common/enums.js';
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

export const reportPaths: OpenApiPaths = {
  '/reports': {
    get: {
      tags: ['Reports'],
      summary: 'List accessible reports',
      security: bearerSecurity,
      parameters: [
        ...paginationParameters,
        queryParameter('status', { type: 'string', enum: Object.values(ReportStatus) }),
        queryParameter('reporterId', { type: 'integer', minimum: 1 }),
        queryParameter('venueId', { type: 'integer', minimum: 1 }),
        queryParameter('bookingId', { type: 'integer', minimum: 1 }),
        queryParameter('handledBy', { type: 'integer', minimum: 1 }),
      ],
      responses: {
        200: jsonResponse('Paginated reports', pageOf(schemaRef('Report'))),
        400: commonErrors[400],
        401: commonErrors[401],
      },
    },
    post: {
      tags: ['Reports'],
      summary: 'Create a report',
      security: bearerSecurity,
      requestBody: jsonBody(schemaRef('CreateReportInput')),
      responses: {
        201: jsonResponse('Report created', schemaRef('Report')),
        400: commonErrors[400],
        401: commonErrors[401],
      },
    },
  },
  '/reports/{id}': {
    get: {
      tags: ['Reports'],
      summary: 'Get an accessible report',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        200: jsonResponse('Report', schemaRef('Report')),
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
    patch: {
      tags: ['Reports'],
      summary: 'Handle a report (admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      requestBody: jsonBody(schemaRef('UpdateReportInput')),
      responses: {
        200: jsonResponse('Report updated', schemaRef('Report')),
        400: commonErrors[400],
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
    delete: {
      tags: ['Reports'],
      summary: 'Delete a report (admin)',
      security: bearerSecurity,
      parameters: [idParameter()],
      responses: {
        204: { description: 'Report deleted' },
        401: commonErrors[401],
        403: commonErrors[403],
        404: commonErrors[404],
      },
    },
  },
};
