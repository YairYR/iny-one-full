ALTER TABLE public.short_links
    ALTER COLUMN link_id SET DEFAULT gen_random_uuid();

