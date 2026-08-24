# Estándares de Request API

Guía completa de convenciones y best practices para construir requests a la API. Alineado con la estructura de responses definida en `/src/lib/api/responses.ts`.

---

## 📋 Tabla de Contenidos

1. [Estructura de Paths](#estructura-de-paths)
2. [HTTP Methods](#http-methods)
3. [Query Parameters](#query-parameters)
4. [Request Headers](#request-headers)
5. [Request Body](#request-body)
6. [Status Codes & Error Handling](#status-codes--error-handling)
7. [Versionamiento](#versionamiento)
8. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Estructura de Paths

### Convención General

```
/api/v{version}/{resource}/{resourceId}/{subresource}/{action}
```

### Reglas

| Aspecto | Regla | Ejemplo |
|---------|-------|---------|
| **Versión** | Requerida, formato `/v{N}` | `/api/v1/` |
| **Recurso** | Plural, lowercase, kebab-case | `/api/v1/users` |
| **ID de Recurso** | UUID o ID numérico | `/api/v1/users/550e8400-e29b-41d4-a716-446655440000` |
| **Sub-recurso** | Plural, relacionado al padre | `/api/v1/users/{id}/orders` |
| **Acciones** | Raro, solo para operaciones no-CRUD | `/api/v1/auth/refresh`, `/api/v1/payments/execute` |

### Ejemplos Correctos

```
✅ GET    /api/v1/users                          (Listar usuarios)
✅ POST   /api/v1/users                          (Crear usuario)
✅ GET    /api/v1/users/123                      (Obtener usuario específico)
✅ PUT    /api/v1/users/123                      (Actualizar usuario completo)
✅ PATCH  /api/v1/users/123                      (Actualizar parcial)
✅ DELETE /api/v1/users/123                      (Eliminar usuario)
✅ GET    /api/v1/users/123/orders               (Obtener órdenes del usuario)
✅ POST   /api/v1/orders/123/payment             (Acciones custom)
❌ GET    /api/v1/getUsers                       (Verbo en el path)
❌ POST   /api/v1/user/123/createOrder           (Singular + verbo)
❌ GET    /api/v1/users/list                     (Verbo redundante)
```

---

## HTTP Methods

### Semántica Correcta

#### GET - Obtener Recurso(s)
- **Uso**: Recuperar datos sin modificar el estado
- **Idempotente**: ✅ Sí
- **Body**: ❌ No debe tener body
- **Status esperados**: 200, 304, 404, 401, 403

```http
GET /api/v1/users/123
Authorization: Bearer {token}
```

#### POST - Crear Recurso
- **Uso**: Crear un nuevo recurso o desencadenar una acción
- **Idempotente**: ❌ No
- **Body**: ✅ Sí (JSON)
- **Status esperados**: 201, 400, 422, 401, 403, 409

```http
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer {token}

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### PUT - Reemplazar Recurso Completo
- **Uso**: Actualizar completamente un recurso (requiere todos los campos)
- **Idempotente**: ✅ Sí
- **Body**: ✅ Sí (JSON)
- **Status esperados**: 200, 204, 400, 404, 422, 401, 403

```http
PUT /api/v1/users/123
Content-Type: application/json
Authorization: Bearer {token}

{
  "email": "new@example.com",
  "name": "Jane Doe",
  "role": "admin"
}
```

#### PATCH - Actualización Parcial
- **Uso**: Actualizar solo algunos campos de un recurso
- **Idempotente**: ✅ Sí (generalmente)
- **Body**: ✅ Sí (JSON)
- **Status esperados**: 200, 204, 400, 404, 422, 401, 403

```http
PATCH /api/v1/users/123
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Jane Updated"
}
```

#### DELETE - Eliminar Recurso
- **Uso**: Eliminar un recurso
- **Idempotente**: ✅ Sí
- **Body**: ❌ No
- **Status esperados**: 200, 204, 404, 401, 403

```http
DELETE /api/v1/users/123
Authorization: Bearer {token}
```

### Comparativa PUT vs PATCH

| Aspecto | PUT | PATCH |
|---------|-----|-------|
| **Reemplaza** | Todo el recurso | Solo campos enviados |
| **Campos omitidos** | Se establecen a null/default | Se ignoran |
| **Idempotencia** | Garantizada | Generalmente sí |
| **Body completo** | Requerido | Opcional |
| **Uso recomendado** | Actualizaciones completas | Actualizaciones parciales |

---

## Query Parameters

### Convenciones

#### Paginación
```
GET /api/v1/users?page=1&limit=20&offset=0
```

| Parámetro | Tipo | Descripción | Defecto | Max |
|-----------|------|-------------|---------|-----|
| `page` | integer | Número de página (1-based) | 1 | - |
| `limit` | integer | Items por página | 20 | 100 |
| `offset` | integer | Desplazamiento total de items | - | - |

**Recomendación**: Usa `limit` + `offset` para mejor rendimiento en BD, o `page` + `limit` para UX.

#### Ordenamiento
```
GET /api/v1/users?sort=created_at&order=desc
GET /api/v1/users?sort=-created_at    (short form)
```

| Parámetro | Tipo | Valores | Ejemplo |
|-----------|------|--------|---------|
| `sort` | string | Campo a ordenar | `sort=name` o `sort=created_at` |
| `order` | enum | `asc`, `desc` | `order=desc` |
| **Short form** | string | `-` prefijo para DESC | `sort=-created_at` |

#### Filtros
```
GET /api/v1/users?role=admin&status=active&created_from=2024-01-01
```

- Nombres en singular cuando sea posible: `role`, `status`, `type`
- Usa `_from` / `_to` para rangos: `created_from`, `created_to`
- Valores specificos separados por coma: `status=active,pending`
- URL-encode valores especiales

#### Búsqueda
```
GET /api/v1/users?search=john&searchFields=name,email
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `search` | string | Término de búsqueda |
| `searchFields` | string | Campos a buscar (comma-separated) |

#### Inclusión de Relaciones
```
GET /api/v1/users/123?include=orders,invoices
```

- Lista campos relacionados que deseas incluir
- Evita N+1 queries

#### Campos a Retornar
```
GET /api/v1/users?fields=id,name,email
```

- Selecciona solo los campos necesarios
- Reduce payload

### Ejemplo Completo
```
GET /api/v1/orders?page=2&limit=50&sort=-created_at&status=completed&include=customer,items&fields=id,status,total,created_at
```

---

## Request Headers

### Headers Requeridos

```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

### Headers Recomendados

```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-Request-ID: {uuid}              ; Para tracing
X-API-Version: 1                  ; Versión de cliente
User-Agent: MyApp/1.0             ; Identifica el cliente
Accept: application/json          ; Formato esperado
Accept-Language: es-ES            ; Preferencia de idioma
```

### Headers de Respuesta Esperados

```http
Content-Type: application/json; charset=utf-8
X-Request-ID: {uuid}                          ; Echo del cliente o generado
RateLimit-Limit: 1000                         ; Límite de rate limit
RateLimit-Remaining: 995                      ; Requests restantes
RateLimit-Reset: 1640995200                   ; Timestamp de reset
```

---

## Request Body

### Estructura Estándar

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "metadata": {
    "source": "mobile_app",
    "campaign": "summer_2024"
  }
}
```

### Reglas

1. **Nombres de campos**: camelCase, no snake_case
2. **Valores nulos**: Usa `null` explícitamente o omite el campo
3. **Arrays**: Solo para colecciones reales
4. **Objetos anidados**: Máximo 3 niveles de profundidad
5. **Tamaño máximo**: 10MB por defecto (configurable)

### Batch Operations

Para operaciones en múltiples recursos:

```http
POST /api/v1/users/batch/create
Content-Type: application/json

{
  "operations": [
    { "action": "create", "data": { "email": "user1@example.com" } },
    { "action": "create", "data": { "email": "user2@example.com" } }
  ]
}
```

O con endpoint específico:

```http
POST /api/v1/users/batch
Content-Type: application/json

[
  { "email": "user1@example.com", "name": "User 1" },
  { "email": "user2@example.com", "name": "User 2" }
]
```

---

## Status Codes & Error Handling

### Status Codes de Éxito

| Code | Situación | Cuando usar |
|------|-----------|------------|
| **200** | OK | GET, PUT, PATCH exitosos |
| **201** | Created | POST que crea nuevo recurso |
| **202** | Accepted | Operación asíncrona aceptada |
| **204** | No Content | DELETE exitoso, o PATCH sin respuesta |
| **304** | Not Modified | GET con ETag sin cambios |

### Status Codes de Error

| Code | Error | Cuándo | ApiError Class |
|------|-------|--------|-----------------|
| **400** | Bad Request | Request malformado | `PayloadError` |
| **401** | Unauthorized | Falta autenticación | `AuthenticationError` |
| **403** | Forbidden | Autenticado pero sin permisos | `ApiError` (FORBIDDEN) |
| **404** | Not Found | Recurso no existe | `ResourceNotFoundError` |
| **409** | Conflict | Conflicto (ej: email duplicado) | `ApiError` (DUPLICATE_ENTRY) |
| **422** | Unprocessable Entity | Validación fallida | `ValidationError` |
| **429** | Too Many Requests | Rate limit excedido | `ApiError` (RATE_LIMIT_EXCEEDED) |
| **500** | Internal Error | Error del servidor | `ServiceError` |
| **502** | Bad Gateway | Proveedor externo error | `ProviderError` |
| **503** | Unavailable | Servicio temporalmente caído | `ApiError` (SERVICE_UNAVAILABLE) |

### Estructura de Error Response

**Todos los errores devuelven:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "status": 422,
    "type": "validation_error",
    "fields": {
      "email": ["Must be a valid email"],
      "password": ["Must be at least 8 characters"]
    }
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

### Códigos de Error Disponibles

Ver `/src/lib/api/error-codes.ts` para lista completa. Ejemplos:

- `NOT_FOUND`: Recurso no existe
- `VALIDATION_ERROR`: Falló validación de campos
- `INVALID_TOKEN`: Token JWT inválido/expirado
- `UNAUTHORIZED`: Falta autenticación
- `FORBIDDEN`: Sin permisos
- `DUPLICATE_ENTRY`: Violación de constraint único
- `RATE_LIMIT_EXCEEDED`: Demasiadas solicitudes
- `PROVIDER_ERROR`: Error de servicio externo (PayPal, etc)

---

## Versionamiento

### Estrategia de Versionamiento

Usa versionamiento en el path: `/api/v{N}/`

```
/api/v1/users      (Versión 1)
/api/v2/users      (Versión 2)
```

### Deprecation Strategy

1. **Fase 1 - Announcement**: Anunciar deprecación (email, docs)
2. **Fase 2 - Soft Deprecation**: Agregar header `Deprecation: true`
   ```http
   Deprecation: true
   Sunset: Wed, 01 Jan 2025 00:00:00 GMT
   Link: </api/v2/users>; rel="successor-version"
   ```
3. **Fase 3 - Hard Deprecation**: Retornar 410 Gone después de fecha
4. **Fase 4 - Removal**: Eliminar endpoint

### Compatibilidad Hacia Atrás

- Agregar campos nuevos = Compatible
- Eliminar campos = Rompe compatibilidad (nueva versión)
- Cambiar tipo de campo = Rompe compatibilidad (nueva versión)
- Renombrar campos = Rompe compatibilidad (nueva versión)

**Regla de oro**: Si rompes algo, incrementa la versión major.

---

## Ejemplos Prácticos

### CRUD Básico: Usuarios

#### Listar Usuarios
```http
GET /api/v1/users?page=1&limit=20&sort=-created_at
Authorization: Bearer token123
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "created_at": "2024-01-10T15:30:00Z",
      "updated_at": "2024-01-15T10:20:00Z"
    }
  ],
  "meta": {
    "requestId": "req-123",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### Crear Usuario
```http
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer token123

{
  "email": "jane@example.com",
  "name": "Jane Doe",
  "password": "SecurePassword123!"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "user",
    "created_at": "2024-01-15T10:30:45Z"
  },
  "meta": {
    "requestId": "req-124",
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

#### Actualizar Usuario (Completo)
```http
PUT /api/v1/users/660e8400-e29b-41d4-a716-446655440001
Content-Type: application/json
Authorization: Bearer token123

{
  "email": "jane.updated@example.com",
  "name": "Jane Updated",
  "role": "admin",
  "status": "active"
}
```

#### Actualizar Usuario (Parcial)
```http
PATCH /api/v1/users/660e8400-e29b-41d4-a716-446655440001
Content-Type: application/json
Authorization: Bearer token123

{
  "name": "Jane Partially Updated"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "email": "jane.updated@example.com",
    "name": "Jane Partially Updated",
    "role": "admin",
    "updated_at": "2024-01-15T11:30:45Z"
  },
  "meta": {
    "requestId": "req-125",
    "timestamp": "2024-01-15T11:30:45.123Z"
  }
}
```

#### Eliminar Usuario
```http
DELETE /api/v1/users/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer token123
```

**Response 204:** Sin contenido

#### Búsqueda Avanzada
```http
GET /api/v1/users?search=jane&role=admin&status=active&created_from=2024-01-01&created_to=2024-12-31&sort=-created_at&page=1&limit=20&include=orders
Authorization: Bearer token123
```

### Operación Personalizada: Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  },
  "meta": {
    "requestId": "req-126",
    "timestamp": "2024-01-15T11:30:45.123Z"
  }
}
```

### Error: Validación Fallida

```http
POST /api/v1/users
Content-Type: application/json

{
  "email": "invalid-email",
  "name": ""
}
```

**Response 422:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "status": 422,
    "type": "validation_error",
    "fields": {
      "email": ["Must be a valid email address"],
      "name": ["Must not be empty"]
    }
  },
  "meta": {
    "requestId": "req-127",
    "timestamp": "2024-01-15T11:30:45.123Z"
  }
}
```

### Error: Recurso No Encontrado

```http
GET /api/v1/users/999999
Authorization: Bearer token123
```

**Response 404:**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found",
    "status": 404,
    "type": "resource"
  },
  "meta": {
    "requestId": "req-128",
    "timestamp": "2024-01-15T11:30:45.123Z"
  }
}
```

---

## Best Practices Resumidas

✅ **DO:**
- Usar nombres de recursos en plural
- Usar camelCase en request/response bodies
- Incluir `requestId` en todos los responses
- Incluir `timestamp` ISO 8601 en todas las respuestas
- Validar con Zod en todos los endpoints
- Documentar deprecated endpoints
- Rate limit adecuadamente
- Cachear GET requests cuando sea posible

❌ **DON'T:**
- Incluir verbos en los paths
- Mezclar snake_case y camelCase
- Cambiar status codes arbitrariamente
- Devolver datos sensibles en errores
- Olvidar paginación en listados
- Ignorar versionamiento de API
- Cambiar campo tipos sin cambiar versión

---

## Referencias

- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpwg.org/specs/rfc9110.html)
- [JSON:API Specification](https://jsonapi.org/)
- [Your API Response Types](/src/lib/types/api.ts)
- [Your Error Codes](/src/lib/api/error-codes.ts)
