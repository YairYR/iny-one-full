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

- `src/lib/types/db.types.d.ts` está en **UTF-16**. `grep` y `rg` no encuentran nada dentro y fallan
  **en silencio**, así que es fácil concluir que un símbolo no existe. Convertir a UTF-8 para
  buscar, o leerlo desde Python con `encoding='utf-16'`.
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
  `IS_DEVELOPMENT` son ambos `false` y el plan del usuario queda en `null` (hay fallback a `free`).

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
