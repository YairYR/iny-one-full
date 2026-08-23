# iny.one — auditoría de QA de la rama `develop`

*22 de agosto de 2026. `origin/develop` en `9af8c53`, 14 commits de `phgac` sobre `main`, 71 ficheros, +4.818 / −964.*

Todo lo que sigue está comprobado ejecutándolo o leyendo el código en un clon limpio del repositorio. Donde no he podido verificar algo lo digo.

---

## Veredicto

**No se puede fusionar tal como está: la rama no compila.**

```
eslint src        ✅ 0 errores
tsc --noEmit      ❌ 22 errores en 5 ficheros
jest              ❌ 2 suites en rojo (1 no arranca)
next build        ❌ Failed to compile
```

El trabajo de fondo tiene buenas decisiones —hablo de ellas al final— pero no ha pasado por `yarn verify` ni una vez antes de subirse. Eso es lo primero que hay que corregir, y no como reproche: los cuatro bloqueantes de abajo los caza el comando en treinta segundos.

---

## 1. Bloqueantes

### B1 · El build falla

```
./src/app/api/dashboard/stats/route.ts:71:35
Type error: Property 'summary' does not exist on type 'string | number | true | ...'
```

Causa: se regeneró `db.types.d.ts` (bien, era un pendiente) y el generador tipa el retorno de la función `get_dashboard_stats_summary` como `Json`. La ruta del dashboard —que el developer **no tocó**— accede a `.summary` y `.all_time` sobre ese `Json`.

De los 22 errores de tipos, **15 están en `src/infra/db/shorter.repository.ts`, un fichero que tampoco tocó**: los tipos regenerados declaran los argumentos del RPC `click_short_link` como `string` no nulo, y el código pasa valores que pueden ser `null` (geolocalización, user-agent). Es daño colateral de la regeneración, no un fallo de diseño, pero hay que resolverlo antes de fusionar.

### B2 · `/api/v1/dashboard/summary` devuelve 500 siempre

```ts
// src/app/api/v1/dashboard/summary/route.ts:38-39
statsRepo.getClicksAllTime(slugs),
statsRepo.getClicksBetweenTime(slugs, today.toDate(), yesterday.toDate()),
```

Ninguno de los dos métodos existe en `getStatsRepository`. El repositorio expone `getDayStatsBetweenDates`, `getRefererersStats` y `getDashboardStatsSummary`; `getClicksBetween` está comentado como INACTIVO desde agosto. Es `TypeError` en la primera llamada.

De paso, aunque existieran: los argumentos van invertidos —`start = hoy`, `end = ayer`— así que el rango sería vacío.

### B3 · El flujo de pago del carrito está muerto

Esta rama borra `src/app/api/checkout/paypal/create-subscription` y `capture-subscription`. Pero `src/features/payments/components/Paypal/PayButtons.tsx` sigue llamándolas (líneas 30 y 49), y `src/features/cart/components/Cart.tsx:27` sigue montando `<PayButtons />`.

Compila porque son cadenas dentro de un `fetch`. En ejecución serían dos 404.

> **Corrección del 23 de agosto.** Aquí me pasé. `Cart.tsx` monta `PayButtons`, pero **nada renderiza
> `Cart`**: la página del carrito usa `CartItem`, y el pago vivo es el de `PricingCards` con
> `PayPalSubscriptionButton`. Así que no es un checkout roto, es código muerto apuntando a rutas
> borradas. Sigue habiendo que resolverlo —y se resolvió marcando ambos como `INACTIVO`— pero la
> gravedad era menor de la que le di. Lo comprobé con un `grep` de los consumidores, que es lo que
> debí hacer antes de escribirlo.

### B4 · Tests en rojo

```
FAIL __tests__/index.test.tsx
  Cannot find module '@paypal/react-paypal-js/sdk-v6' from 'src/components/PricingCards/PricingCard.tsx'
FAIL __tests__/api/shorten.test.ts
  ● creates a short link and returns its url — expected true, received undefined
```

