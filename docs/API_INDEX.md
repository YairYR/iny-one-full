# 📚 Estándares de API - Índice

Documentación completa de estándares para requests y responses de tu API, alineados con best practices REST y tu arquitectura actual.

---

## 🚀 Inicio Rápido

### Para Crear un Nuevo Endpoint

1. **Decidir path**: `/api/v{N}/{recurso}/{id}`
2. **Elegir HTTP method**: GET, POST, PUT, PATCH, DELETE
3. **Validar request**: Crear Zod schema con `.strict()`
4. **Implementar lógica**: Seguir patrón en [EXAMPLES_CRUD_ENDPOINTS.md](./EXAMPLES_CRUD_ENDPOINTS.md)
5. **Retornar response**: Usar `successResponse()` o `errorResponse()`

---

## 📖 Documentación Disponible

### 1. **[API_STANDARDS.md](./API_STANDARDS.md)** - Guía Principal
La referencia completa con:
- ✅ Estructura de paths (naming, versioning)
- ✅ HTTP methods y semántica (GET, POST, PUT, PATCH, DELETE)
- ✅ Query parameters (paginación, filtros, búsqueda)
- ✅ Request headers requeridos
- ✅ Request body patterns
- ✅ Status codes y error handling
- ✅ Ejemplos completos de CRUD

**Cuándo usar**: Necesitas entender convenciones generales, ver ejemplos de requests/responses.

---

### 2. **[src/lib/api/request-standards.ts](../src/lib/api/request-standards.ts)** - Tipos & Utilidades
Tipos TypeScript reutilizables:

```typescript
import {
  // Tipos
  PaginationParams,
  SortParams,
  FilterParams,
  QueryParams,
  
  // Schemas Zod
  paginationSchema,
  sortSchema,
  baseQuerySchema,
  
  // Helpers
  validateBaseQuery,
  calculatePaginationMeta,
  buildSelectFields,
  parseIncludeParam,
  parseZodErrors,
} from "@/lib/api/request-standards";
```

**Cuándo usar**: Necesitas tipar parámetros, validar queries, o reutilizar schemas.

---

### 3. **[EXAMPLES_CRUD_ENDPOINTS.md](./EXAMPLES_CRUD_ENDPOINTS.md)** - Ejemplos Prácticos
Implementación comentada de:
- GET (listar y obtener individual)
- POST (crear)
- PUT (actualizar completo)
- PATCH (actualizar parcial)
- DELETE (eliminar)
- Batch operations
- Autenticación & autorización

**Cuándo usar**: Necesitas implementar un nuevo endpoint, patrones para auth/permisos.

---

### 4. **[ZOD_VALIDATION_GUIDE.md](./ZOD_VALIDATION_GUIDE.md)** - Validación Detallada
Patrones de validación:
- ✅ Esquemas básicos (strings, numbers, emails, dates)
- ✅ Arrays y objetos anidados
- ✅ Campos opcionales y valores por defecto
- ✅ Transformaciones y coercion
- ✅ Validaciones condicionales (refine, superRefine)
- ✅ Mensajes de error personalizados
- ✅ Testing de validación

**Cuándo usar**: Necesitas entender cómo validar datos complejos, mensajes de error personalizados.

---

### 5. **[API_VERSIONING.md](./API_VERSIONING.md)** - Gestión de Versiones
Estrategia de versionamiento:
- ✅ Cuándo cambiar de versión
- ✅ Compatibilidad hacia atrás
- ✅ Plan de deprecación (4 fases)
- ✅ Migración de clientes
- ✅ Ejemplos de cambios (campos, estructura)

**Cuándo usar**: Necesitas hacer cambios que rompen compatibilidad, deprecar endpoints.

---

## 🏗️ Arquitectura de Archivos

