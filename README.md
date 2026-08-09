# iny.one

Acortador de URLs con soporte para parámetros UTM, analítica de clics y una arquitectura modular sobre Next.js App Router.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth) · next-intl · PayPal · Vercel

---

## Puesta en marcha

```bash
yarn install
yarn typegen   # genera los tipos de ruta del App Router (RouteContext)
yarn dev
```

| Script | Qué hace |
| --- | --- |
| `yarn dev` | Servidor de desarrollo con Turbopack |
| `yarn build` / `yarn start` | Build de producción y arranque |
| `yarn lint` | ESLint sobre `src` |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn typegen` | Regenera los tipos de ruta de Next |
| `yarn test` / `yarn coverage` | Jest, con o sin cobertura |
| `yarn sonar` | Análisis de SonarQube |

`yarn typecheck` requiere haber ejecutado antes `yarn typegen` o un `build`: el tipo global `RouteContext` lo genera Next a partir del árbol de rutas y no existe en un checkout limpio.

### Variables de entorno

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente de Supabase en navegador y middleware |
| `NEXT_SUPABASE_URL` / `NEXT_SUPABASE_SERVICE_ROLE_KEY` | Cliente de servicio (service role) en el servidor |
| `NEXT_PUBLIC_SITE_URL` | URL base para los redirects de OAuth |
| `PAYPAL_PUBLIC_API_CLIENT_ID` / `PAYPAL_API_CLIENT_SECRET` / `PAYPAL_API_ENVIRONMENT` | Credenciales de PayPal |
| `WEBHOOK_ID` | Identificador del webhook de PayPal usado al verificar firmas |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` \| `silent` (por defecto `info` en producción) |
| `CSP_REPORT_ONLY` | `true` publica la CSP como `Report-Only` en lugar de aplicarla |

---

## Arquitectura

Dirección de dependencias:

```txt
app/  →  features/  →  lib/  →  infra/
```

Estructura real del repositorio:

```txt
src/
├─ app/                          # App Router: rutas, layouts, metadata y handlers
│  ├─ layout.tsx                 # Layout raíz (html, body, metadata global, gtag)
│  ├─ not-found.tsx
│  ├─ robots.txt  ·  sitemap.ts  # Señales de rastreo e indexación
│  ├─ [short]/route.tsx          # Resolución de short links y registro del clic
│  ├─ api/                       # Route handlers
│  │  ├─ auth/[slug]/            # login · register · confirm
│  │  ├─ shorten/                # Creación de short links
│  │  ├─ dashboard/stats/        # Métricas del panel
│  │  ├─ checkout/paypal/        # Alta y captura de suscripciones
│  │  └─ webhooks/               # Recepción de eventos de PayPal
│  └─ ui/                        # Implementación interna tras los rewrites públicos
│     ├─ (main)/                 # Home, about, plans, cart, auth y landings SEO
│     ├─ (user)/                 # Panel del usuario (+ noindex del área privada)
│     └─ dashboard/layout.tsx    # INACTIVO: fuera de la cadena de layouts
│
├─ components/                   # UI compartida (Navbar, Footer, Tooltip, Skeleton…)
│
├─ features/                     # Módulos por dominio: componentes, hooks y servicios
│  ├─ auth/  ·  payments/  ·  dashboard/
│  ├─ short_links/  ·  qr/  ·  cart/  ·  piscolas/
│
├─ infra/                        # Adaptadores concretos
│  ├─ db/                        # Repositorios sobre Supabase + mapeo de errores
│  └─ payments/                  # Repositorios sobre la API de PayPal
│
├─ lib/                          # Utilidades transversales
│  ├─ api/                       # Errores, códigos y forma de las respuestas
│  ├─ cache/                     # Caché en memoria con TTL
│  ├─ middlewares/               # Sesión y verificación de webhooks
│  ├─ seo/                       # Metadata, canonical y hreflang
│  ├─ short-links/               # Generación de slugs y construcción del destino
│  ├─ supabase/                  # Fábricas de cliente (browser / server)
│  ├─ utils/                     # rate limits, retry, geolocalización, url…
│  ├─ logger.ts                  # Logger estructurado
│  ├─ routes.ts                  # Rutas públicas y parámetros permitidos por plan
│  └─ reserved-slugs.ts          # Denylist de slugs del sistema
│
├─ hooks/  ·  i18n/  ·  styles/  ·  types/
│
data/                            # Traducciones (en/es) y DTO de usuario
scripts/                         # Mantenimiento de la denylist de dominios
__tests__/                       # Tests unitarios y de rutas
```