El primero **no es una dependencia rota**: el subpath existe, pero el paquete sólo declara la condición `import` (ESM puro), y Jest resuelve por `require`. Es exactamente el caso ya documentado en `CLAUDE.md` para `@supabase/*` y `nanoid`, y hay que mapearlo igual en la configuración de Jest. Mientras tanto, toda la suite de la home está muerta.

El segundo es consecuencia del renombre `success` → `ok` en el envoltorio de respuesta: se actualizó el cliente y no el test.

---

## 2. PayPal

Esta vez sí entro. Ordeno por gravedad.

### P1 · Crítico — se pueden falsificar webhooks de PayPal

`src/app/api/webhooks/utils.ts:39`

```ts
const certUrl = headers.get('paypal-cert-url') as string;
...
const certPem = await downloadAndCache(certUrl);
return verifier.verify(certPem, signatureBuffer);
```

El certificado con el que se valida la firma se descarga **de la URL que indica la propia petición entrante**, sin comprobar que el dominio sea de PayPal. El ataque completo:

1. El atacante genera su par de claves y publica el certificado en su servidor.
2. Envía un POST a `/api/webhooks` con `paypal-cert-url: https://atacante.com/cert.pem` y la firma calculada con su clave privada.
3. `verify()` devuelve `true`.
4. `processPaypalWebhook` procesa el evento como legítimo.

Con eso se puede activar o expirar suscripciones ajenas sin pagar. Y además es un SSRF: el servidor hace `fetch` a cualquier URL que le digan.

Esto ya estaba señalado en el traspaso de agosto y la rama lo toca sin arreglarlo: el cambio de esa función fue el `g` del regex y la ruta de caché. **El arreglo es validar el host antes del fetch** — aceptar sólo `api.paypal.com` y `api.sandbox.paypal.com`, comparando el hostname exacto, no con `includes`.

### P2 · Crítico — IDOR en la aprobación de suscripciones

`src/app/api/v1/subscription/approve/route.ts:38`

```ts
const subscriptionReq = await SubscriptionRequestsRepository.findByExternalId(id);
```

La ruta comprueba que hay sesión (línea 27) y luego busca la solicitud **por el id que viene en el cuerpo, sin filtrar por usuario**. Todo pasa por `supabase_service`, así que RLS no interviene.

Lo llamativo es que el repositorio ya trae el parámetro para arreglarlo:

```ts
async findByExternalId(external_subscription_id: string, user_id?: string)
```

Está construido y no se usa. El arreglo es `findByExternalId(id, user.id)` y comprobar que devuelve fila.

### P3 · Crítico — el guard de webhooks sigue sin ejecutarse

`src/middleware.ts:17` tiene `if (path === '/api/webhooks') return checkWebhook(request);`, pero el matcher de la línea 61 es:

```
'/((?!api|_next|favicon\\.ico|...).*)'
```

Excluye todo lo que empieza por `api`. **La línea 17 es código muerto.** Es el mismo hallazgo de agosto, intacto: un control de seguridad que aparenta estar puesto y no corre.

Aviso para quien lo arregle: `checkWebhook` exige cabeceras `x-vercel-internal-bot-name`, `-category` y `-check`. Si esas cabeceras no llegan en producción, corregir el matcher hará que **todos** los webhooks pasen a devolver 400. No he podido comprobar si Vercel las envía; hay que probarlo en preview antes de tocar el matcher. Y en cualquier caso una comprobación de cabeceras no aporta nada sobre la verificación criptográfica: lo que hay que arreglar es P1.

### P4 · Crítico — se vuelcan datos personales y un secreto en los logs

`src/app/api/webhooks/route.ts:29-31`

```ts
console.log('Headers:', Object.fromEntries(headers.entries()));
console.log('Body:', JSON.stringify(data, null, 2));
```

Eso son **todas** las cabeceras y el cuerpo íntegro del webhook en los logs de Vercel: nombre, correo y país del pagador. Y en `utils.ts:37`:

```ts
console.log('🧩 Original signed message:', message);
```

