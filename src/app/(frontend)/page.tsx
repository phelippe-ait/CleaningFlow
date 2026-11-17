import { appAuth } from "@/lib/app-auth"
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"
import { AuthScreen, Dashboard } from "./CleanFlowApp"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const user = await appAuth.currentUser()
  if (!user) return <AuthScreen />

  const supabase = await createSupabaseServerClient()
  const isManager = user.role === "manager"
  const [jobsResult, cleanersResult, clientsResult, propertiesResult] =
    await Promise.all([
      supabase
  .from("jobs")
  .select(`
    id, title, scheduled_start, scheduled_end,
    status, instructions, estimated_earnings,
    properties ( address_line1, clients ( full_name ) ),
    profiles!jobs_cleaner_id_fkey ( id, full_name ),
    checklist_items (
  id,
  task_name,
  sort_order,
  job_checklist_progress (
    is_completed
  )
)
  `)
  .order("scheduled_start", { ascending: true })
  .limit(100),
      isManager
        ? supabase
            .from("profiles")
            .select("id, full_name")
            .eq("role", "cleaner")
            .order("full_name")
        : Promise.resolve({ data: [], error: null }),
      isManager
        ? supabase.from("clients").select("id", { count: "exact", head: true })
        : Promise.resolve({ count: 0, error: null }),
      isManager
        ? supabase.from("properties").select("id", { count: "exact", head: true })
        : Promise.resolve({ count: 0, error: null }),
    ])

  if (jobsResult.error || cleanersResult.error || clientsResult.error || propertiesResult.error) {
    throw new Error("Could not load the CleanFlow workspace.")
  }

  const one = <T,>(value: T | T[] | null): T | null =>
    Array.isArray(value) ? value[0] ?? null : value

  const jobs = (jobsResult.data ?? []).map((job) => {
    const property = one(job.properties)
    const client = property ? one(property.clients) : null
    const cleaner = one(job.profiles)
    const start = new Date(job.scheduled_start)
    const end = new Date(job.scheduled_end)

    return {
      id: job.id,
      title: job.title,
      clientName: client?.full_name ?? "Client",
      serviceAddress: property?.address_line1 ?? "Address unavailable",
      cleaner: cleaner
        ? { id: cleaner.id, name: cleaner.full_name, email: "" }
        : "Unassigned",
      scheduledAt: job.scheduled_start,
      durationMinutes: Math.max(15, Math.round((end.getTime() - start.getTime()) / 60_000)),
      estimatedEarnings: Number(job.estimated_earnings ?? 0),
      status: (
  job.status === "in_progress" ? "in-progress" : job.status
) as "scheduled" | "accepted" | "in-progress" | "completed",
      instructions: job.instructions,
            checklist: (job.checklist_items ?? [])
  .sort((a, b) => a.sort_order - b.sort_order)
  .map((item) => ({
    id: item.id,
    task: item.task_name,
    completed: (
      Array.isArray(item.job_checklist_progress)
        ? item.job_checklist_progress
        : item.job_checklist_progress
          ? [item.job_checklist_progress]
          : []
    ).some((progress) => progress.is_completed === true),
  })),
    }
  })

  return (
    <Dashboard
      user={{
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      jobs={jobs}
      cleaners={(cleanersResult.data ?? []).map((cleaner) => ({
        id: cleaner.id,
        name: cleaner.full_name,
        email: "",
      }))}
      clientCount={clientsResult.count ?? 0}
      propertyCount={propertiesResult.count ?? 0}
    />
  )
}