### Criterios de diseño

**Feature-first.** Cada dominio de negocio vive bajo `features/` con su UI, hooks y servicios, en lugar de repartir la lógica entre `components/` y `lib/`.

**Repositorios como frontera de infraestructura.** El acceso a datos se concentra en `infra/db` y `infra/payments`, que exponen funciones fábrica (`getShorterRepository(db)`) recibiendo el cliente por parámetro. Eso mantiene las rutas ignorantes de Supabase y hace que los tests puedan sustituir el repositorio sin tocar la lógica.

> **Nota.** No existe una capa `core/` con entidades y casos de uso: la lógica de dominio vive hoy en los servicios de cada feature y en `lib/`. Introducirla sería un refactor con sentido cuando la lógica de negocio crezca, pero este README describe el código tal como está.

---

## Modelo de rutas

Las URLs públicas se exponen limpias y `next.config.ts` las reescribe hacia `/ui/*`, que es la implementación interna. El acceso directo a `/ui/*` se corrige con un redirect permanente hacia la ruta pública.

Rutas públicas canónicas:

```txt
/  ·  /about  ·  /plans  ·  /piscolas  ·  /cart
/utm-builder  ·  /qr-code-generator  ·  /bitly-alternative  ·  /url-shortener-api
/auth/login  ·  /auth/register  ·  /auth/callback  ·  /dashboard
```

La versión en español vive bajo `/es/*` con URLs propias. El middleware inyecta la cabecera `x-iny-locale` (y borra la que llegue del cliente, para que no sea inyectable) y las mismas páginas de `/ui` renderizan contenido y metadata en español.

### SEO

- Dominio canónico `https://iny.one`; `www` redirige al apex.
- `canonical` y `hreflang` por página vía `buildPageMetadata()` en `lib/seo/metadata.ts`.
- El sitemap sólo incluye rutas públicas indexables.
- `auth`, `dashboard` y `cart` quedan fuera del índice con `robots: { index: false }` en el layout que realmente los envuelve.
- Los short links responden con `X-Robots-Tag: noindex`.
- Las landings incorporan JSON-LD.

### Slugs reservados

`lib/reserved-slugs.ts` centraliza la denylist para que un slug corto no pueda apropiarse de una ruta del sistema. Se aplica en dos puntos: al **crear** (los slugs autogenerados se regeneran si caen en la denylist) y al **resolver** (un slug reservado devuelve 404 antes de consultar la base de datos).

---

## Notas técnicas

**Creación de short links.** El slug se genera con `nanoid` y se inserta de forma optimista: si Postgres devuelve una violación de índice único (`23505`), se genera un slug nuevo y se reintenta. Comprobar antes si el slug existe no eliminaría la condición de carrera y añadiría una consulta a cada creación.

**Rate limiting.** `lib/utils/rate-limits.ts` aplica cuotas mensuales por plan. El consumo se cachea en memoria con TTL corto, de modo que sólo se consulta la base de datos en el primer acceso de cada ventana. El contador está detrás de la interfaz `UsageStore`: sustituirla por una implementación sobre Redis es el único cambio necesario para tener conteo exacto entre instancias.

**Dominios bloqueados.** Un filtro de Bloom (`public/bloom.bin`) descarta la mayoría de dominios sin tocar la base de datos; sólo los positivos se confirman contra ella. Los scripts de `scripts/` regeneran la lista a partir de fuentes públicas.

**Logging.** `lib/logger.ts` emite una línea JSON por evento en producción y texto legible en desarrollo, redactando claves sensibles en cualquier nivel del contexto. Se usa mediante loggers hijo con contexto ligado: `logger.child({ route: 'api/shorten' })`.