`message` incluye `WEBHOOK_ID`, que es un secreto de configuración.

El proyecto prohíbe `console.*` en servidor precisamente por esto: existe `src/lib/logger.ts` con redacción automática de claves sensibles a cualquier profundidad. Los servicios nuevos de suscripción sí lo usan bien; la ruta de webhooks no.

### P5 · Grave — la caché del certificado rompe el webhook en producción

`src/app/api/webhooks/utils.ts:14`

```ts
const filePath = path.join(process.cwd(), CACHE_DIR, cacheKey);
```

`CACHE_DIR` vale `/tmp` por defecto. `path.join('/var/task', '/tmp', clave)` da `/var/task/tmp/clave` — comprobado ejecutándolo. Antes del cambio era `/tmp/clave`.

En Vercel el sistema de ficheros es de sólo lectura salvo `/tmp`, y ese directorio no existe. El `fs.writeFile` de la línea 24 **no tiene captura de errores**, así que lanza, sube al `try/catch` de la ruta y devuelve 500. PayPal reintenta, vuelve a fallar.

Es decir: el cambio convirtió una ruta absoluta en una relativa y con eso rompe la verificación entera. No lo he ejecutado en Vercel, así que lo marco como inferido con alta confianza; la ruta calculada sí está verificada.

### P6 · Grave — quien pague «pro» recibe los límites de «basic»

`src/features/payments/services/sync-subscription.ts:133-137` y `:171`

```ts
await setSubscriptionUserAuth({ id: subscription.id, name: "basic", isFree: false });
...
// TODO: set name
await setSubscriptionUserAuth({ id: newSub.data.service_id, name: 'basic', isFree: false });
```

El nombre del plan está fijo a `"basic"`. Como `user_plan.name` es lo que alimenta `RATE_LIMITS` y `ALLOWED_PARAMS`, un cliente de plan pro se queda con 1.000 enlaces al mes en vez de 10.000 y sin `utm_id`. Cobras uno y entregas otro.

Además los dos sitios pasan cosas distintas en el campo `id`: uno el id de la suscripción y el otro el del servicio. Lo que lea ese campo va a estar mal la mitad de las veces.

### P7 · Grave — se puede cancelar en PayPal una suscripción recién pagada

`createSubscription` llama a `rejectPendingRequests(user.id)` (línea 52) antes de crear la nueva, y esa función cancela en PayPal toda solicitud en `APPROVAL_PENDING`.

El problema es la ventana entre que el usuario aprueba en PayPal y llega el webhook: durante ese rato la solicitud sigue en `APPROVAL_PENDING`. Si el usuario vuelve a la página de planes y pulsa otra vez, se le cancela una suscripción que acaba de pagar.

Aparte, el orden dentro del bucle está invertido: marca `REJECTED` en la base y **después** cancela en PayPal. Si la cancelación falla, la fila queda mintiendo. Y como no hay captura de errores en el bucle, un fallo corta el resto de iteraciones.

### P8 · Grave — el registro del webhook revienta si el insert falla

`src/features/payments/services/webhook.ts:13-23`

```ts
const { data } = await webhookRepo.create({...});
const webhookId = data?.[0].id;
```

No se comprueba `error`, y el encadenamiento opcional está en el sitio equivocado: si `data` es `null` o `[]`, `data?.[0]` es `undefined` y `.id` lanza `TypeError`. Ocurre justo en el caso más probable —`webhook_events.external_event_id` tiene restricción única y PayPal reintenta los eventos—, así que un reintento legítimo produce un 500, que provoca otro reintento.

Debería ser `data?.[0]?.id` y, sobre todo, comprobar el error.

### P9 · Grave — sólo se procesa un tipo de evento

El `enum PaypalEventType` enumera trece eventos y el `if` sólo atiende `SUBSCRIPTION_EXPIRED`. Una cancelación, una suspensión o un pago fallido se guardan en `webhook_events` con `processed: false` y no hacen nada más. **Quien cancele desde PayPal conserva su plan indefinidamente.** No hay ningún mecanismo que reprocese lo que quedó en `false`.

