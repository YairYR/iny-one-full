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
-Se debe priorizar el escribir la menor cantidad de  lineas de codigo posible, si se identifica un modo más simple de implementar una logica, se puede sugerir refactorizar una seccion. 

## Código inactivo

Lo que no está referenciado no se borra. Las unidades completas quedan comentadas bajo una cabecera
`INACTIVO`; los exports sueltos dentro de módulos vivos llevan `/** INACTIVO */` y siguen activos.
`rg INACTIVO src/` da el listado actual; el inventario razonado está en el README.

## Estado conocido

- RLS activo en Supabase.
- **Sin confirmar**: índice único en `short_links(slug)`. El reintento por colisión de
  `/api/shorten` depende de que exista. Faltan también índices compuestos para las consultas de
  cuota: `(user_id, created_at)` y `(ip_user, created_at)`.
- La CSP lleva `'unsafe-inline'` en `script-src` por el gtag en línea y los bloques JSON-LD.
  Endurecerla con nonce está pendiente.
