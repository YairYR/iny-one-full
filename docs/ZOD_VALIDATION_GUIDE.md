# Guía de Validación con Zod

Patrones y mejores prácticas para validar requests en endpoints Next.js usando Zod, alineado con tu estructura de error responses.

---

## 📋 Tabla de Contenidos

1. [Conceptos Básicos](#conceptos-básicos)
2. [Esquemas Comunes](#esquemas-comunes)
3. [Validación de Requests](#validación-de-requests)
4. [Transformación de Datos](#transformación-de-datos)
5. [Mensajes de Error Personalizados](#mensajes-de-error-personalizados)
6. [Casos de Uso Avanzados](#casos-de-uso-avanzados)
7. [Testing Validación](#testing-validación)

---

## Conceptos Básicos

### Instalación

```bash
npm install zod
```

### Estructura Básica

```typescript
import { z } from "zod";

// Definir schema
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
});

// Validar datos
const data = { email: "user@example.com", age: 25 };
const result = userSchema.parse(data); // ✅ Success
```

---

## Esquemas Comunes

### 1. Tipos Primitivos

```typescript
import { z } from "zod";

const primitiveSchema = z.object({
  // Strings
  name: z.string(),
  slug: z.string().min(1).max(100),
  email: z.string().email(),
  url: z.string().url(),
  uuid: z.string().uuid(),
  
  // Numbers
  age: z.number().int().min(0).max(150),
  price: z.number().positive().multipleOf(0.01),
  
  // Booleans
  active: z.boolean(),
  
  // Dates
  createdAt: z.string().datetime(),
  birthDate: z.coerce.date(),
  
  // Enums
  role: z.enum(["user", "admin", "moderator"]),
  status: z.enum(["active", "inactive", "pending"]),
});
```

### 2. Arrays

```typescript
const arraySchema = z.object({
  // Array simple
  tags: z.array(z.string()),
  
  // Array con validación
  ids: z.array(z.string().uuid()).min(1).max(100),
  
  // Array de objetos
  items: z.array(
    z.object({
      id: z.string().uuid(),
      quantity: z.number().positive(),
    })
  ),
  
  // Array de enums
  permissions: z.array(z.enum(["read", "write", "delete"])),
});
```

### 3. Objetos Anidados

```typescript
const nestedSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    profile: z.object({
      firstName: z.string(),
      lastName: z.string(),
      bio: z.string().max(500).optional(),
    }),
  }),
});
```

### 4. Campos Opcionales

```typescript
const optionalSchema = z.object({
  // Campo opcional
  middleName: z.string().optional(),
  
  // Con valor por defecto
  role: z.enum(["user", "admin"]).default("user"),
  
  // Nullable
  deletedAt: z.string().datetime().nullable(),
  
  // Con nullish coalescing
  phone: z.string().optional().nullable(),
});
```

### 5. Discriminated Unions

Para múltiples tipos de datos:

```typescript
// Operación que puede ser create, update, o delete
const batchOperationSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    data: z.object({
      email: z.string().email(),
      name: z.string(),
    }),
  }),
  z.object({
    action: z.literal("update"),
    data: z.object({
      id: z.string().uuid(),
      name: z.string().optional(),
    }),
  }),
  z.object({
    action: z.literal("delete"),
    data: z.object({
      id: z.string().uuid(),
    }),
  }),
]);
```

---

## Validación de Requests

### Patrón Recomendado en Endpoints

```typescript
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/responses";
import { ValidationError } from "@/lib/api/errors";
import { z, ZodError } from "zod";
import { parseZodErrors } from "@/lib/api/request-standards";

const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
}).strict(); // .strict() rechaza campos adicionales

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("X-Request-ID");

  try {
    // 1. Validar Content-Type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new ValidationError(
        "Content-Type must be application/json"
      );
    }

    // 2. Parsear JSON
    let body: unknown;
    try {
      body = await req.json();
    } catch (err) {
      throw new ValidationError("Invalid JSON in request body");
    }

    // 3. Validar con Zod
    let validated: z.infer<typeof createUserSchema>;
    try {
      validated = createUserSchema.parse(body);
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
    // const user = await db.user.create({ data: validated });

    // 5. Response exitoso
    return successResponse({ /* user */ }, requestId || undefined);
  } catch (err) {
    return errorResponse(err, requestId || undefined);
  }
}
```

### Validación de Query Parameters

```typescript
import { baseQuerySchema } from "@/lib/api/request-standards";

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("X-Request-ID");

  try {
    // Extraer query params
    const query = Object.fromEntries(req.nextUrl.searchParams);

    // Validar
    const validated = baseQuerySchema.parse(query);

    // Usar valores validados
    const { page, limit, sort, order } = validated;

    return successResponse({ /* data */ }, requestId || undefined);
  } catch (err) {
    return errorResponse(err, requestId || undefined);
  }
}
```

### Validar antes de guardar

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = userSchema.parse(body);

    // Validaciones de negocio DESPUÉS de validación de schema
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      throw new ApiError(
        ERROR.DUPLICATE_ENTRY,
        "Email already registered",
        {
          status: 409,
          fields: { email: ["This email is already in use"] },
        }
      );
    }

    // Si todo está bien, crear
    const user = await db.user.create({ data: validated });
    return successResponse(user);
  } catch (err) {
    return errorResponse(err);
  }
}
```

---

## Transformación de Datos

### Coerce (Conversión automática)

```typescript
const schema = z.object({
  // Convierte string a number
  age: z.coerce.number(),
  
  // Convierte string a booleano
  active: z.coerce.boolean(),
  
  // Convierte string a Date
  birthDate: z.coerce.date(),
});

// "25" → 25, "true" → true
schema.parse({ age: "25", active: "true", birthDate: "1999-01-01" });
```

### Transform

```typescript
const userSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase()),
  name: z.string().transform((val) => val.trim()),
  age: z.number().transform((val) => Math.round(val)),
});

// "USER@EXAMPLE.COM " → "user@example.com"
userSchema.parse({ email: "USER@EXAMPLE.COM ", name: "  John  " });
```

### Refine (Validación condicional)

```typescript
const passwordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### Superrefine (Validaciones complejas)

```typescript
const complexSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).superRefine(({ startDate, endDate }, ctx) => {
  if (endDate < startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date",
      path: ["endDate"],
    });
  }
});
```

---

## Mensajes de Error Personalizados

### Mensajes Simples

```typescript
const schema = z.object({
  email: z.string().email("Must be a valid email address"),
  age: z.number().int("Must be an integer").min(0, "Must be positive"),
});
```

### Mensajes con Contexto

```typescript
const schema = z.object({
  name: z.string()
    .min(1, "Name cannot be empty")
    .max(100, "Name cannot exceed 100 characters"),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*]/, "Must contain special character"),
});
```

### Traducir Mensajes

```typescript
const errorMessages = {
  es: {
    email: {
      invalid: "Correo electrónico no válido",
    },
    password: {
      too_small: "La contraseña debe tener al menos 8 caracteres",
    },
  },
  en: {
    email: {
      invalid: "Invalid email address",
    },
    password: {
      too_small: "Password must be at least 8 characters",
    },
  },
};

// Utilizar con idioma detectado
const schema = z.object({
  email: z.string().email(
    errorMessages[userLanguage].email.invalid
  ),
});
```

---

## Casos de Uso Avanzados

### 1. Validar Cambios Parciales (PATCH)

```typescript
// PUT: Requiere todos los campos
const updateUserSchemaPUT = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["user", "admin"]),
}).strict();

// PATCH: Todos los campos son opcionales
const updateUserSchemaPATCH = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(["user", "admin"]).optional(),
}).strict();

// En el endpoint PATCH:
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = updateUserSchemaPATCH.parse(body);

    // Solo actualizar campos proporcionados
    const updated = await db.user.update({
      where: { id: params.id },
      data: validated,
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse(err);
  }
}
```

### 2. Validar Relaciones

```typescript
const createOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().positive(),
    })
  ).min(1),
}).superRefine(async ({ userId, items }, ctx) => {
  // Validar que usuario existe
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "User not found",
      path: ["userId"],
    });
  }

  // Validar que productos existen
  for (let i = 0; i < items.length; i++) {
    const product = await db.product.findUnique({
      where: { id: items[i].productId },
    });

    if (!product) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Product not found",
        path: ["items", i, "productId"],
      });
    }
  }
});
```

### 3. Reutilizar Esquemas

```typescript
// Base schema
const userBaseSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

// Crear usuario (requiere password)
const createUserSchema = userBaseSchema.extend({
  password: z.string().min(8),
});

// Actualizar usuario (sin password)
const updateUserSchema = userBaseSchema.partial();

// Extender base
const adminUserSchema = userBaseSchema.extend({
  role: z.enum(["admin", "moderator"]),
  permissions: z.array(z.string()),
});
```

### 4. Validar Archivos

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "File too large")
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Invalid file type"
    ),
  title: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title");

    const validated = uploadSchema.parse({ file, title });
    // Procesar archivo
  } catch (err) {
    return errorResponse(err);
  }
}
```

---

## Testing Validación

### Pruebas Básicas

```typescript
import { describe, it, expect } from "vitest";
import { userSchema } from "@/lib/schemas";