Y el TODO de la línea 8 reconoce que falta la idempotencia por `external_event_id` + `gateway`.

### P10 · Medio — reintentos automáticos de POST contra PayPal

`src/lib/paypal.ts`

```ts
retryConfig: { httpMethodsToRetry: ['POST'], retryInterval: 30, maxNumberOfRetries: 2 }
```

Reintentar POST en una API de pagos sólo es seguro con clave de idempotencia. En `createSubscription` **sí la hay** (`paypalRequestId: request_id`, bien visto), pero la configuración aplica a todos los POST del cliente, incluido `cancelSubscription`, que no la lleva.

Y el intervalo: 30 (segundos, en el core de apimatic) × 2 reintentos son hasta 60 s añadidos dentro de una función serverless. Se va a agotar el tiempo antes de reintentar.

### P11 · Medio — un fallo transitorio de PayPal deja al usuario sin plan

`sync-subscription.ts:138-140`: cualquier estado distinto de `ACTIVE` ejecuta `setSubscriptionUserAuth(null)`, que borra el plan del metadata. Un `SUSPENDED` por un cobro que falló una vez deja al cliente sin servicio de inmediato, sin periodo de gracia.

### P12 · Menor — el docblock de `createSubscription` describe pasos que no ocurren

Dice que usa `checkSubscriptionStatus()` y que «busca solicitudes pendientes recientes (< 1 hora) para reutilizar external_id». Lo primero está comentado (líneas 39-50) y lo segundo no existe: lo que hace es `rejectPendingRequests`, que es lo contrario. Documentación que miente, que cuesta más que la que falta.

---

## 3. Supabase

### S1 · Bien — se adoptaron las migraciones

De **2 entradas a 13** en `supabase_migrations.schema_migrations`, once de ellas entre el 20 y el 22 de agosto. Era la deuda que más me preocupaba en la auditoría del día 20 y está encaminada. Cuenta como el mejor cambio de esta rama.

### S2 · Bien — `db.types.d.ts` regenerado y en UTF-8

Ya no está en UTF-16, así que `grep` y `rg` funcionan dentro. Cierra otro pendiente de agosto. El precio es B1: la regeneración rompió el build de dos ficheros que nadie recompiló.

### S3 · Grave — los grants por defecto han vuelto en las seis tablas nuevas

`anon` y `authenticated` tienen `DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE` sobre `permissions`, `role_permissions`, `roles`, `service_entitlements`, `subscription_requests` y `user_roles`. Es exactamente el grant que quitamos en agosto, reaparecido porque crear tablas desde el panel vuelve a aplicar la plantilla de Supabase.

**Lo que sí está bien**: las políticas RLS son correctas —todas de SELECT y acotadas a `auth.uid()` donde corresponde—, y no hay ninguna de INSERT, UPDATE o DELETE. Así que **no se puede escalar privilegios asignándose un rol**: lo comprobé leyendo las nueve políticas. El riesgo práctico por PostgREST es bajo.

Lo que queda es el `TRUNCATE`, que **no está sujeto a RLS**, y la lección de proceso: el endurecimiento de agosto no sobrevive a la creación de tablas nuevas si nadie revoca después. Conviene dejarlo en la propia migración.

Detalle menor: `roles`, `permissions`, `role_permissions` y `service_entitlements` tienen `USING (true)` para `authenticated`, así que cualquier usuario con cuenta puede leerse el modelo de permisos completo. Es configuración, no datos, pero le regala el mapa a quien busque huecos.

Otro: `subscription_requests` tiene **dos políticas de SELECT idénticas** («Users can view their own subscription requests» y `subscription_requests_select_own`). Como son permisivas se combinan con OR y no rompen nada; sobra una.

### S4 · Nada de la remediación del 20 de agosto se ha ejecutado

Verificado hoy contra producción:

