-- The application provisions Auth users with the server-only Supabase key,
-- then writes their matching application profile.  The service_role bypasses
-- RLS, but still needs normal PostgreSQL table privileges.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.profiles to service_role;
