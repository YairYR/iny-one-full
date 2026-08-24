# EJEMPLO: Endpoints CRUD para Usuarios

Demuestra implementación siguiendo los estándares definidos en:
- docs/API_STANDARDS.md
- src/lib/api/request-standards.ts

## Estructura de archivos:
* app/api/v1/users/route.ts - Listado y creación
* app/api/v1/users/[id]/route.ts - Obtener, actualizar, eliminar
* app/api/v1/users/batch/route.ts - Operaciones batch

### Ejemplo 1: app/api/v1/users/route.ts (GET list, POST create)

```ts
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import {
  validateBaseQuery,
  calculatePaginationMeta,
  buildSelectFields,
  parseIncludeParam,
  baseQuerySchema,
} from "@/lib/api/request-standards";
import { ValidationError, ResourceNotFoundError } from "@/lib/api/errors";
import { z } from "zod";

// Definir schema de creación de usuario
const createUserSchema = z.object({
  email: z.string().email("Must be a valid email"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "admin"]).default("user").optional(),
}).strict();

type CreateUserRequest = z.infer<typeof createUserSchema>;

// Schema extendido para queries específicas de usuarios
const userQuerySchema = baseQuerySchema.extend({
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    // 1. Validar query parameters
    const query = Object.fromEntries(req.nextUrl.searchParams);
    const validated = userQuerySchema.parse(query);

    // 2. Construir filtros
    const where: Record<string, any> = {};
    if (validated.role) where.role = validated.role;
    if (validated.status) where.status = validated.status;
    if (validated.search) {
      where.OR = [
        { email: { contains: validated.search } },
        { name: { contains: validated.search } },
      ];
    }

    // 3. Procesar paginación
    const page = validated.page || 1;
    const limit = validated.limit || 20;
    const skip = (page - 1) * limit;

    // 4. Procesar campos a retornar
    const select = buildSelectFields(validated.fields, [
      "id",
      "email",
      "name",
      "role",
      "created_at",
      "updated_at",
    ]);

    // 5. Procesar relaciones a incluir
    const include = parseIncludeParam(validated.include, [
      "orders",
      "invoices",
    ]);

    // 6. Obtener datos (pseudo-código, usar tu ORM)
    // const [users, total] = await Promise.all([
    //   db.user.findMany({
    //     where,
    //     skip,
    //     take: limit,
    //     select,
    //     include,
    //     orderBy: { [validated.sort || "created_at"]: validated.order },
    //   }),
    //   db.user.count({ where }),
    // ]);

    // 7. Calcular metadata de paginación
    // const paginationMeta = calculatePaginationMeta(total, validated);

    // 8. Retornar response exitoso
    // return successResponse({ users, paginationMeta }, req.headers.get("X-Request-ID") || undefined);
  } catch (err) {
    return errorResponse(err, req.headers.get("X-Request-ID") || undefined);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parsear body
    const body = await req.json();

    // 2. Validar schema
    const validated = createUserSchema.parse(body);

    // 3. Validaciones de negocio
    // const existingUser = await db.user.findUnique({
    //   where: { email: validated.email },
    // });
    // if (existingUser) {
    //   throw new ApiError(ERROR.DUPLICATE_ENTRY, "Email already exists", {
    //     status: 409,
    //     type: "conflict",
    //     fields: { email: ["Email already registered"] },
    //   });
    // }

    // 4. Crear recurso
    // const user = await db.user.create({
    //   data: {
    //     email: validated.email,
    //     name: validated.name,
    //     password: await hashPassword(validated.password),
    //     role: validated.role || "user",
    //   },
    // });

    // 5. Retornar response con status 201
    // return successResponse(user, req.headers.get("X-Request-ID") || undefined);
  } catch (err) {
    return errorResponse(err, req.headers.get("X-Request-ID") || undefined);
  }
}
```

### Ejemplo 2: app/api/v1/users/[id]/route.ts (GET one, PUT, PATCH, DELETE)

```ts
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { ResourceNotFoundError, ValidationError } from "@/lib/api/errors";
import { z } from "zod";

type Props = {
  params: {
    id: string;
  };
};

// Schema para actualización completa (PUT)
const updateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "inactive", "suspended"]),
}).strict();

// Schema para actualización parcial (PATCH)
const patchUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
}).strict();

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = params;

    // Validar que id es UUID válido
    if (!isValidUUID(id)) {
      throw new ValidationError("Invalid user ID format");
    }

    // Obtener usuario
    // const user = await db.user.findUnique({
    //   where: { id },
    //   include: { orders: true }, // opcional
    // });

    // if (!user) {
    //   throw new ResourceNotFoundError("User not found");
    // }

    // return successResponse(user, req.headers.get("X-Request-ID") || undefined);
  } catch (err) {
    return errorResponse(err, req.headers.get("X-Request-ID") || undefined);
  }
}

export async function PUT(req: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!isValidUUID(id)) {
      throw new ValidationError("Invalid user ID format");
    }

    // Validar que el usuario existe
    // const existing = await db.user.findUnique({ where: { id } });
    // if (!existing) {
    //   throw new ResourceNotFoundError("User not found");
    // }

    // Validar esquema completo (PUT requiere todos los campos)
    const validated = updateUserSchema.parse(body);

    // Actualizar
    // const updated = await db.user.update({
    //   where: { id },
    //   data: validated,
    // });

    // return successResponse(updated, req.headers.get("X-Request-ID") || undefined);
  } catch (err) {
    return errorResponse(err, req.headers.get("X-Request-ID") || undefined);
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!isValidUUID(id)) {
      throw new ValidationError("Invalid user ID format");
    }

    // Validar que existe
    // const existing = await db.user.findUnique({ where: { id } });
    // if (!existing) {
    //   throw new ResourceNotFoundError("User not found");
    // }

    // Validar esquema parcial (PATCH permite campos opcionales)
    const validated = patchUserSchema.parse(body);

    // Solo actualizar campos proporcionados
    // const updated = await db.user.update({
    //   where: { id },
    //   data: validated,
    // });

    // return successResponse(updated, req.headers.get("X-Request-ID") || undefined);
  } catch (err) {
    return errorResponse(err, req.headers.get("X-Request-ID") || undefined);
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { id } = params;

    if (!isValidUUID(id)) {
      throw new ValidationError("Invalid user ID format");
    }

    // Validar que existe
    // const existing = await db.user.findUnique({ where: { id } });
    // if (!existing) {
    //   throw new ResourceNotFoundError("User not found");
    // }

    // Eliminar
    // await db.user.delete({ where: { id } });

    // Retornar 204 No Content (sin body)
    // return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err, req.headers.get("X-Request-ID") || undefined);
  }
}

function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
```

