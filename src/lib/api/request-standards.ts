/**
 * Request Standards & Types
 * 
 * Tipos y utilidades reutilizables para validar y tipar requests
 * alineados con los estándares definidos en docs/API_STANDARDS.md
 */

import { z } from "zod";

// ============================================================================
// REQUEST METADATA TYPES
// ============================================================================

/**
 * Metadata incluida en requests (headers, contexto)
 */
export type RequestMeta = {
  requestId: string;
  userId?: string;
  userRole?: string;
  timestamp: string;
  ip?: string;
};

// ============================================================================
// PAGINATION TYPES & SCHEMAS
// ============================================================================

export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  offset: number;
};

/**
 * Validación de parámetros de paginación
 * 
 * @example
 * const params = paginationSchema.parse({ page: 1, limit: 20 });
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  offset: z.coerce.number().int().min(0).optional(),
}).strict();

export type ValidatedPaginationParams = z.infer<typeof paginationSchema>;

// ============================================================================
// SORTING TYPES & SCHEMAS
// ============================================================================

export type SortParams = {
  sort?: string;
  order?: "asc" | "desc";
};

/**
 * Convierte formato corto (-field) a objeto SortParams
 * 
 * @example
 * parseSortParam("-created_at") // { sort: "created_at", order: "desc" }
 * parseSortParam("name") // { sort: "name", order: "asc" }
 */
export function parseSortParam(sortParam?: string): SortParams | undefined {
  if (!sortParam) return undefined;

  if (sortParam.startsWith("-")) {
    return {
      sort: sortParam.slice(1),
      order: "desc",
    };
  }

  return {
    sort: sortParam,
    order: "asc",
  };
}

/**
 * Validación de parámetros de ordenamiento
 */
export const sortSchema = z.object({
  sort: z.string().min(1).optional(),
  order: z.enum(["asc", "desc"]).default("asc").optional(),
}).strict();

export type ValidatedSortParams = z.infer<typeof sortSchema>;

// ============================================================================
// FILTER TYPES & SCHEMAS
// ============================================================================

export type FilterParams = Record<string, string | string[] | undefined>;

/**
 * Parser para filtros comunes (range, status, etc)
 */
export const commonFiltersSchema = z.object({
  search: z.string().min(1).optional(),
  searchFields: z.string().optional(),
  status: z.string().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  updatedFrom: z.string().datetime().optional(),
  updatedTo: z.string().datetime().optional(),
}).strict();

export type ValidatedCommonFilters = z.infer<typeof commonFiltersSchema>;

// ============================================================================
// QUERY PARAMETERS GENERALES
// ============================================================================

export type QueryParams = PaginationParams &
  SortParams & {
    include?: string;
    fields?: string;
  } & FilterParams;

/**
 * Schema para parámetros de query comunes
 * 
 * Extend este schema cuando necesites agregar filtros específicos:
 * 
 * @example
 * const userQuerySchema = baseQuerySchema.extend({
 *   role: z.string().optional(),
 *   department: z.string().optional(),
 * });
 */
export const baseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.string().min(1).optional(),
  order: z.enum(["asc", "desc"]).default("asc").optional(),
  include: z.string().optional(),
  fields: z.string().optional(),
  search: z.string().min(1).optional(),
  searchFields: z.string().optional(),
}).strict();

export type ValidatedBaseQueryParams = z.infer<typeof baseQuerySchema>;

// ============================================================================
// BODY VALIDATION UTILITIES
// ============================================================================

/**
 * Esquema base para crear/actualizar recursos
 * 
 * @example
 * const createUserSchema = resourceBodySchema.extend({
 *   email: z.string().email(),
 *   name: z.string().min(1),
 * });
 */
export const resourceBodySchema = z.object({}).strict();

/**
 * Utilidad para transformar Zod errors a formato de respuesta
 * 
 * @example
 * try {
 *   userSchema.parse(body);
 * } catch (err) {
 *   if (err instanceof ZodError) {
 *     const fields = parseZodErrors(err);
 *     throw new ValidationError(undefined, { fields });
 *   }
 * }
 */
