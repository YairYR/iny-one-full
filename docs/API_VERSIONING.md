# Estrategia de Versionamiento API

Guía completa para mantener múltiples versiones de la API, deprecar endpoints y migrar clientes de forma segura.

---

## 📋 Tabla de Contenidos

1. [Filosofía de Versionamiento](#filosofía-de-versionamiento)
2. [Estructura de Paths](#estructura-de-paths)
3. [Compatibilidad Hacia Atrás](#compatibilidad-hacia-atrás)
4. [Estrategia de Deprecation](#estrategia-de-deprecation)
5. [Migración de Clientes](#migración-de-clientes)
6. [Implementación Técnica](#implementación-técnica)
7. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Filosofía de Versionamiento

### Por qué Versionamiento?

- **Estabilidad**: Los clientes existentes no se rompen
- **Innovación**: Puedes hacer cambios sin bloqueos
- **Control**: Deprecar endpoints de forma ordenada
- **Comunicación**: Fácil de documentar cambios

### Cuándo Cambiar de Versión?

| Cambio | Versión | Acción |
|--------|---------|--------|
| Agregar campo nuevo | **MINOR** | Compatible, NO nueva versión |
| Eliminar campo | **MAJOR** | Rompe compatibilidad |
| Cambiar tipo de campo | **MAJOR** | Rompe compatibilidad |
| Renombrar campo | **MAJOR** | Rompe compatibilidad |
| Cambiar HTTP method | **MAJOR** | Rompe compatibilidad |
| Cambiar status code | **MAJOR** | Rompe compatibilidad |
| Cambiar path | **MAJOR** | Rompe compatibilidad |

**Regla de Oro**: Si rompes algo, incrementa versión MAJOR.

---

## Estructura de Paths

### URL Scheme

```
https://api.example.com/api/v{N}/{resource}/{id}
```

### Ejemplos de Versionamiento

```
✅ /api/v1/users                    (Versión 1)
✅ /api/v2/users                    (Versión 2)
✅ /api/v3/users                    (Versión 3 - nueva versión major)

❌ /api/users/v1                    (Evitar: versión al final)
❌ /api/users?version=1             (Evitar: query parameter)
❌ /v1/api/users                    (Evitar: versión al inicio)
```

### Estructura de Directorios en Next.js

```
app/
├── api/
│   ├── v1/
│   │   ├── users/
│   │   │   ├── route.ts            (GET, POST)
│   │   │   └── [id]/
│   │   │       └── route.ts        (GET, PUT, PATCH, DELETE)
│   │   ├── orders/
│   │   │   └── route.ts
│   │   └── health/
│   │       └── route.ts
│   │
│   ├── v2/
│   │   ├── users/
│   │   │   ├── route.ts            (Nueva versión con cambios)
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── products/
│   │       └── route.ts
│   │
│   └── health/                      (Sin versión = disponible en todas)
│       └── route.ts
```

### Endpoints Sin Versión

Algunos endpoints NO necesitan versionamiento:

```
/api/health              (Health checks)
/api/status              (Status API)
/api/auth/login          (Autenticación core)
/api/auth/logout         (Autenticación core)
```

---

## Compatibilidad Hacia Atrás

### ✅ Cambios Seguros (SIN nueva versión)

```typescript
// V1
{
  "id": "123",
  "name": "John",
  "email": "john@example.com"
}

// V1 + actualización (compatible)
{
  "id": "123",
  "name": "John",
  "email": "john@example.com",
  "phone": "555-1234"        // ✅ Nuevo campo
}
```

**Clientes viejos simplemente ignoran el nuevo campo.**

### ❌ Cambios que Rompen (NUEVA versión)

```typescript
// V1
{
  "id": "123",
  "name": "John",
  "email": "john@example.com"
}

// V2 (rompe compatibilidad)
{
  "user_id": "123",          // ❌ Renombrado: id → user_id
  "full_name": "John",       // ❌ Renombrado: name → full_name
  "email_address": "john@example.com"  // ❌ Renombrado: email → email_address
}
```

**Clientes viejos se rompen porque esperan campos con nombres diferentes.**

### Request Parameters

```typescript
// V1: params separados
GET /api/v1/users?page=1&limit=20&offset=0

// V2: agregar pagination_style (compatible)
GET /api/v2/users?page=1&limit=20&pagination_style=page

// V3: cambiar completamente (rompe)
GET /api/v3/users?pagination[page]=1&pagination[limit]=20
```

---

## Estrategia de Deprecation

### Fases de Deprecation

#### Fase 1: Announcement (Mes 1)
- Anunciar que endpoint será deprecado
- Email a todos los clientes
- Blog post
- 3-6 meses antes de eliminar

```
Subject: [DEPRECATION] POST /api/v1/users/{id}/send-email será eliminado

Queridos clientes,

El endpoint POST /api/v1/users/{id}/send-email será deprecado el 2024-06-30.

Por favor, migrar a: POST /api/v2/users/{id}/notify

Detalles: https://docs.example.com/migration-guide
```

#### Fase 2: Soft Deprecation (Mes 2)
- Agregar headers de deprecación
- Registrar uso en logs
- Continuar funcionando

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Wed, 30 Jun 2024 00:00:00 GMT
Link: </api/v2/users>; rel="successor-version"
X-API-Warn: "This endpoint is deprecated. Use /api/v2/users instead"
```

#### Fase 3: Hard Deprecation (Después de Sunset)
- Retornar `410 Gone`
- Ya no ejecutar lógica
- Forzar migración

```http
HTTP/1.1 410 Gone
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "ENDPOINT_DEPRECATED",
    "message": "This endpoint has been permanently removed. Please use /api/v2/users instead.",
    "status": 410,
    "type": "deprecation",
    "migrationGuide": "https://docs.example.com/migration-guide"
  },
  "meta": {
    "requestId": "req-123",
    "timestamp": "2024-07-01T00:00:00Z"
  }
}
```

#### Fase 4: Complete Removal
- Eliminar endpoint completamente
- Documentación histórica

### Timeline Recomendado

```
Day 0:    Announcement (blog, email, docs)
Week 2:   Soft deprecation headers
Month 3:  Reminder email
Month 5:  Final warning
Month 6:  Hard deprecation (410 Gone)
Month 9:  Complete removal
```

---

## Migración de Clientes

### Detección de Versión en Uso

```typescript
// Middleware para registrar versión usada por cliente
export function deprecationMiddleware(req: NextRequest) {
  const version = req.nextUrl.pathname.match(/\/api\/(v\d+)\//)?.[1];
  
  if (version) {
    // Log para analytics
    console.log(`API version ${version} used by ${req.ip}`);
    
    // Si es v1, enviar warning header
    if (version === "v1") {
      return addDeprecationHeaders(version);
    }
  }
}
```

### Guía de Migración

```markdown
# Guía: Migrar de v1 a v2

## Cambios Principales

### 1. Nombres de Campos

| v1 | v2 |
|----|----|
| `id` | `user_id` |
| `name` | `full_name` |
| `email` | `email_address` |

### 2. Nuevos Campos Requeridos

- `department` (requerido en v2)

### 3. Campos Removidos

- `legacy_id` (removido en v2)

## Ejemplo de Migración

### v1 Request
```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### v2 Request
```http
POST /api/v2/users
Content-Type: application/json

{
  "full_name": "John Doe",
  "email_address": "john@example.com",
  "department": "engineering"
}
```

## Testing

```javascript
// test con ambas versiones
async function testBothVersions() {
  const v1Response = await fetch('/api/v1/users', options);
  const v2Response = await fetch('/api/v2/users', options);
  
  console.assert(v1Response.ok, 'v1 still works');
  console.assert(v2Response.ok, 'v2 works');
}
```
```

---

## Implementación Técnica

### Soporte Multi-Versión

#### Opción 1: Archivos Separados (Recomendado)

```
app/api/v1/users/route.ts    (Implementación v1)
app/api/v2/users/route.ts    (Implementación v2)
```

**Ventajas**: Claro, aislado, fácil de mantener
**Desventajas**: Duplicación de código

#### Opción 2: Lógica Compartida

```typescript
// lib/users/v1-handlers.ts
export async function getUsersV1(req) { ... }

// lib/users/v2-handlers.ts
export async function getUsersV2(req) { ... }

// app/api/v1/users/route.ts
export async function GET(req) {
  return getUsersV1(req);
}

// app/api/v2/users/route.ts
export async function GET(req) {
  return getUsersV2(req);
}
```

**Ventajas**: Menos duplicación
**Desventajas**: Más complejo

#### Opción 3: Middleware de Versión

```typescript
// lib/api/version-handler.ts
export function createVersionedHandler(handlers: {
  v1?: (req: NextRequest) => Promise<Response>;
  v2?: (req: NextRequest) => Promise<Response>;
}) {
  return async (req: NextRequest) => {
    const version = extractVersion(req.url);
    const handler = handlers[version];
    
    if (!handler) {
      return errorResponse({
        code: "UNSUPPORTED_VERSION",
        message: `API version ${version} not supported`,
        status: 400,
      });
    }
    
    return handler(req);
  };
}

// app/api/users/route.ts
export const GET = createVersionedHandler({
  v1: async (req) => { /* v1 logic */ },
  v2: async (req) => { /* v2 logic */ },
});
```

### Helpers para Deprecation

```typescript
// lib/api/deprecation.ts

export function addDeprecationHeaders(
  response: NextResponse,
  options: {
    sunsetDate: Date;
    successorUrl: string;
    message?: string;
  }
): NextResponse {
  response.headers.set("Deprecation", "true");
  response.headers.set(
    "Sunset",
    options.sunsetDate.toUTCString()
  );
  response.headers.set(
    "Link",
    `<${options.successorUrl}>; rel="successor-version"`
  );

  if (options.message) {
    response.headers.set("X-API-Warn", options.message);
  }

  return response;
}

export function throwDeprecatedEndpoint(
  successorUrl: string
): never {
  throw new ApiError(
    "ENDPOINT_DEPRECATED",
    `This endpoint has been deprecated. Use ${successorUrl} instead.`,
    {
      status: 410,
      type: "deprecation",
    }
  );
}
```

---

## Ejemplos Prácticos

### Escenario 1: Deprecar Campo

```typescript
// v1/users/route.ts (original)
export async function GET(req: NextRequest) {
  const users = await db.user.findMany();
  return successResponse(users);
  // Response incluye: id, name, email, legacy_field
}

// v2/users/route.ts (mejorado)
export async function GET(req: NextRequest) {
  const users = await db.user.findMany();
  
  // Remover legacy_field en v2
  return successResponse(
    users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      // legacy_field removido
    }))
  );
}
```

### Escenario 2: Cambiar Estructura de Response

```typescript
// v1: Array plano
// GET /api/v1/users → [{ id, name }, ...]

// v2: Objeto con metadata
// GET /api/v2/users → { data: [...], meta: { ... } }

// Implementación
// v1/users/route.ts
export async function GET(req: NextRequest) {
  const users = await db.user.findMany();
  return successResponse(users); // Solo data
}

// v2/users/route.ts
export async function GET(req: NextRequest) {
  const users = await db.user.findMany();
  return successResponse(users, req.headers.get("X-Request-ID"));
  // Incluye requestId, timestamp en meta
}
```

### Escenario 3: Agregar Parámetro Requerido

```typescript
// v1: email opcional
const createUserSchemaV1 = z.object({
  name: z.string(),
  email: z.string().email().optional(),
});

// v2: email requerido
const createUserSchemaV2 = z.object({
  name: z.string(),
  email: z.string().email(),
  department: z.string(),
});

// Endpoints
// POST /api/v1/users → email opcional
// POST /api/v2/users → email + department requeridos
```

---

## Documentación de Cambios

### Archivo de Cambios (CHANGELOG.md)

```markdown
# Changelog API

## [2.0.0] - 2024-06-01

### Changed
- Renombrado campo `name` → `full_name` en usuarios
- Cambiado formato de respuesta: array → objeto con metadata

### Added
- Nuevo campo `department` (requerido)
- Nuevo endpoint POST `/api/v2/users/batch`

### Removed
- Campo `legacy_id` (usar `id` en su lugar)
- Endpoint deprecado POST `/api/v1/users/{id}/send-email`

### Deprecated
- Endpoint `/api/v1/users` (Sunset: 2024-09-01)

## [1.5.0] - 2024-03-01

### Added
- Nuevo parámetro `include_metadata` en GET /api/v1/users

## [1.0.0] - 2024-01-01

### Added
- Initial release
```

### API Reference Versioned

```
docs/
├── api/
│   ├── v1/
│   │   ├── users.md
│   │   ├── orders.md
│   │   └── README.md
│   ├── v2/
│   │   ├── users.md (cambios desde v1)
│   │   ├── products.md (nuevo en v2)
│   │   └── README.md
│   └── migration-guide.md
```

---

## Best Practices

✅ **DO:**
- Mantener v1 activa mientras v2 está en beta
- Proporcionar tiempo de transición (mínimo 3 meses)
- Documentar cambios claramente
- Usar headers de deprecación
- Soportar múltiples versiones en paralelo
- Registrar uso de versiones deprecadas
- Comunicar temprano y frecuentemente

❌ **DON'T:**
- Cambiar versión major por cambios menores
- Eliminar versiones sin aviso
- Forzar migración sin período de transición
- Ignorar clientes en versiones antiguas
- Hacer cambios breaking en versiones minor
- Soportar más de 3 versiones major simultáneamente

---

## Referencias

- [Semantic Versioning](https://semver.org/)
- [API Evolution Best Practices](https://swagger.io/resources/articles/best-practices-in-api-versioning/)
- [Your API Standards](/docs/API_STANDARDS.md)