| Hallazgo del 20/08 | Estado hoy |
|---|---|
| `security.is_domain_secure` rota (INSERT 3 valores en 2 columnas) | **sigue rota** |
| Políticas `USING (true)` para rol `public` en las 4 tablas de `security` | **siguen** |
| `SELECT` a `PUBLIC` en `short_links`, `history_clicks`, `domains_to_check` | **sigue** |
| Índices `short_links(user_id)` e `(ip_user)` | **no creados** (sólo existe `short_links_pkey`) |

Es lo esperado —el script quedó pendiente de que lo ejecutaras— pero conviene que no se pierda entre el trabajo nuevo. Ahora que hay migraciones, lo natural es meterlo como una más en vez de ejecutarlo suelto.

---

## 4. Dashboard y contrato de la API

### D1 · Grave — rotura del contrato público sin compatibilidad

Dos cambios incompatibles a la vez:

- `/api/shorten` → `/api/v1/shorten`, **sin rewrite ni redirect**. Lo comprobé: no hay nada en `next.config.ts` ni en el middleware.
- El envoltorio de respuesta pasa de `success` a `ok`.

La landing `/url-shortener-api` está indexada, promociona ese endpoint y dice «sin API key para empezar», o sea que invita a integrarlo. Cualquiera que lo hiciera se rompe hoy con un 404, y quien sortee el 404 se rompe con el campo renombrado.

Y la propia landing quedó a medias: se actualizó la ruta en los ejemplos, pero el bloque `RESPONSE_EXAMPLE` (líneas 120 y 132) **sigue documentando `"success": true` / `"success": false"`**.

Lo barato es un rewrite de `/api/shorten` a `/api/v1/shorten` y corregir el ejemplo. Versionar la API está bien; hacerlo sin puerta de salida para quien ya la usaba, no.

### D2 · Grave — el resumen del dashboard vuelve a calcularse sobre 20 enlaces

`/api/v1/dashboard/summary` llama `getStatsUserUrls(user.id)` sin paginar, y esa función tiene `limit = 20` por defecto. De ahí salen `slugs`, y con esos slugs se calculan `links` y los clics totales.

Es el mismo bug que corregimos en agosto en `/api/dashboard/stats` —los KPI sobre un subconjunto arbitrario y sin ninguna señal— reintroducido en el endpoint nuevo. La pieza que lo resuelve ya existe: `getSlugs(user_id)`, que devuelve todos.

Además `country: ''` está fijo a cadena vacía y hay un `// TODO: check` en la línea 37.

### D3 · Medio — el sistema de autorización tiene un solo consumidor, y es un endpoint de pruebas

Se han añadido ocho ficheros en `src/features/authorization/` y cuatro tablas (`roles`, `permissions`, `role_permissions`, `service_entitlements`, con 29 permisos y 59 asignaciones sembradas). El diseño está limpio: separa contexto, permisos y entitlements, y `requirePermission` es una API clara.

Pero el único sitio que lo usa en todo el repositorio es `src/app/api/v1/dashboard/export/route.ts`, que se llama «export» y lo que devuelve es el contexto de acceso del propio llamante —roles, permisos y entitlements—, no una exportación de nada. Parece un andamio de pruebas que se coló en la rama.

Ninguna ruta real comprueba permisos todavía. No es un fallo, pero sí el riesgo de siempre: parece que hay autorización y no la hay. Y mientras tanto ya cargas con cuatro tablas en producción y con S3.

Detalle: `requirePermission` lanza `new Error("Unauthenticated")`, un `Error` pelado. `withErrorHandling` sólo entiende `ApiError`, así que eso saldrá como 500 en vez de 401 el día que se use de verdad.

### D4 · Menor — código muerto recién añadido

`src/features/dashboard/hooks/useUserLinksSummary.ts` importa `getUserLinksSummary` de `getStats`, símbolo que **no existe** (es uno de los 22 errores de tipos), lleva un `// TODO: check` y **no lo usa nadie**.

### D5 · Menor — `hideEmail` revienta con entradas raras

`src/lib/utils/hide-information.ts:7`: `localPart[0]` es `undefined` si el correo empieza por `@`, y entonces `.repeat(-1)` lanza `RangeError`. Además la máscara conserva la longitud exacta del local-part.