export function parseZodErrors(
  error: z.ZodError
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".") || "_base";

    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }

    fieldErrors[field].push(issue.message);
  }

  return fieldErrors;
}

// ============================================================================
// BATCH OPERATION TYPES
// ============================================================================

export type BatchOperationType = "create" | "update" | "delete" | "patch";

export type BatchOperation<T> = {
  id?: string;
  action: BatchOperationType;
  data: T;
};

export type BatchOperationRequest<T> = {
  operations: BatchOperation<T>[];
};

export type BatchOperationResponse<T> = {
  id?: string;
  status: "success" | "error";
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

export const batchOperationSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    operations: z.array(
      z.object({
        id: z.string().optional(),
        action: z.enum(["create", "update", "delete", "patch"]),
        data: dataSchema,
      })
    ),
  });

// ============================================================================
// COMMON RESPONSE TYPES (for typed responses)
// ============================================================================

export type ListResponse<T> = {
  data: T[];
  meta: {
    requestId: string;
    timestamp: string;
    pagination?: PaginationMeta;
  };
};

export type SingleResponse<T> = {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
};

export type BatchResponse<T> = {
  data: BatchOperationResponse<T>[];
  meta: {
    requestId: string;
    timestamp: string;
    summary: {
      total: number;
      succeeded: number;
      failed: number;
    };
  };
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extrae e valida parámetros de query comunes
 * 
 * @example
 * const query = req.query;
 * const { page, limit, sort, order } = validateBaseQuery(query);
 */
export function validateBaseQuery(
  query: Record<string, any>
): ValidatedBaseQueryParams {
  return baseQuerySchema.parse(query);
}

/**
 * Calcula paginationMeta basado en total y parámetros
 * 
 * @example
 * const meta = calculatePaginationMeta(100, { page: 1, limit: 20 });
 */
export function calculatePaginationMeta(
  total: number,
  params: ValidatedPaginationParams
): PaginationMeta {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const pages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    total,
    pages,
    offset,
  };
}

/**
 * Crea campos SELECT para SQL basado en parámetro fields
 * 
 * @example
 * const fields = buildSelectFields("id,name,email", ["id", "name", "email", "password"]);
 * // Returns: { id: true, name: true, email: true }
 */
export function buildSelectFields(
  fieldsParam: string | undefined,
  allowedFields: string[]
): Record<string, boolean> | undefined {
  if (!fieldsParam) return undefined;

  const fields = fieldsParam.split(",").map((f) => f.trim());
  const select: Record<string, boolean> = {};

  for (const field of fields) {
    if (allowedFields.includes(field)) {
      select[field] = true;
    }
  }

  return Object.keys(select).length > 0 ? select : undefined;
}

/**
 * Construye filtro de rango de fechas para SQL
 * 
 * @example
 * const filters = buildDateRangeFilter({
 *   createdFrom: "2024-01-01T00:00:00Z",
 *   createdTo: "2024-12-31T23:59:59Z",
 * }, "created_at");
 */
export function buildDateRangeFilter(
  params: Record<string, string | undefined>,
  fieldName: string
): Record<string, any> {
  const filter: Record<string, any> = {};

  if (params.createdFrom) {
    filter[`${fieldName}_gte`] = new Date(params.createdFrom);
  }

  if (params.createdTo) {
    filter[`${fieldName}_lte`] = new Date(params.createdTo);
  }

  return filter;
}

/**
 * Parser para parámetro include (relaciones a incluir)
 * 
 * @example
 * const include = parseIncludeParam("orders,invoices", ["orders", "invoices", "payments"]);
 * // Returns: { orders: true, invoices: true }
 */
export function parseIncludeParam(
  includeParam: string | undefined,
  allowedRelations: string[]
): Record<string, boolean> | undefined {
  if (!includeParam) return undefined;

  const relations = includeParam.split(",").map((r) => r.trim());
  const include: Record<string, boolean> = {};

  for (const relation of relations) {
    if (allowedRelations.includes(relation)) {
      include[relation] = true;
    }
  }

  return Object.keys(include).length > 0 ? include : undefined;
}
