# Cambios aplicados en Supabase — 23 de agosto de 2026

Estas migraciones **ya están aplicadas en producción** (proyecto
`xgdjnvzzzmowapxscpak`) a través del conector MCP, y quedan registradas en
`supabase_migrations.schema_migrations`. Este fichero es el índice legible; el
SQL vive en el historial de migraciones de Supabase.

| Migración | Qué hace |
|---|---|
| `harden_security_schema_and_public_grants` | Elimina las políticas `USING (true)` del rol `public` en las cuatro tablas de `security` y revoca los grants a `PUBLIC` allí y en `short_links`, `history_clicks` y `domains_to_check`. |
| `revoke_default_grants_on_authorization_tables` | Retira el grant por defecto de Supabase (incluido `TRUNCATE`) en `roles`, `permissions`, `role_permissions`, `service_entitlements`, `user_roles`, `subscription_requests` y `subscriptions`; deja sólo `SELECT` para `authenticated`. Borra la política de SELECT duplicada. |
| `fix_is_domain_secure_and_close_definer_functions` | Corrige el `INSERT` de tres valores en dos columnas que rompía la rama principal del blocklist, invierte el orden para que el whitelist no gane al blocklist y deja de auto-whitelistear. Cierra `EXECUTE` a `anon` en `fn_log_audit` y `authorize`. |
| `short_links_quota_indexes` | Índices `(user_id, created_at)` e `(ip_user, created_at)` en `short_links` y `(slug, created_at)` en `history_clicks`. |
| `short_link_destination_changes_audit` | Tabla de auditoría de cambios de destino, con RLS y sin políticas: sólo service role. |
| `services_plan_key_and_slug_format_check` | Añade `services.plan_key` (`free`/`basic`/`pro`) y lo mapea; añade un `CHECK` de formato al slug. |
| `allow_deleting_short_links_on_delete_cascade` | `ON UPDATE/DELETE CASCADE` en las cuatro FKs que apuntan a `short_links(slug)`. Sin esto **no se podía borrar un enlace**, ni por el usuario ni para atender una supresión de datos personales. No borra nada ahora: cambia qué ocurre en futuros `delete`. |
| `click_short_link_stop_counting_bots` | `click_short_link` deja de incrementar `short_links.clicks` cuando el visitante es un bot, igual que ya hacía el trigger de estadísticas. A partir de aquí los dos contadores miden lo mismo. |

## Supuesto que conviene confirmar

El mapeo de `plan_key` se hizo por precio sobre los dos servicios activos:

- **Plan Starter** ($5) → `basic` (1.000 enlaces/mes)
- **Plan Pro** ($10) → `pro` (10.000 enlaces/mes)

Los inactivos (Plan Premium, Plan Enterprise) quedan con `plan_key = null` a
propósito: reactivar uno obliga a decidir su cuota. **Un servicio de suscripción
activo sin `plan_key` deja al usuario en el plan gratuito**, que es el fallo
seguro pero no el deseado.

Si el mapeo no es ése, se corrige con un `update` y no hace falta tocar código.

## Decisiones tomadas, reversibles

**Borrado en cascada.** Se eligió cascada en las cuatro FKs: borrar un enlace
borra su historial y sus agregados. La alternativa era anonimizar los clics y
conservarlos, que guarda la métrica agregada pero deja filas sin dueño y
complica el modelo. Si más adelante interesa conservar totales históricos, el
sitio correcto es una tabla de totales por usuario, no clics huérfanos.

**Los bots dejan de contar.** Se eligió que la verdad es el número sin bots, que
es el que se le enseña al usuario, y `click_short_link` ya no incrementa
`short_links.clicks` para ellos. El clic del bot se sigue guardando en
`history_clicks`, que sirve para diagnosticar.

## Pendiente

- **Conciliar los 347 desfases históricos.** No se ejecutó a propósito: bajaría
  cifras que el usuario ya ha visto. La consulta está anotada al final de la
  migración `click_short_link_stop_counting_bots`, sin ejecutar.
- **Los 290 MB de blocklist frío** (`blocked_url` 251 MB con 6 escaneos de
  índice en toda su vida, `blocklist_url_phishing_active` 39 MB con cero). Es el
  88% de la base y es una decisión de infraestructura: podar, mover fuera o
  confirmar que el filtro de Bloom lo hace prescindible.
- **Traer el historial de migraciones al repositorio.** Ver
  `supabase/migrations/README.md`: son 21 migraciones aplicadas y ninguna está
  versionada en git.
