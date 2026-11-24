# API del dashboard: estado actual

**Alcance:** código actualizado tras el análisis del 21 de noviembre de 2026.
Describe lo implementado y las mejoras propuestas, no una auditoría exhaustiva
ni una medición de rendimiento. Las rutas de pagos y webhooks quedan fuera de alcance.

## Flujo y responsabilidades actuales

| Operación | Uso | Comportamiento |
|---|---|---|
| `GET /api/v1/dashboard/summary?kpi=total_links,total_clicks,top_country,last_clicks,week` | KPI y actividad | SWR solicita el grupo cada 60 segundos. |
| `GET /api/v1/dashboard/summary?kpi=traffic,performance` | Tráfico y ranking | Se solicita cada 300 segundos, sin revalidación al enfocar. |
| `GET /api/v1/teams/default/links?page=N&pageSize=5\|10\|20` | Tabla de enlaces | Equipo por defecto, permiso `links.read`; `pageSize` (por defecto 20) lo elige el selector de filas y se pagina en servidor. Tras editar se invalidan las páginas. La búsqueda y la ordenación de la tabla solo afectan a la página visible. |
| `GET /api/v1/dashboard/links/{link_id}` | Modal de estadísticas | Se solicita al abrir el detalle de un enlace. |
| `GET /api/v1/dashboard/links` | Listado heredado por usuario | Conservado por compatibilidad; no alimenta la tabla actual. |
| `POST /api/v1/account/personal-setup` | Configuración personal | Guarda perfil y equipo en una operación atómica.|
| `updateLinkAction` | Edición de alias y destino | Server Action, no endpoint HTTP de producto. |

El resumen sin filtros mantiene una respuesta completa de compatibilidad. La
selección de grupos evita pedir todas las métricas en cada refresco, y sus
consultas independientes se ejecutan en paralelo. Las respuestas exitosas del
resumen y las demás rutas privadas aquí descritas, incluidos errores, llevan
`Cache-Control: private, no-store`; el dashboard también solicita
`cache: 'no-store'`.

Referencias: [hook de SWR](../../../src/features/dashboard/hooks/useStatsCommon.ts),
[servicios del dashboard](../../../src/features/dashboard/services/getStats.ts),
[resumen](../../../src/app/api/v1/dashboard/summary/route.ts),
[detalle](../../../src/app/api/v1/dashboard/links/%5Blink_id%5D/route.ts),
[listado por equipo](../../../src/app/api/v1/teams/default/links/route.ts),
[configuración personal](../../../src/app/api/v1/account/personal-setup/route.ts) y
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
El panel ya usa el listado de equipo separado; la variante con `links` del
resumen se conserva para compatibilidad.

### 2. El tráfico escala con el número de enlaces

`loadTraffic` pagina los identificadores del equipo en bloques de 500 y después
los pasa a `get_page_traffic`. Crecen los viajes a la base y el tamaño de los
argumentos con el número de enlaces; la paginación por desplazamiento también
puede observar cambios concurrentes entre páginas.

**Propuesta:** medir latencia y volumen por tamaño de equipo; si se confirma el
coste, evaluar una agregación por equipo en la base. Cualquier consulta con
`service_role` debe autorizar previamente el equipo y mantener un ámbito
explícito. No asumir que cambiar la consulta preservará resultados sin pruebas.

### 3. Listados y permisos

El resumen usa el equipo por defecto y exige `stats.view`. El nuevo listado usa
ese equipo y exige `links.read`; el listado heredado conserva su ámbito de
usuario. Ambos devuelven un error cuando falla la consulta. El detalle comprueba
`links.read` y `stats.view` para el equipo del enlace antes de consultar con
`service_role`; una denegación responde 404.

### 4. Errores de estadísticas

El detalle comprueba errores y datos requeridos de las consultas; un fallo
produce 500, mientras que un conteo válido de cero sigue siendo cero. Las tres
consultas se ejecutan en paralelo después de autorizar. La serie histórica
filtra por la fecha de la estadística y no por la fecha de creación de su fila.

### 5. La edición necesita un contrato coherente

La acción comprueba conjuntamente usuario, `slug` y `link_id`, valida ambos
campos antes de escribir y aplica alias y destino mediante un solo `UPDATE`.
Comprueba las filas afectadas y conserva la validación del destino y las UTM.

**Pendiente:** la auditoría del destino sigue siendo una escritura separada y
su fallo se registra sin revertir el cambio. La comprobación sigue siendo por
propietario, no una autorización general de edición por equipo; la lectura
previa y la escritura tampoco proporcionan control de concurrencia optimista.

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
