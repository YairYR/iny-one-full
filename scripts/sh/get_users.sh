pg_dump \
  --data-only \
  --table=auth.users \
  --column-inserts \
  --no-owner \
  --no-privileges \
  --dbname="$DATABASE_URL" \
  | sed -E 's/^\\(un)?restrict/-- &/' \
  > supabase/seed_auth.sql