```
proyecto/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── responses.ts          (✅ Existente)
│   │   │   ├── errors.ts              (✅ Existente)
│   │   │   ├── error-codes.ts         (✅ Existente)
│   │   │   ├── types/api.ts           (✅ Existente)
│   │   │   └── request-standards.ts   (🆕 Tipos & helpers)
│   │   └── ...
│   └── app/
│       ├── api/
│       │   ├── v1/                    (Versión 1)
│       │   │   ├── users/
│       │   │   │   ├── route.ts       (GET list, POST create)
│       │   │   │   └── [id]/
│       │   │   │       └── route.ts   (GET one, PUT, PATCH, DELETE)
│       │   │   ├── orders/
│       │   │   └── ...
│       │   │
│       │   ├── v2/                    (Versión 2 - futuro)
│       │   │   ├── users/
│       │   │   └── ...
│       │   │
│       │   └── health/                (Sin versión)
│       │       └── route.ts
│       └── ...
│
└── docs/
    ├── API_STANDARDS.md               (🆕 Guía principal)
    ├── EXAMPLES_CRUD_ENDPOINTS.md     (🆕 Ejemplos)
    ├── ZOD_VALIDATION_GUIDE.md        (🆕 Validación)
    ├── API_VERSIONING.md              (🆕 Versionamiento)
    └── API_INDEX.md                   (este archivo)
```

---

## 🔍 Quick Reference

### Path Structure

```
/api/v{N}/{resource}/{id}/{subresource}/{action}
```

| Componente | Ejemplo | Notas |
|-----------|---------|-------|
| Versión | `v1` | Formato: `/v{N}` |
| Recurso | `users` | Plural, lowercase |
| ID | `550e8400...` | UUID o numeric |
| Sub-recurso | `orders` | Relacionado al padre |
| Acción | `execute` | Solo para operaciones custom |

### HTTP Methods

| Method | Recurso | Semántica | Idempotente | Status |
|--------|---------|-----------|------------|--------|
| **GET** | `/users` | Listar | ✅ | 200, 304, 404 |
| **GET** | `/users/123` | Obtener uno | ✅ | 200, 404 |
| **POST** | `/users` | Crear | ❌ | 201, 400, 409 |
| **PUT** | `/users/123` | Reemplazar | ✅ | 200, 400, 404 |
| **PATCH** | `/users/123` | Actualizar parcial | ✅ | 200, 400, 404 |
| **DELETE** | `/users/123` | Eliminar | ✅ | 204, 404 |

### Status Codes Comunes

| Code | Significado | Cuándo | Error Class |
|------|-----------|--------|-------------|
| **200** | OK | GET, PUT, PATCH exitoso | - |
| **201** | Created | POST exitoso | - |
| **204** | No Content | DELETE exitoso | - |
| **400** | Bad Request | Request malformado | `PayloadError` |
| **401** | Unauthorized | Sin autenticación | `AuthenticationError` |
| **403** | Forbidden | Sin permisos | `ApiError` (FORBIDDEN) |
| **404** | Not Found | Recurso no existe | `ResourceNotFoundError` |
| **409** | Conflict | Duplicado/conflicto | `ApiError` (DUPLICATE_ENTRY) |
| **422** | Unprocessable | Validación fallida | `ValidationError` |
| **500** | Server Error | Error interno | `ServiceError` |

### Query Parameters

