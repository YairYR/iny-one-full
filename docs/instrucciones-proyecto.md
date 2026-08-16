# iny.one — instrucciones del proyecto

## Qué es iny.one

Acortador de URLs con parámetros UTM, códigos QR y analítica de clics. Modelo freemium con planes
free, basic y pro. Los enlaces creados sin cuenta caducan a los 180 días; ese plazo es a la vez una
restricción de producto y la principal palanca de conversión.

Público mayoritariamente chileno. El SEO bilingüe forma parte del producto, no es un adorno: inglés
por defecto y español bajo `/es/*` con URLs propias, landings que traen tráfico y señales canónicas
que hay que cuidar al tocar rutas o metadata.

Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, Supabase (Postgres + Auth) y
Vercel. Repositorio `iny-one-full`.

## Antes de tocar el repositorio

Lee `CLAUDE.md` en la raíz: comandos, fronteras, trampas verificadas y estado conocido de la base de
datos. **Mantenlo actualizado.** Si descubres una trampa que costó tiempo, o cambia el estado de la
base, se anota ahí con fecha. No dupliques en él lo que ya está en el README: son capas distintas y
si se solapan divergen.

## Cómo escribir código

Prefiere la solución más pequeña que sea correcta y legible. Borrar o reutilizar antes que añadir.
El objetivo es menos código que mantener, no menos trabajo: los tests y el manejo de errores nunca
cuentan como código de más.

Refactoriza lo que ya estás tocando cuando reduzca complejidad. Un refactor grande se propone antes
de hacerlo, nunca se entrega como sorpresa dentro de otra tarea.

No borres código sin usar: se marca como inactivo con su disclaimer (convención en `CLAUDE.md`).
No añadas dependencias sin explicar por qué no basta lo que ya hay.

Terminado significa `yarn verify` en verde. Nada se declara funcionando sin evidencia; si algo no se
pudo comprobar, dilo en lugar de darlo por bueno.

## Verificar antes de afirmar

Cuando algo se pueda comprobar ejecutándolo, compruébalo en vez de deducirlo. El razonamiento seguro
falla más de lo que parece: un barrido de código muerto con patrones glob se saltó rutas con
corchetes y dio falsos «sin referencias»; un `revoke` de permisos parecía correcto y no quitaba nada
porque el privilegio se heredaba de `PUBLIC`. Ambos se cazaron ejecutando algo.

Al reportar, distingue siempre lo verificado de lo inferido. Una comprobación que no puede
diferenciar «funciona» de «está roto» no comprueba nada: diseña la prueba para que un error de
configuración no se parezca a un éxito.

## Fallos silenciosos

Es el modo de fallo característico de este proyecto y merece atención específica. PostgREST devuelve
cero filas sin error cuando RLS deniega; los errores de consulta se convierten en paneles vacíos si
no se comprueban; `grep` no encuentra nada dentro de un fichero UTF-16. Un fallo que no se nota es
peor que uno ruidoso. Ante la duda, falla visible y registra por qué.

## Datos y base de datos

La base es de producción y contiene datos personales: IPs, ciudades y coordenadas de usuarios
reales. No ejecutes consultas que devuelvan filas personales cuando basten metadatos o agregados.

Todo cambio en la base va en un script bajo `scripts/sql/`, con su verificación antes y después.
Nada destructivo ni irreversible sin confirmarlo primero.

## Modelo de datos y arquitectura

Prioriza claridad y simpleza sobre elegancia. Una estructura obvia que alguien entiende en cinco
minutos vale más que una abstracción correcta que exige un mapa.

Escalabilidad aquí significa **no cerrarse puertas**, no construir para un tamaño que no se tiene.
Una interfaz que permite cambiar de implementación después es barata; una infraestructura que nadie
usa todavía, no. Cuando propongas optimizar, trae el dato del tamaño real antes de decidir: puede
que el problema no exista aún.

Mantén las fronteras que ya existen. El acceso a datos pasa por los repositorios de `src/infra/`, y
las rutas no saben de Supabase. Si una decisión de arquitectura tiene alternativas razonables,
expón el compromiso en dos líneas antes de elegir.

## Cómo comunicarte

Si algo que propongo está mal, es innecesario o hay un camino mejor, dilo. No valides por cortesía.
Cuando te equivoques, corrígelo de forma explícita y explica qué falló, sobre todo si una conclusión
anterior se apoyaba en ello.

Decide y deja constancia del supuesto en lo reversible. Pregunta en lo que toca producción o no
tiene vuelta atrás.

Explica el porqué, no sólo el qué. Los comentarios en el código siguen la misma regla.

## No hagas

- Reescribir o reestructurar sin pedirlo.
- Declarar algo verificado cuando sólo está razonado.
- Tocar PayPal por iniciativa propia (ver fronteras en `CLAUDE.md`).
- Dejar `console.*` en código de servidor: existe un logger.
- Añadir documentación que describa el código en lugar de explicar decisiones. La que miente cuesta
  más que la que falta.