### D6 · Observación — `getCurrentUser` ahora hace una llamada de red por petición

El cambio de `auth.getClaims()` a `auth.getUser()` está bien razonado en el mensaje del commit (el JWT lleva datos que pueden estar rancios). El coste es que `getUser()` va contra el servidor de Auth en cada invocación, mientras que `getClaims()` leía el token localmente. Con el tráfico de hoy no importa; conviene saberlo antes de que importe.

De paso desapareció la rama de desarrollo que leía `users_profiles`, así que en local el plan sale sólo de la metadata.

---

## 5. Lo que está bien hecho

No es cortesía, es información útil para saber qué conservar:

- **Migraciones adoptadas** (S1). Es el cambio con más valor a largo plazo de toda la rama.
- **`db.types.d.ts` regenerado y en UTF-8** (S2).
- **`paypalRequestId` como clave de idempotencia** al crear la suscripción. Es justo lo que evita duplicados y no es obvio.
- **RLS bien puesta en las tablas nuevas**: políticas de SELECT acotadas a `auth.uid()`, ninguna de escritura.
- **`import 'server-only'`** en `src/lib/paypal.ts`: impide que el cliente de PayPal acabe en el bundle del navegador.
- **El bug real del regex**: `url.replaceAll(/\W+/, '-')` → `/\W+/g`. Sin la bandera sólo se sustituía la primera coincidencia.
- **Logger estructurado** con `log.child({ fn, user_id })` en los servicios de suscripción, bien usado.
- **La máquina de estados de suscripciones** (`subscription_requests` separada de `subscriptions`, con reconciliación contra PayPal para el caso de «aprobó y nunca se capturó») está bien pensada. El problema no es el diseño, son los detalles de arriba.
- **eslint en verde**, con dos commits dedicados a ello.

---

## 6. Choque con el trabajo pendiente

El slug propio y el destino editable que quedaron sin commitear en `DevelopmentYY` tocan `src/app/api/shorten/route.ts`, **que en `develop` ya no existe**. También tocan `user.repository.ts` y `edit_link.actions.ts`, que la rama modifica.

No es grave, pero hay que decidir el orden: o se rebasa ese trabajo sobre `develop` y se reubica en `v1/shorten`, o se fusiona antes y el developer resuelve el conflicto. Dejarlo para el final del merge es la forma de perderlo.

---

## 7. Orden sugerido para desbloquear

1. `yarn verify` en verde. Los cuatro bloqueantes salen de ahí.
2. **P1**: validar el host de `paypal-cert-url`. Es una línea y es lo que separa el webhook de ser falsificable.
3. **P2**: pasar `user.id` al `findByExternalId` que ya lo acepta.
4. **P4**: quitar los `console.log` de la ruta de webhooks.
5. **P5**: volver a la ruta absoluta de `/tmp`, y envolver el `writeFile` en un `catch` — que la caché falle no debería tumbar la verificación.
6. **B3**: o se recupera el checkout, o se retira `PayButtons` y `Cart`.
7. **D1**: rewrite de `/api/shorten` y corregir el ejemplo de respuesta de la landing.
8. **P6, P8, P9**: plan real en lugar de `"basic"`, `data?.[0]?.id` con comprobación de error, y decidir qué eventos se procesan.
9. **S3**: revocar los grants por defecto de las seis tablas nuevas, en una migración.

---

## 8. Qué no he podido verificar

Que Vercel envíe las cabeceras `x-vercel-internal-bot-*` que exige `checkWebhook`. De eso depende que arreglar el matcher del middleware sea inocuo o rompa todos los webhooks (P3). Se prueba en preview.

Que P5 falle realmente en producción: la ruta calculada sí está comprobada, el comportamiento del sistema de ficheros de Vercel lo doy por conocido, no medido.

El comportamiento en ejecución del flujo de suscripción completo. No he tocado la cuenta de PayPal ni disparado ningún webhook: todo lo de esta sección sale de leer el código.
