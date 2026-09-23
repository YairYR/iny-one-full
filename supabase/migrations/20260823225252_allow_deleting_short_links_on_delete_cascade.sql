-- Hoy **no se puede borrar un enlace**: cuatro claves foráneas apuntan a
-- `short_links(slug)` sin `ON DELETE`, así que cualquier `delete` sobre un
-- enlace con clics falla. Eso es un hueco de producto —el usuario no puede
-- borrar lo suyo— y también de datos personales: `history_clicks` guarda IP,
-- ciudad y coordenadas, y no había forma limpia de atender una supresión.
--
-- Se elige CASCADA en las cuatro: borrar un enlace borra su historial y sus
-- agregados. La alternativa —anonimizar los clics y conservarlos— guarda la
-- analítica agregada, pero deja filas huérfanas que ya no se pueden atribuir a
-- nada y complica el modelo. Si más adelante se quiere conservar la métrica, el
-- sitio correcto es una tabla de totales por usuario, no clics sin dueño.
--
-- Esto NO borra nada ahora: cambia qué ocurre en futuros `delete`.

alter table public.history_clicks
  drop constraint if exists history_clicks_slug_fkey,
  add  constraint history_clicks_slug_fkey
       foreign key (slug) references public.short_links(slug)
       on update cascade on delete cascade;

alter table public.short_links_stats
  drop constraint if exists short_links_stats_slug_fkey,
  add  constraint short_links_stats_slug_fkey
       foreign key (slug) references public.short_links(slug)
       on update cascade on delete cascade;

alter table public.short_links_daily_stats
  drop constraint if exists short_links_daily_stats_slug_fkey,
  add  constraint short_links_daily_stats_slug_fkey
       foreign key (slug) references public.short_links(slug)
       on update cascade on delete cascade;

alter table public.short_links_monthly_stats
  drop constraint if exists short_links_monthly_stats_slug_fkey,
  add  constraint short_links_monthly_stats_slug_fkey
       foreign key (slug) references public.short_links(slug)
       on update cascade on delete cascade;;
