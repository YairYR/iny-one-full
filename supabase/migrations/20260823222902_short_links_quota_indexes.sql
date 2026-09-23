-- Medido el 2026-08-20: 557 recorridos secuenciales de `short_links` que habían
-- leído 1.464.797 filas sobre una tabla de 2.651, es decir la tabla entera cada
-- vez. Son las consultas de cuota —que corren en CADA creación de enlace— y el
-- listado del dashboard, que filtran por `user_id` y por `ip_user` sin índice.
--
-- Con el volumen de hoy tardan menos de un milisegundo, así que esto no arregla
-- una lentitud: cambia una consulta cuyo coste crece con el total de enlaces de
-- la plataforma por otra que crece con los del usuario. `index_advisor` estimaba
-- 216,7 → 2,3.

create index if not exists short_links_user_id_created_at_idx
  on public.short_links (user_id, created_at desc)
  where user_id is not null;

create index if not exists short_links_ip_user_created_at_idx
  on public.short_links (ip_user, created_at desc)
  where user_id is null;

-- El historial de clics se consulta por enlace y rango de fechas; hoy sólo hay
-- índice por `slug`.
create index if not exists history_clicks_slug_created_at_idx
  on public.history_clicks (slug, created_at desc);;