**Cabeceras de seguridad.** Definidas en `next.config.ts`: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y una Content-Security-Policy con allowlist de orígenes.

**Validación.** Zod para los payloads de las rutas de API y para la validación en cliente del formulario de acortado.

---

## Tests

```bash
yarn test              # suite completa
yarn coverage          # con reporte de cobertura
yarn test destination  # filtrando por nombre de fichero
```

Cubren la lógica con más riesgo: denylist de slugs, generación de slugs, construcción del destino con UTM, rate limiting, caché con TTL, retry, logger, estadísticas del dashboard y la ruta `/api/shorten` completa con Supabase mockeado.

Los tests que tocan Server Components cortan en la frontera de datos (`@/data/dto/user-dto`, repositorios) en vez de cargar el cliente real de Supabase, que se distribuye como ESM y no pasa por el transform de Jest.

## CI

`.github/workflows/ci.yml` ejecuta lint, generación de tipos, typecheck, tests con cobertura y build en cada push y pull request contra `main` y `develop`.

---

## Código inactivo

Nada se borra: lo que no está referenciado se conserva marcado, por si retoma uso en una build futura. Dos convenciones, según el caso.

**Comentado con cabecera `INACTIVO`** cuando es una unidad completa que ya no se compila: `infra/db/order.repository.ts`, `infra/db/payment.repository.ts`, `infra/payments/catalogs.repository.ts` (catálogo de productos de PayPal), `ALLOWED_ORIGINS` y `PAYPAL_CLIENT_ID` en `constants.ts`, `retryWithCancel` en `lib/utils/retry.ts`, `findByEmail` / `getCurrentUserId` / `getUrls` en `user.repository.ts`, y `getStatsUrls` / `getStatsUrlsCurrentUser` / `getClicksBetween` en `stats.repository.ts`.

**Anotado con `/** INACTIVO */` pero activo** cuando es un export suelto dentro de un módulo en uso, donde comentarlo sólo añadiría ruido: las variantes `SkeletonCircle`, `SkeletonTable`, `SkeletonTriangle` y `SkeletonUser`; `addToSessionStorage`, `getCart` y `clearCart` en `lib/utils/localstorage.ts`; `getPlans` en `services.repository.ts`; los tipos `ILink`, `OrderPay` y `UserRepository`; y `formats` en `i18n/request.ts`.

También quedan marcados los barrels vacíos `features/users/index.ts` y `features/payments/index.ts`, y `app/ui/dashboard/layout.tsx`, que está fuera de la cadena de renderizado (el `noindex` del área privada vive en `app/ui/(user)/layout.tsx`).

`package.json` no admite comentarios, así que se deja constancia aquí: **`node-fetch` y `simple-statistics` no se usan en ninguna parte del código**. Node 22 ya trae `fetch` global. Se conservan instaladas; si se decide prescindir de ellas, `yarn remove node-fetch simple-statistics`.

Para recalcular el inventario, buscar `INACTIVO` en `src/`. Un detalle al hacerlo con herramientas propias: las rutas con segmentos entre corchetes como `app/ui/(main)/cart/[[...checkout]]/` se escapan de los patrones glob, que interpretan los corchetes como clase de caracteres, y pueden dar un falso «sin referencias».

---

## Convenciones

- `page.tsx` para vistas, `layout.tsx` para composición y metadata compartida, `route.ts` para handlers HTTP.
- `/ui/*` es implementación interna: no promocionar esas URLs ni tratarlas como canónicas.
- Centralizar las rutas en `lib/routes.ts` y los slugs reservados en `lib/reserved-slugs.ts`.
- Nada de `console.*` en código de servidor: usar `logger`.
- El acceso a datos pasa siempre por un repositorio de `infra/`.

## Pendientes

- Endurecer la CSP con nonce por petición en lugar de `'unsafe-inline'` en `script-src`.
- Alias personalizados para short links, validados contra la denylist.
- Ampliar la cobertura de eventos de webhook de PayPal.
- Automatizar el refresco de la lista de dominios bloqueados.
- Mover el rate limiting a un store compartido cuando el tráfico lo justifique.
