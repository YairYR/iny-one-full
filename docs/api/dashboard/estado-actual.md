# API del dashboard: estado actual

**Alcance:** análisis estático del código revisado el 21 de noviembre de 2026.
Describe lo implementado y las mejoras propuestas, no una auditoría exhaustiva
ni una medición de rendimiento. Las rutas de pagos y webhooks quedan fuera de alcance.

## Flujo y responsabilidades actuales

| Operación | Uso | Comportamiento |
|---|---|---|
| `GET /api/v1/dashboard/summary?kpi=total_links,total_clicks,top_country,last_clicks,week` | KPI y actividad | SWR solicita el grupo cada 60 segundos. |
| `GET /api/v1/dashboard/summary?kpi=traffic,performance` | Tráfico y ranking | Se solicita cada 300 segundos, sin revalidación al enfocar. |
| `GET /api/v1/dashboard/summary?links=true&page=N` | Tabla de enlaces | Página de 20; tras una edición se invalidan las páginas de enlaces. La búsqueda de la UI filtra solo la página visible. |
| `GET /api/v1/dashboard/links/{link_id}` | Modal de estadísticas | Se solicita al abrir el detalle de un enlace. |
| `GET /api/v1/dashboard/links` | Listado por usuario | Ruta existente; no es la que alimenta la tabla del dashboard actual. |
| `updateLinkAction` | Edición de alias y destino | Server Action, no endpoint HTTP de producto. |

El resumen sin filtros mantiene una respuesta completa de compatibilidad. La
selección de grupos evita pedir todas las métricas en cada refresco, y sus
consultas independientes se ejecutan en paralelo. Las respuestas exitosas del
resumen llevan `Cache-Control: private, no-store`; los consumidores activos
del dashboard usan `fetch` con `cache: 'no-store'`.

Referencias: [hook de SWR](../../../src/features/dashboard/hooks/useStatsCommon.ts),
[servicios del dashboard](../../../src/features/dashboard/services/getStats.ts),
[resumen](../../../src/app/api/v1/dashboard/summary/route.ts),
[detalle](../../../src/app/api/v1/dashboard/links/%5Blink_id%5D/route.ts),
[listado](../../../src/app/api/v1/dashboard/links/route.ts) y
[edición](../../../src/features/dashboard/actions/edit_link.actions.ts).

## Hallazgos

### 1. El resumen mezcla responsabilidades

El mismo endpoint devuelve enlaces, paginación, totales, series, países, tráfico
y ranking según `kpi` y `links`. Esto es útil para la UI, pero crea un contrato
con campos condicionales difícil de ofrecer a clientes. En la variante sin
filtros incluye además valores de compatibilidad como `summary.clicks: 0` y
`all_time.top_browsers: []`, que no deben interpretarse como métricas reales.

**Propuesta:** mantener consultas compuestas internas para la pantalla, pero
definir recursos y contratos independientes para la API de producto. No dividir
cada tarjeta en una petición: agrupar lo que se consume y refresca junto.

### 2. El tráfico escala con el número de enlaces

`loadTraffic` pagina los identificadores del equipo en bloques de 500 y después
los pasa a `get_page_traffic`. Crecen los viajes a la base y el tamaño de los
argumentos con el número de enlaces; la paginación por desplazamiento también
puede observar cambios concurrentes entre páginas.

**Propuesta:** medir latencia y volumen por tamaño de equipo; si se confirma el
coste, evaluar una agregación por equipo en la base. Cualquier consulta con
`service_role` debe autorizar previamente el equipo y mantener un ámbito
explícito. No asumir que cambiar la consulta preservará resultados sin pruebas.

### 3. Listados y autorizaciones no expresan el mismo alcance

El resumen usa el equipo por defecto y exige `stats.view`. El listado
`/dashboard/links` consulta enlaces por usuario y no comprueba el error del
repositorio: ante datos nulos responde con una lista vacía. El detalle primero
busca el equipo del enlace y exige `links.read`, aunque devuelve estadísticas.
No se ha establecido aquí si esa diferencia de permisos es intencional.

**Propuesta:** decidir explícitamente si `stats.view` también protege el detalle,
además de los permisos de acceso al enlace que se requieran. Definir los listados
por equipo y distinguir errores de datos vacíos. Antes de cualquier lectura con
`service_role`, comprobar sesión, pertenencia y permiso sobre el recurso exacto.

### 4. El detalle puede ocultar fallos

El detalle no revisa los errores de la búsqueda del enlace ni de las tres
consultas de estadísticas. Según la consulta que falle, puede responder como
si no hubiera clics, devolver un desglose nulo o convertir un fallo de lectura
en un 404. El cliente sí muestra error cuando falta el desglose, pero no puede
detectar todos los ceros fabricados por el servidor.

**Propuesta:** registrar y propagar los fallos como errores explícitos; devolver
cero únicamente cuando la consulta exitosa indique ausencia de actividad.
Cubrir tanto la denegación de acceso como los fallos de cada consulta.

### 5. La edición necesita un contrato coherente

La Server Action comprueba propiedad usando `slug`, pero las escrituras usan
`link_id`; ambos valores llegan en el estado de la acción. La autorización y
la escritura deben referirse al mismo recurso. Además, el destino se actualiza
antes de validar y escribir el alias, por lo que un parche con ambos campos
puede fallar después de aplicar solo el destino. El registro de auditoría del
destino se intenta después de la escritura y su fallo se registra sin revertirla.
La edición de alias tampoco comprueba filas afectadas.

**Propuesta:** resolver el enlace por un único identificador autorizado, validar
el parche completo antes de escribir y definir una garantía transaccional para
los cambios y la auditoría. Conservar `validateDestination`, la recomposición
de UTM y la comprobación de filas afectadas. No asumir que la autorización
actual por propietario equivale a permisos de equipo.

### 6. Las métricas y los contratos necesitan definición

El contador `short_links.clicks` puede incluir bots, mientras algunas
estadísticas agregadas los excluyen. La respuesta mezcla nombres como
`totalLinks`, `topLinks` y `clicks_last_24h`, y varía según los filtros.
Los consumidores actuales tipan las distintas variantes en el cliente.

**Propuesta:** documentar por métrica su origen, ventana temporal, zona horaria
y tratamiento de bots. Normalizar nombres y formas en contratos nuevos sin
alterar silenciosamente los existentes.

## Consideración para integradores

`POST /api/v1/shorten` ya se anuncia públicamente para uso programático sin API
key. Su contrato actual, incluido el acceso anónimo, no debe cambiarse sin un
plan de compatibilidad. La futura API autenticada puede coexistir con él.
Ver [ruta de creación](../../../src/app/api/v1/shorten/route.ts) y
[página pública](../../../src/app/%28main%29/url-shortener-api/page.tsx).
