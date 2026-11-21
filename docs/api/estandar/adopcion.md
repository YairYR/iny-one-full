# Plan propuesto de adopción

**Estado: propuesta.** No implica que los endpoints, credenciales o garantías
descritos estén implementados. Evitar cambios incompatibles en contratos ya
consumidos; los detalles están en el [estándar](contrato-y-seguridad.md).

## 1. Corregir el comportamiento actual

- El detalle exige `links.read` y `stats.view`; el listado del equipo por
  defecto exige `links.read`. Mantener pruebas de denegación y aislamiento.
- El listado y detalle propagan fallos; la edición verifica propiedad y filas
  afectadas, valida ambos campos y los actualiza en una sola escritura.
- Pendiente: hacer transaccional el registro de auditoría con el cambio de
  destino y decidir control de concurrencia y permisos de edición por equipo.
- Documentar definiciones de métricas, ventanas y diferencias de bots antes de
  prometer equivalencia entre contadores.

## 2. Separar responsabilidades sin perder eficiencia

- Extraer reglas comunes a servicios de aplicación reutilizables desde las
  rutas y Server Actions; mantener acceso a datos en repositorios.
- El panel ya usa un listado separado y mantiene grupos de estadísticas y
  refrescos independientes; el resumen y el listado anteriores se conservan
  por compatibilidad.
- Medir el coste de tráfico por equipo y decidir si compensa agregar en base.
  Verificar equivalencia, autorización y comportamiento concurrente antes de
  sustituir la consulta actual.

## 3. Preparar acceso de clientes

- Acordar recursos expuestos, selección de equipo, permisos y ciclo de vida de
  credenciales; implementar autenticación y autorización por recurso.
- Definir paginación, límites distribuidos, cuota, idempotencia para creación,
  manejo de errores, correlación y privacidad de logs.
- Publicar OpenAPI y ejemplos solo cuando coincidan con el comportamiento real.
  Cubrir contrato, validación, pertenencia, errores de repositorio, reintentos
  concurrentes y compatibilidad con pruebas automatizadas.

## 4. Migrar y mantener compatibilidad

- Inventariar consumidores antes de cambiar rutas, campos, estados HTTP o
  autenticación. La página pública ya anuncia `/api/v1/shorten` sin API key:
  no retirarlo ni exigir credenciales sin una transición explícita.
- Introducir alternativas en paralelo, migrar la UI, informar a integradores y
  fijar una fecha de retirada antes de desactivar contratos deprecados.
- Revisar las guías históricas de `docs/` cuando se adopten decisiones; no
  activar de manera indiscriminada los helpers genéricos no utilizados.

## Criterios para habilitar una operación pública

Contrato y documentación coinciden con la implementación; autenticación y
autorización verificadas para el recurso y el equipo; límites y errores
documentados; reintentos seguros cuando corresponda; pruebas de aislamiento y
fallos aprobadas; y una persona responsable de compatibilidad y soporte.
