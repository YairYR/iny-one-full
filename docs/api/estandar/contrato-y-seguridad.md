# Estándar propuesto para la API

**Estado: propuesta, no implementada ni aprobada.** Aplica como objetivo para
nuevas interfaces una vez adoptada; no redefine las respuestas existentes.
El [diagnóstico](../dashboard/estado-actual.md) distingue lo que ya funciona.

## Fronteras y responsabilidades

- **API de producto:** recursos y operaciones estables para usuarios e
  integradores, documentados y explícitamente habilitados para clientes.
- **API del dashboard:** consultas compuestas y privadas adaptadas a la
  pantalla. Puede reutilizar endpoints de producto cuando los contratos
  coincidan; no se convierte automáticamente en una API pública.
- **Servicios de aplicación:** reglas de negocio, permisos, cuotas y operaciones
  compartidas por Route Handlers y Server Actions.
- **Repositorios:** acceso a datos; no sustituyen la autorización del servicio.

Rutas objetivo ilustrativas, todavía inexistentes:

```http
GET   /api/v1/teams/{teamId}/links
POST  /api/v1/teams/{teamId}/links
GET   /api/v1/teams/{teamId}/links/{linkId}
PATCH /api/v1/teams/{teamId}/links/{linkId}
GET   /api/v1/teams/{teamId}/links/{linkId}/stats
```

Los nombres y la versión se decidirán al aprobar el contrato. No se propone
eliminación hasta decidir qué ocurre con los clics y datos personales vinculados.
Las consultas agregadas del dashboard pueden mantenerse por separado y con
distintas frecuencias de actualización.

## Convenciones de contrato

- Recursos en plural y rutas versionadas. Usar `GET` para lectura, `POST` para
  creación y `PATCH` para actualizaciones parciales. Los endpoints nuevos de
  creación deberían responder `201` con `Location` si existe una URL del recurso.
- Mantener la envoltura existente: éxito `{ "ok": true, "data": ..., "meta": ... }`
  y error `{ "ok": false, "error": ..., "meta": ... }`. Elegir una sola
  convención de nombres para contratos nuevos, preferentemente `snake_case`,
  documentando cualquier excepción heredada como `meta.requestId`.
- Validar cuerpo, parámetros y query en el servidor con esquemas específicos
  por operación. Definir límites de tamaño y listas permitidas de filtros,
  orden y campos; no permitir selecciones arbitrarias de columnas.
- Definir códigos de error estables: `400` para JSON malformado, `422` para
  validación, `401` para autenticación, `403` para permisos, `404` para
  inexistencia o para ocultar el recurso cuando corresponda, `409` para
  conflicto y `429` para límites. No exponer detalles internos ni devolver
  resultados vacíos cuando la consulta haya fallado.
- Usar un identificador de petición generado o validado en la frontera,
  propagado a logs y respuesta. Un ID proporcionado por el cliente debe tener
  formato y longitud acotados; no confiar en él para autorización.
- Usar `Cache-Control: private, no-store` por defecto para datos privados,
  también en errores. Cualquier caché posterior debe aislarse por identidad y
  equipo y tener caducidad e invalidación explícitas.
- Documentar las fechas en UTC y los límites inclusivos o exclusivos de cada
  intervalo; especificar para cada métrica el tratamiento de bots, su fuente y
  cuándo se actualiza.

### Colecciones y eficiencia

Paginación limitada y orden determinista, con desempate por identificador único.
El dashboard puede usar página y total cuando su UX los necesite. Para
colecciones públicas grandes, preferir cursor opaco y `limit` acotado, con
`next_cursor` o equivalente; no calcular un total exacto por defecto. Documentar
la consistencia esperada cuando haya inserciones o cambios concurrentes.

Agrupar lecturas que se usan y refrescan juntas; paralelizar consultas
independientes y evitar N+1. Seleccionar solo datos necesarios. Medir viajes a
la base, latencia y tamaño de respuestas antes de introducir caché, RPC nuevas
o agregaciones precalculadas.

## Identidad y autorización

- El dashboard usa sesión de usuario. Para integraciones servidor a servidor se
  propone una credencial revocable, asociada a un equipo y limitada a permisos
  concretos, como `links.read`, `links.write` y `stats.read`; sus nombres y
  relación con los permisos internos existentes requieren decisión.
- Mostrar el secreto solo al crearlo y almacenar un verificador seguro, no el
  secreto en texto plano; permitir identificación, rotación y revocación. No
  incluir credenciales en URLs, logs ni código del navegador.
- Resolver la identidad y autorizar **cada operación sobre el equipo y recurso
  concretos**. Un `teamId` o `linkId` del cliente no demuestra pertenencia.
  Los permisos de la credencial no deben ampliar los permisos otorgados por el
  modelo de acceso. El plan y las capacidades efectivas deben obtenerse de la
  fuente de autorización del servidor, no de `user_metadata` del JWT.
- `service_role` omite RLS: usarlo solo cuando haga falta y después de verificar
  sesión o credencial, pertenencia y permiso para el recurso exacto. Los
  repositorios deben filtrar por el ámbito autorizado.
- Para peticiones autenticadas por cookies, mantener protección CSRF apropiada.
  Las credenciales de integración no sustituyen los controles de sesión del
  navegador.

## Límites, reintentos y escrituras

- Separar límites de frecuencia de la cuota de uso del plan. Aplicar límites
  distribuidos por credencial y equipo; conservar controles antiabuso por IP
  cuando corresponda. Documentar ventanas y comportamiento ante fallos del
  limitador; enviar `Retry-After` en `429` cuando se conozca el tiempo de espera.
- Antes de recomendar reintentos de creación, admitir una clave de idempotencia
  persistente, acotada por identidad, equipo y operación. Registrar de forma
  atómica clave y resultado; una repetición con el mismo payload devuelve el
  resultado original y otra con payload distinto produce conflicto. Definir
  caducidad y manejo de peticiones concurrentes y fallos antes de publicarla.
- Validar todo el `PATCH` antes de escribir. Los cambios relacionados y su
  auditoría deben tener una garantía transaccional explícita; comprobar filas
  afectadas. Cualquier cambio de destino debe conservar la validación de
  dominios y recomponer las UTM.

## Publicación y compatibilidad

Publicar OpenAPI y ejemplos ejecutables solo para operaciones disponibles,
con autenticación, permisos, límites, errores, paginación y semántica de datos.
Pruebas de contrato deben cubrir esos ejemplos y las variantes de error.
Las rutas privadas del dashboard no son públicas por llevar `/api/v1`.

No cambiar silenciosamente el contrato de un endpoint existente, incluido
`/api/v1/shorten`, ya anunciado sin API key. Para cambios incompatibles,
mantener una alternativa compatible, comunicar deprecación y fecha de retirada
y migrar consumidores antes de eliminar el contrato anterior.
