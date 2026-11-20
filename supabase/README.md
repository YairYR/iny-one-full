# iny-one-full--supabase
Supabase migrations and cofiguration for local development

## Equipos personales

El registro crea el perfil sin equipo. La configuración opcional crea el equipo
personal; si se omite, se crea o recupera al intentar crear el primer enlace.
El formulario guarda el nombre, el código de país y la zona horaria del perfil
junto con el equipo en una transacción. El país se sugiere desde Vercel y la
zona horaria desde Vercel o el navegador; el usuario puede cambiarlos.
`teams.team_kind` distingue `personal`, `shared` y `unclassified`; el índice
parcial limita a uno personal por creador. La reparación de perfiles no crea
equipos.

La migración conserva los equipos históricos sin clasificar cuando no puede
identificarlos por el equipo predeterminado. Si un usuario sin equipo personal
crea un enlace, se recupera el equipo histórico «Personal» más antiguo con
membresía activa de propietario. Los duplicados restantes y sus enlaces no se
eliminan ni se trasladan: deben revisarse antes de cualquier consolidación.
Aplicar la migración en producción antes de desplegar la aplicación.

## Acceso acotado

La creación de enlaces consulta únicamente plan, cuota y equipo predeterminado
mediante `get_link_creation_access`. El dashboard usa `get_default_team_access`
para consultar el equipo y, cuando corresponde, comprobar un permiso concreto.
Estas funciones dependen de la identidad de la sesión. Aplicar la migración
`narrow_access_queries` antes de desplegar la aplicación.
