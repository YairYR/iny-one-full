# CLAUDE.md

Acortador de URLs (iny.one) sobre Next.js 15 App Router, React 19, TypeScript, Supabase y Vercel.

Este fichero es contexto operativo para agentes: comandos, fronteras y trampas verificadas del
repositorio. La documentación descriptiva para personas está en `README.md`; no duplicarla aquí.

## Comandos

```bash
yarn verify              # lint + typegen + typecheck + tests. Ejecutarlo antes de dar algo por hecho.
yarn dev                 # servidor de desarrollo
yarn test <patrón>       # una suite concreta
```

`yarn typecheck` **falla si no se ha ejecutado `yarn typegen` antes**: el tipo global `RouteContext`
lo genera Next a partir del árbol de rutas y no existe en un checkout limpio. Da cinco errores
`Cannot find name 'RouteContext'` que no son reales. `yarn verify` ya encadena ambos.

`yarn build` necesita las variables de Supabase definidas, pero compila con valores placeholder
(ver `.github/workflows/ci.yml`).

## Fronteras

- **PayPal queda fuera de alcance salvo petición explícita**: `src/features/payments/`,
  `src/infra/payments/`, `src/lib/paypal.ts`, `src/app/api/webhooks/`, `src/app/api/checkout/`.
  Tiene problemas de seguridad conocidos y sin resolver; no tocar por iniciativa propia.
- `supabase_service` es el **service role y salta RLS**. Cualquier ruta que lo use tiene que
  autorizar de forma explícita (sesión + pertenencia). Referencia:
  `src/app/api/dashboard/stats/[slug]/route.ts`.
- **No borrar código sin usar**: se marca (ver «Código inactivo»).

## Trampas verificadas

Cada una de estas costó un ciclo de trabajo. Leerlas antes de explorar el repo.

- `src/lib/types/db.types.d.ts` estuvo en **UTF-16** y desde el 2026-09-11 está en UTF-8: `grep`
  ya funciona dentro. Se deja anotado porque la lección sobrevive al fichero: una búsqueda que no
  encuentra nada en un `.d.ts` generado puede estar fallando **en silencio** por codificación, no
  porque el símbolo falte. Comprobar los primeros bytes antes de concluir que algo no existe.
- Las rutas con corchetes (`src/app/ui/(main)/cart/[[...checkout]]/`) **rompen los patrones glob**,
  que interpretan `[...]` como clase de caracteres. Para recorrer el repo usar `os.walk` o
  `rg --files`, nunca `glob`/`rglob`: un barrido de código muerto con glob produce falsos
  «sin referencias».
- `service.repository.ts` (singular) y `services.repository.ts` (plural, lo usa el carrito) son
  ficheros distintos con nombres casi idénticos.
- GA4 **no** envía la medición a `www.google-analytics.com`. Verificado en la consola de producción
  el 2026-08-14: el `page_view` sale a `https://analytics.google.com/g/collect`. Ese host tiene que
  estar en `connect-src`; los endpoints regionales (`region1.google-analytics.com`…) se cubren con
  el comodín, y en CSP `*.dominio` **no** cubre `dominio`, por eso hacen falta las dos formas.
  Si falta, gtag.js carga igual —está en `script-src`— y sólo se bloquea `/g/collect`: parece que
  el tag está puesto y no mide.
- Con Google Signals activo, GA4 dispara además `stats.g.doubleclick.net/g/collect`,
  `www.google.com/g/collect` y `www.google.<tld>/ads/ga-audiences`. **No están en la allowlist a
  propósito** (decisión del 2026-08-14): son demografía y remarketing, no informes estándar, y el
  último va al dominio de Google del país de cada visitante, que no admite lista finita. Si
  aparecen en la consola es que Signals sigue activo en GA4; se desactiva allí, no ampliando la CSP.
