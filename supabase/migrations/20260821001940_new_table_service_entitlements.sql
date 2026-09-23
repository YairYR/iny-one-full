create table public.service_entitlements (
    service_id uuid not null
         references public.services(id)
        on delete cascade,

    key text not null,
    value jsonb not null,

    primary key (service_id, key)
);
