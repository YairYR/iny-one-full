# API: diagnóstico y propuesta

Este directorio separa el comportamiento implementado de las decisiones propuestas
para una futura API de clientes. El análisis refleja el código revisado el
21 de noviembre de 2026; no es una promesa de disponibilidad ni sustituye al código.

## Contenido

| Documento | Estado | Contenido |
|---|---|---|
| [Dashboard actual](dashboard/estado-actual.md) | Diagnóstico | Consumo de las rutas, responsabilidades y hallazgos con referencias al código. |
| [Estándar de API](estandar/contrato-y-seguridad.md) | Propuesta | Contratos, recursos, autenticación, permisos, errores y eficiencia. |
| [Plan de adopción](estandar/adopcion.md) | Propuesta | Prioridades, compatibilidad y criterios para habilitar acceso de clientes. |

Las guías anteriores siguen en `docs/` como **referencia histórica**, no como
contrato vigente: [índice](../API_INDEX.md), [estándares](../API_STANDARDS.md),
[versionamiento](../API_VERSIONING.md), [ejemplos CRUD](../EXAMPLES_CRUD_ENDPOINTS.md)
y [validación](../ZOD_VALIDATION_GUIDE.md). En particular, los helpers de
`request-standards.ts` no deben asumirse adoptados: ver el
[hallazgo previo](../hallazgo-request-standards-2026-09-07.md).
