ALTER TABLE "public"."orders"
DROP CONSTRAINT "orders_status_check",
add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text, 'cancelled'::text, 'expired'::text]))) not valid;