- Un HAR **no** sirve para diagnosticar bloqueos de CSP: las peticiones que la política corta no
  llegan a la capa de red y no se exportan. Sólo se ven en la consola. Diagnosticar con HAR una
  sospecha de CSP es una comprobación que no distingue «funciona» de «está roto».
- En PostgreSQL toda función nace con `EXECUTE` concedido a **PUBLIC**, y `anon` lo hereda por ahí:
  `revoke execute ... from anon` no le quita nada. Hay que revocar a `public`, y eso también se lo
  quita a `service_role`, así que después toca devolvérselo explícitamente. Verificado en PG 16.
- En Jest, `@supabase/*` se publica como ESM sin transformar. Los tests **mockean en la frontera de
  datos** (`@/data/dto/user-dto`, los repositorios) en lugar de importar el cliente real. `nanoid`
  está mapeado a `__mocks__/nanoid.js` por el mismo motivo.
- Los Server Components asíncronos no producen marcado con `@testing-library/react`. Probar su
  `generateMetadata` o extraer la lógica a una función pura.
- `VERCEL_ENV` sólo vale `production` en producción: en preview y en local, `IS_PRODUCTION` e
  `IS_DEVELOPMENT` son ambos `false`. Hoy eso sólo afecta al bloque de gtag de `app/layout.tsx`;
  **ya no toca el plan del usuario**.
- **El plan efectivo se resuelve desde `subscriptions`, nunca desde el JWT.** El token lleva un
  `user_metadata.user_plan` que el hook `custom_access_token_hook` toma de `users_profiles.plan`,
  y **nada actualiza esa tabla cuando una suscripción se activa**: quien pagaba conservaba las
  capacidades de su plan anterior. La fuente de verdad es `AccessContext.planKey`, que sale del
  `services.plan_key` del servicio efectivo —el mismo origen que la cuota—. Toda decisión por plan
  (cuotas, UTM permitidos) pasa por `getAccessContext()`. La cadena del JWT sigue en el código
  marcada como `INACTIVO`.

- El resolver compara el slug **exacto y sensible a mayúsculas** (`.eq('slug', short)`), y los slugs
  antiguos de nanoid son de caso mixto. Los slugs que elige el usuario se normalizan a minúsculas
  **en la entrada, nunca en la resolución**: normalizar al resolver rompería los enlaces existentes.
- `short_links.destination` guarda la URL **ya compuesta con las UTM**; las columnas `utm_*` están
  aparte sólo para informes. Cualquier escritura de `destination` tiene que volver a pasar por
  `buildDestination` con las UTM de la fila, o el enlace las pierde en silencio.
- **Toda escritura de `destination` pasa por `validateDestination`** (`src/lib/short-links/`). Si una
  ruta nueva se la salta, el blocklist de dominios queda evitable en dos pasos: crear un enlace
  limpio y repuntarlo después.
- `services.name` es el nombre comercial («Plan Starter»); la cuota se indexa por `services.plan_key`
  (`free`/`basic`/`pro`). Son columnas distintas y confundirlas fue lo que hizo que un cliente de
  plan pro recibiera los límites de basic.
- El `matcher` del middleware excluye todo lo que empieza por `api`, así que **ninguna comprobación
  puesta en `middleware.ts` protege una ruta de `/api`**. El guard de webhooks vivió ahí como código
  muerto; la verificación real está en `src/app/api/webhooks/utils.ts`.
- `@paypal/react-paypal-js/sdk-v6` sólo declara la condición `import` (ESM puro). Jest resuelve por
  `require` y no lo encuentra: está mapeado en `jest.config.ts` igual que `nanoid`.
- Los tipos generados por el MCP de Supabase **sólo cubren el esquema `public`**. `db.types.d.ts`
  incluye también `security`, que `shorter.repository.ts` usa: sobrescribir el fichero entero con la
  salida del MCP rompe `isSafeDomain`. Hay que parchear a mano lo que cambie.

## Convenciones

- El acceso a datos pasa **siempre** por un repositorio de `src/infra/`; nunca Supabase directo
  desde una ruta o un componente.
