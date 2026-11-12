export type OpenApiObject = Record<string, unknown>;
export type OpenApiPaths = Record<string, Record<string, OpenApiObject>>;

export const bearerSecurity = [{ bearerAuth: [] }];

export const idParameter = (name = 'id', description?: string): OpenApiObject => ({
  name,
  in: 'path',
  required: true,
  ...(description ? { description } : {}),
  schema: { type: 'integer', minimum: 1 },
});

export const queryParameter = (
  name: string,
  schema: OpenApiObject,
  description?: string,
): OpenApiObject => ({
  name,
  in: 'query',
  required: false,
  ...(description ? { description } : {}),
  schema,
});

export const paginationParameters: OpenApiObject[] = [
  queryParameter('page', { type: 'integer', minimum: 1, default: 1 }),
  queryParameter('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }),
];

export const jsonBody = (schema: OpenApiObject): OpenApiObject => ({
  required: true,
  content: { 'application/json': { schema } },
});

export const schemaRef = (name: string): OpenApiObject => ({
  $ref: `#/components/schemas/${name}`,
});

export const jsonResponse = (description: string, schema?: OpenApiObject): OpenApiObject => ({
  description,
  ...(schema ? { content: { 'application/json': { schema } } } : {}),
});

export const noContentResponse: OpenApiObject = { description: 'No content' };

export const commonErrors = {
  400: jsonResponse('Invalid input', schemaRef('Error')),
  401: jsonResponse('Authentication required', schemaRef('Error')),
  403: jsonResponse('Insufficient permission', schemaRef('Error')),
  404: jsonResponse('Resource not found', schemaRef('Error')),
  409: jsonResponse('Conflict', schemaRef('Error')),
};

export const pageOf = (itemSchema: OpenApiObject): OpenApiObject => ({
  type: 'object',
  required: ['data', 'meta'],
  properties: {
    data: { type: 'array', items: itemSchema },
    meta: schemaRef('PaginationMeta'),
  },
});
