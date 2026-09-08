# Hallazgo · `request-standards.ts` es un estándar documentado y no adoptado

*7 de septiembre de 2026. Sale de una auditoría de sobreingeniería sobre `develop`,
después de fusionar `refactor/pay-button`. No se tocó nada: queda para decidir con
quien escribió el estándar.*

## Qué hay

`src/lib/api/request-standards.ts` son **388 líneas y 30 exports** —paginación,
ordenación, filtros, operaciones batch, `include` params, tipos de respuesta— con
**cero consumidores en el código**.

No es código huérfano. Es la mitad de código de un estándar documentado en **1.510
líneas**:

| Documento | Líneas |
|---|---|
| `docs/API_INDEX.md` | 340 |
| `docs/EXAMPLES_CRUD_ENDPOINTS.md` | 523 |
| `docs/ZOD_VALIDATION_GUIDE.md` | 647 |

Y no están redactados como notas de diseño. `API_INDEX.md` abre con «Para crear un
nuevo endpoint» y una receta de cinco pasos: se presentan como **la forma vigente de
trabajar en este repositorio**.

Total en juego: **1.898 líneas**.

## Cómo se verificó

Con `os.walk` sobre 206 ficheros (`.ts`, `.tsx`, `.js`, `.json`, `.md`, `.yml`), no con
`glob` —los corchetes de las rutas de Next lo rompen y producen falsos «sin
referencias», que es la trampa que ya está anotada en `CLAUDE.md`—. Se buscaron los 30
símbolos exportados, uno a uno, con límite de palabra.

Ningún fichero de `src/`, `__tests__/`, `data/` ni `scripts/` los referencia. Las únicas
apariciones están en los tres documentos de arriba.

## Por qué no se borró

Borrar las 388 líneas y dejar los documentos vivos deja **1.510 líneas instruyendo a
quien venga —personas y agentes, que este repositorio tiene `CLAUDE.md`— a usar
funciones que ya no existen**. Es peor que el estado actual.

Además, `CLAUDE.md` es explícito: lo no referenciado **se marca `INACTIVO`, no se
borra**.

## La pregunta abierta

**¿El estándar sigue siendo la intención, o se abandonó?** De eso dependen las tres
salidas, y no se puede responder desde el código:

1. **Abandonado** → se van código y documentos juntos: −1.898 líneas.
2. **Vigente pero sin adoptar** → cabecera `INACTIVO` en el código y una nota al inicio
   de cada documento aclarando que describe un estándar aún no adoptado. ~15 líneas.
3. **Vigente y se quiere adoptar** → migrar los endpoints de `src/app/api/` a él. Es el
   trabajo grande, pero es el único desenlace en el que los documentos pasan a ser
   ciertos.

## Contexto

Ninguna de las 9 rutas de `/api` lo usa hoy. Todas envuelven en `withErrorHandling`, 7
de 9 responden con `successResponse`/`errorResponse` —las dos excepciones son
`auth/[slug]`, que redirige, y `webhooks`, que devuelve un acuse— y usan esquemas Zod
locales allí donde hay entrada que validar (`shorten`, `webhooks`, `billing/order`).

Eso es justo lo que `API_INDEX.md` prescribe en sus pasos 3 y 5: la parte de validación
y respuesta del estándar **sí está viva y adoptada**. Lo que nadie usa es la maquinaria
de listados —paginación, orden, filtros, batch—, y encaja: hoy no hay ningún endpoint
que devuelva colecciones paginadas. El estándar se escribió para una API REST genérica
que el producto todavía no necesita.

Esto matiza la decisión: no es «adoptar o tirar el estándar entero», es qué hacer con la
mitad que se adelantó al producto.