- Nada de `console.*` en código de servidor: usar `logger` de `src/lib/logger.ts`, con
  `logger.child({ route: '...' })`. Redacta claves sensibles en cualquier nivel del contexto.
- Los errores de API se lanzan con las clases de `src/lib/api/errors.ts`; `withErrorHandling` las
  convierte en respuesta. No construir respuestas de error a mano.
- Toda ruta nueva bajo `/api` declara su autorización explícitamente, aunque parezca inocua.
- Los cambios llegan con sus tests; los de rutas viven en `__tests__/api/`.
- Comentarios en español, identificadores y mensajes de log en inglés (práctica actual del repo).
- Los comentarios explican **por qué**, no qué hace la línea siguiente.

## Código inactivo

Lo que no está referenciado no se borra. Las unidades completas quedan comentadas bajo una cabecera
`INACTIVO`; los exports sueltos dentro de módulos vivos llevan `/** INACTIVO */` y siguen activos.
`rg INACTIVO src/` da el listado actual; el inventario razonado está en el README.

## Supabase MCP

`.mcp.json` declara el servidor MCP de Supabase en modo **solo lectura** y acotado al proyecto
(`read_only=true`, `project_ref=...`), con los grupos `database`, `debugging`, `development` y
`docs`. Es la vía para comprobar esquema, RLS, índices y advisors sin adivinar ni preguntar.

Al estar en solo lectura no aplica migraciones: los DDL (crear índices, políticas) se ejecutan desde
el SQL Editor del panel de Supabase. Si hace falta escribir desde el MCP, quitar `read_only=true`
de forma temporal y volver a ponerlo, nunca dejarlo desactivado por defecto.

La base es de **producción, con datos de usuarios**: no ejecutar consultas que devuelvan filas
personales cuando basta con consultar el esquema o los agregados.

## Estado conocido

- **APLICADO el 2026-08-23 en producción** (vía MCP, registrado en
  `supabase_migrations.schema_migrations`; índice legible en
  `scripts/sql/2026-08-23-aplicado-desde-mcp.md`): cerrado el esquema `security`, revocados los
  grants a `PUBLIC` y los grants por defecto de las tablas de autorización, corregida
  `security.is_domain_secure`, creados los índices de cuota de `short_links`, creada
  `short_link_destination_changes` y añadida `services.plan_key`.
- **VERIFICADO el 2026-08-23**: `slug` es `text` sin longitud máxima y ya tiene `CHECK` de formato
  `^[A-Za-z0-9_-]{3,32}$`. `get_page_traffic` y `security.insert_blocked_url` sólo las ejecuta
  `service_role`.
- **ABIERTO — no se puede borrar un enlace.** Cuatro FKs apuntan a `short_links(slug)` sin
  `ON DELETE`. Afecta al producto y al derecho de supresión: `history_clicks` guarda IP y
  coordenadas. Requiere decidir si los clics se borran en cascada o se anonimizan.
- **ABIERTO — los dos contadores de clics miden cosas distintas.** `click_short_link` incrementa
  `short_links.clicks` siempre; el trigger `update_short_links_stats` hace `RETURN new` si `is_bot`.
  Uno cuenta bots y el otro no: 347 enlaces divergen. El ranking del dashboard usa el inflado.
- **ABIERTO — el `alias` NO resuelve.** El resolver busca sólo por `slug`. Es una etiqueta interna
  del panel y desde el 2026-08-15 se muestra en su propia columna, con el enlace corto real
  (`iny.one/<slug>`) en la suya.
- **ABIERTO — 290 MB de blocklist frío.** `security.blocked_url` 251 MB con 6 escaneos de índice en
  toda su vida; `blocklist_url_phishing_active` 39 MB con cero. Es el 88% de la base.

Auditoría del 2026-08-09 (`scripts/sql/auditoria.sql`, resultados reales, no supuestos):

