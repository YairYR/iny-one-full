-- Rastro de cambios de destino, requisito de la edición de enlaces.
--
-- Repuntar un enlace muy compartido es el vector para convertir uno legítimo en
-- malicioso, así que el cambio deja registro. Lo escribe el service role: la
-- tabla queda con RLS y sin políticas, de modo que el propio usuario no puede
-- leer ni falsear su historial. Mismo criterio que `history_clicks`.

create table if not exists public.short_link_destination_changes (
  id              bigserial   primary key,
  slug            text        not null
                              references public.short_links(slug)
                              on update cascade on delete cascade,
  old_destination text        not null,
  new_destination text        not null,
  changed_by      uuid        not null,
  changed_at      timestamptz not null default now()
);

create index if not exists short_link_destination_changes_slug_changed_at_idx
  on public.short_link_destination_changes (slug, changed_at desc);

alter table public.short_link_destination_changes enable row level security;

-- Sin políticas: denegada para anon y authenticated. Se revoca explícito porque
-- crear una tabla vuelve a aplicar los grants por defecto de la plantilla.
revoke all on public.short_link_destination_changes from public, anon, authenticated;
grant  all on public.short_link_destination_changes to service_role;
grant usage, select on sequence public.short_link_destination_changes_id_seq to service_role;;
