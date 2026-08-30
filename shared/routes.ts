import { z } from 'zod';
import { insertWellSchema, insertReadingSchema, wells, readings } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  wells: {
    list: {
      method: 'GET' as const,
      path: '/api/wells' as const,
      responses: {
        200: z.array(z.custom<typeof wells.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/wells/:id' as const,
      responses: {
        200: z.custom<typeof wells.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/wells' as const,
      input: insertWellSchema,
      responses: {
        201: z.custom<typeof wells.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  readings: {
    list: {
      method: 'GET' as const,
      path: '/api/wells/:wellId/readings' as const,
      responses: {
        200: z.array(z.custom<typeof readings.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/readings' as const,
      input: insertReadingSchema,
      responses: {
        201: z.custom<typeof readings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  }
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type WellInput = z.infer<typeof api.wells.create.input>;
export type WellResponse = z.infer<typeof api.wells.create.responses[201]>;
export type WellsListResponse = z.infer<typeof api.wells.list.responses[200]>;

export type ReadingInput = z.infer<typeof api.readings.create.input>;
export type ReadingResponse = z.infer<typeof api.readings.create.responses[201]>;
export type ReadingsListResponse = z.infer<typeof api.readings.list.responses[200]>;