- **CERRADO el 2026-08-09 — fuga de datos personales.** Dos políticas con `using (true)` para el
  rol `public` dejaban `history_clicks` (35 194 filas con IP, ciudad, coordenadas, UA y referer) y
  `short_links` (destino, `user_id`, `ip_user` de todos) legibles con la clave anónima. Se
  eliminaron y `short_links` quedó con `short_links_select_own` y `short_links_update_own`, ambas
  para `authenticated` y acotadas a `user_id = auth.uid()`. `history_clicks` quedó con RLS y cero
  políticas, es decir denegada salvo service role.
  Recordatorio de por qué importaba: la resolución de enlaces y las estadísticas usan service role,
  así que ninguna lectura pública era necesaria, y mientras existieron esas políticas el arreglo de
  autorización de `/api/dashboard/stats/[slug]` no protegía nada.
- **CERRADO el 2026-08-09 — GRANT ALL por defecto.** Se revocó todo sobre `public` para `anon` y
  `authenticated`, dejando sólo `grant select, update on public.short_links to authenticated`. Al
  hacerlo, cualquier consulta desde el navegador o con la sesión del usuario sobre otra tabla falla
  con «permission denied», que a diferencia de RLS es un error duro y no un filtro de filas.
- **ABIERTO — `public.get_page_traffic` es SECURITY DEFINER y anon puede ejecutarla.** Permite pedir
  el tráfico de cualquier slug por RPC. `security.insert_blocked_url` también está abierta a anon.
- **RESUELTO por diseño previo**: `short_links_pkey` es `PRIMARY KEY (slug)`, así que el índice
  único existe y el reintento por colisión de `/api/v1/shorten` funciona. `slug` es NOT NULL. No hay
  slugs duplicados. Los tipos generados (`db.types.d.ts`) están desactualizados: declaran
  `slug: string | null` y un `id` que ya no es la clave.
- `short_links_stats`, `short_links_daily_stats` y `short_links_monthly_stats` son **tablas**, no
  vistas: no aplica el problema de `security_invoker`. Todas con RLS y sin políticas (denegado).
- Volumen: `short_links` 2 636 filas, `history_clicks` 35 194 (11 MB). Las consultas de cuota hacen
  Seq Scan en 0,45 ms; los índices `(user_id, created_at)` e `(ip_user, created_at)` son previsión,
  no urgencia.
- Resolución de `/[short]`: la decisión vive en `lib/short-links/resolve-link-state.ts` (función
  pura, con tests) y las páginas en `lib/short-links/status-page.ts`. Un enlace caducado responde
  **410 Gone** con pantalla propia que invita a registrarse; uno inexistente, 404. Por eso
  `getBySlug` ya no filtra por `status`: filtrarlo hacía indistinguibles ambos casos tras la
  primera visita.
- 1 904 enlaces caducados siguen con `status = true` (sólo se desactivan al visitarlos). 315 links
  tienen desfase entre `short_links.clicks` y `short_links_stats.total_clicks`.
- Esquema `security` (auditado el 2026-08-09): cuatro tablas — `blocked_url`,
  `blocklist_url_phishing_active`, `cached_blocked_url`, `whitelist_url` — todas con RLS y una
  política, y **sin ningún grant a `anon` ni `authenticated`**. Está limpio.
- `getStatsUserUrls` ya **no** embebe `stats:short_links_stats(...)`. Tras revocar los grants, ese
  embebido pasaba de devolver null a fallar con «permission denied». No reintroducirlo sin conceder
  antes el SELECT sobre esa tabla.
- Hipótesis a confirmar: la edición de alias no funcionaba antes del 2026-08-09, porque
  `changeAlias` hace UPDATE con la sesión del usuario y no existía política de UPDATE; PostgREST
  devuelve 0 filas sin error. `short_links_update_own` debería haberlo desbloqueado.
- La CSP lleva `'unsafe-inline'` en `script-src` por el gtag en línea y los bloques JSON-LD.
  Endurecerla con nonce está pendiente.