describe("userSchema", () => {
  it("should validate correct user data", () => {
    const data = {
      email: "user@example.com",
      name: "John Doe",
    };

    expect(() => userSchema.parse(data)).not.toThrow();
  });

  it("should reject invalid email", () => {
    const data = {
      email: "invalid-email",
      name: "John Doe",
    };

    expect(() => userSchema.parse(data)).toThrow();
  });

  it("should include field errors", () => {
    const data = {
      email: "invalid",
      name: "",
    };

    try {
      userSchema.parse(data);
    } catch (err) {
      expect(err.issues).toHaveLength(2);
      expect(err.issues[0].path).toContain("email");
    }
  });
});
```

### Mock de Base de Datos para Validación

```typescript
import { vi } from "vitest";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("schema with DB validation", () => {
  it("should reject duplicate email", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "1",
      email: "user@example.com",
    });

    const schema = userSchemaWithValidation;
    
    expect(async () => {
      await schema.parseAsync({
        email: "user@example.com",
        name: "John",
      });
    }).rejects.toThrow();
  });
});
```

---

## Checklist de Validación

- ✅ Usar `.strict()` para rechazar campos desconocidos
- ✅ Proporcionar mensajes de error claros
- ✅ Validar formato antes de validación de negocio
- ✅ Usar diferentes schemas para POST (crear) y PATCH (actualizar)
- ✅ Incluir errores de campos en response `fields`
- ✅ Transformar datos antes de guardar (trim, lowercase)
- ✅ Coercer tipos cuando sea apropiado (query params)
- ✅ Validar relaciones/existencia de recursos
- ✅ Escribir tests para casos edge
- ✅ Documentar reglas de validación complejas

---

## Referencias

- [Zod Documentation](https://zod.dev/)
- [Your Request Standards](/src/lib/api/request-standards.ts)
- [Your Error Responses](/src/lib/api/responses.ts)
- [Your Error Types](/src/lib/api/errors.ts)