```
?page=1&limit=20&sort=-created_at&status=active&include=orders
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | int | Número de página (1-based) |
| `limit` | int | Items por página (max 100) |
| `sort` | str | Campo a ordenar (prefijo `-` para DESC) |
| `order` | enum | `asc` o `desc` (alternativa a `sort:-field`) |
| `search` | str | Término de búsqueda |
| `searchFields` | str | Campos donde buscar (comma-separated) |
| `include` | str | Relaciones a incluir (comma-separated) |
| `fields` | str | Campos a retornar (comma-separated) |

---

## 🎯 Checklist para Nuevo Endpoint

- [ ] Path sigue convención: `/api/v{N}/{recurso}/{id}`
- [ ] HTTP method es semánticamente correcto
- [ ] Schema Zod definido con `.strict()`
- [ ] Validación de query params usando `baseQuerySchema`
- [ ] Manejo de errores con `errorResponse()`
- [ ] Response exitoso con `successResponse()`
- [ ] Status codes correctos (201 para POST, 204 para DELETE)
- [ ] Autenticación validada si es requerida
- [ ] Permisos verificados si es requerida
- [ ] Relaciones validadas (exist checks)
- [ ] Paginación implementada para listados
- [ ] Tests escritos para casos exitosos y error
- [ ] Documentación en README o API docs
- [ ] Versionamiento considerado

---

## 💡 Patrones Comunes

### Listar con Paginación
```typescript
GET /api/v1/users?page=1&limit=20&sort=-created_at&include=orders
```

### Crear Recurso
```typescript
POST /api/v1/users
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Actualizar Completo
```typescript
PUT /api/v1/users/123
{
  "email": "new@example.com",
  "name": "Jane",
  "role": "admin"
}
```

### Actualizar Parcial
```typescript
PATCH /api/v1/users/123
{
  "name": "Jane Updated"
}
```

### Búsqueda Avanzada
```typescript
GET /api/v1/users?search=jane&role=admin&created_from=2024-01-01&sort=-created_at
```

### Batch Operations
```typescript
POST /api/v1/users/batch
{
  "operations": [
    { "action": "create", "data": { "email": "user1@example.com" } },
    { "action": "update", "id": "123", "data": { "name": "Updated" } }
  ]
}
```

---

## 🛠️ Herramientas Recomendadas

### Testing API
- **curl**: Testing rápido desde terminal
- **Postman**: Cliente HTTP visual
- **Thunder Client**: VS Code extension
- **REST Client**: VS Code extension

### Documentación
- **Swagger/OpenAPI**: Generar documentación automática
- **Stoplight**: Editor visual de APIs

---

## 📚 Referencias Externas

- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpwg.org/specs/rfc9110.html)
- [Zod Documentation](https://zod.dev/)
- [Semantic Versioning](https://semver.org/)
- [JSON:API Specification](https://jsonapi.org/)

---

## 🤔 FAQ

### ¿Cuándo cambio de versión?
**Cuando rompes compatibilidad**: Eliminas/renombras campos, cambias tipos, cambias HTTP method.
Ver: [API_VERSIONING.md](./API_VERSIONING.md#cuándo-cambiar-de-versión)

### ¿Qué es la idempotencia?
**Puedo ejecutar la misma operación múltiples veces con el mismo resultado.**
GET, PUT, PATCH, DELETE son idempotentes. POST no.

### ¿Cuándo usar PUT vs PATCH?
- **PUT**: Reemplazar todo el recurso (todos los campos requeridos)
- **PATCH**: Actualizar solo algunos campos (campos opcionales)

### ¿Qué status code para DELETE exitoso?
Preferencia: **204 No Content** (sin respuesta body)
Alternativa: **200 OK** (con respuesta body)

### ¿Cómo manejar paginación grande?
Usa `offset + limit` en lugar de `page + limit` para mejor rendimiento.

### ¿Debo incluir requestId en todos los responses?
**Sí**, está incluido en tu `successResponse()` y `errorResponse()` automáticamente.
Se usa para tracing y debugging.

---

## 📞 Soporte

Para preguntas específicas sobre:
- **Paths & métodos**: Ver [API_STANDARDS.md](./API_STANDARDS.md)
- **Validación**: Ver [ZOD_VALIDATION_GUIDE.md](./ZOD_VALIDATION_GUIDE.md)
- **Implementación**: Ver [EXAMPLES_CRUD_ENDPOINTS.md](./EXAMPLES_CRUD_ENDPOINTS.md)
- **Versionamiento**: Ver [API_VERSIONING.md](./API_VERSIONING.md)
- **Tipos**: Ver [src/lib/api/request-standards.ts](../src/lib/api/request-standards.ts)

---

**Última actualización**: 2024-01-15
**Versión de documentación**: 1.0.0
