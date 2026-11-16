-- The web application uses the authenticated role for dashboard reads and
-- the service_role key for manager-only provisioning and job creation.
-- RLS still controls which rows an authenticated user can see; these grants
-- only allow PostgREST to reach the application tables in the first place.

grant usage on schema public to authenticated, service_role;

grant select on table
  public.profiles,
  public.clients,
  public.properties,
  public.jobs,
  public.checklist_items,
  public.job_checklist_progress
to authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.clients,
  public.properties,
  public.jobs,
  public.checklist_items,
  public.job_checklist_progress
to service_role;