### Ejemplo 3: app/api/v1/users/batch/route.ts (Batch operations)

```ts
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import {
  batchOperationSchema,
  BatchOperationResponse,
  parseZodErrors,
} from "@/lib/api/request-standards";
import { ValidationError } from "@/lib/api/errors";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["user", "admin"]).default("user").optional(),
}).strict();

type UserData = z.infer<typeof createUserSchema>;

const batchSchema = batchOperationSchema(
  z.object({
    id: z.string().optional(),
    data: createUserSchema,
  })
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar estructura batch
    const validated = batchSchema.parse(body);

    const results: BatchOperationResponse<UserData>[] = [];

    // Procesar cada operación
    for (const operation of validated.operations) {
      try {
        switch (operation.action) {
          case "create":
            // const created = await db.user.create({
            //   data: operation.data,
            // });
            // results.push({
            //   id: operation.id || created.id,
            //   status: "success",
            //   data: created,
            // });
            break;

          case "update":
            // Similar a PUT individual
            break;

          case "patch":
            // Similar a PATCH individual
            break;

          case "delete":
            // Similar a DELETE individual
            break;

          default:
            results.push({
              id: operation.id,
              status: "error",
              error: {
                code: "INVALID_ACTION",
                message: "Unknown action",
              },
            });
        }
      } catch (itemErr) {
        results.push({
          id: operation.id,
          status: "error",
          error: {
            code: "OPERATION_FAILED",
            message:
              itemErr instanceof Error
                ? itemErr.message
                : "Unknown error",
          },
        });
      }
    }

    // Calcular resumen
    const summary = {
      total: results.length,
      succeeded: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "error").length,
    };

    // return successResponse(
    //   { results, summary },
    //   req.headers.get("X-Request-ID") || undefined
    // );
  } catch (err) {
    return errorResponse(err, req.headers.get("X-Request-ID") || undefined);
  }
}
```

### Ejemplo 4: Validación completa en un endpoint

```ts
// IMPORTANTE: Este es el flujo recomendado para cualquier endpoint:

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { ValidationError } from "@/lib/api/errors";
import { z, ZodError } from "zod";
import { parseZodErrors } from "@/lib/api/request-standards";

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("X-Request-ID") || undefined;

  try {
    // 1. Validar Content-Type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new ValidationError("Content-Type must be application/json");
    }

    // 2. Parsear body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError("Invalid JSON in request body");
    }

    // 3. Validar con Zod
    const mySchema = z.object({
      email: z.string().email("Invalid email format"),
      name: z.string().min(1, "Name required"),
    });

    let validated: z.infer<typeof mySchema>;
    try {
      validated = mySchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ValidationError(
          "Validation failed",
          {
            status: 422,
            fields: parseZodErrors(err),
          }
        );
      }
      throw err;
    }

    // 4. Lógica de negocio
    // const resource = await createResource(validated);

    // 5. Retornar exitoso
    // return successResponse(resource, requestId);
  } catch (err) {
    // Errores se manejan automáticamente con errorResponse
    return errorResponse(err, requestId);
  }
}
```

### HELPER: Autenticación y Autorización

```ts
import { NextRequest } from "next/server";
import { AuthenticationError, ApiError } from "@/lib/api/errors";
import { ERROR } from "@/lib/api/error-codes";

export async function requireAuth(
  req: NextRequest
): Promise<{ userId: string; userRole: string }> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthenticationError("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);

  // Validar token JWT (pseudo-código)
  // const decoded = verifyJWT(token);
  // if (!decoded) {
  //   throw new AuthenticationError("Invalid or expired token");
  // }

  // return {
  //   userId: decoded.sub,
  //   userRole: decoded.role,
  // };
}

export async function requireRole(
  userId: string,
  requiredRoles: string[]
): Promise<void> {
  // const user = await db.user.findUnique({
  //   where: { id: userId },
  //   select: { role: true },
  // });

  // if (!user || !requiredRoles.includes(user.role)) {
  //   throw new ApiError(ERROR.INSUFFICIENT_PERMISSIONS, "Insufficient permissions", {
  //     status: 403,
  //     type: "auth_error",
  //   });
  // }
}

export async function requirePermission(
  userId: string,
  resource: string,
  action: string
): Promise<void> {
  // Validar permisos específicos
  // const hasPermission = await checkPermission(userId, resource, action);
  // if (!hasPermission) {
  //   throw new ApiError(ERROR.INSUFFICIENT_PERMISSIONS, "Forbidden", {
  //     status: 403,
  //   });
  // }
}

// ============================================================================
// Exportar tipos para usar en otros archivos
// ============================================================================

export {};
```
