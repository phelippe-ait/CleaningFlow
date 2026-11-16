"use server"

import { appAuth } from "@/lib/app-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"

export type ActionResult = { ok: true } | { ok: false; error: string }
const messageFor = (error: unknown) => error instanceof Error && error.message ? error.message : "Something went wrong. Please try again."
const databaseStatus = (status: "scheduled" | "accepted" | "in-progress" | "completed") => status === "in-progress" ? "in_progress" : status

export async function loginAction(email: string, password: string): Promise<ActionResult> {
  try { await appAuth.login(email, password); return { ok: true } }
  catch { return { ok: false, error: "Email or password is incorrect." } }
}

export async function logoutAction(): Promise<ActionResult> { await appAuth.logout(); return { ok: true } }

export async function createCleanerAction(data: { name: string; email: string; phone?: string; password: string }): Promise<ActionResult> {
  const user = await appAuth.currentUser()
  if (!user || user.role !== "manager") return { ok: false, error: "Manager access required." }
  const name = data.name.trim(); const email = data.email.trim().toLowerCase()
  if (name.length < 2) return { ok: false, error: "Please enter the cleaner’s full name." }
  if (!email.includes("@")) return { ok: false, error: "Please enter a valid email address." }
  if (data.password.length < 8) return { ok: false, error: "The temporary password must contain at least 8 characters." }
  const admin = createAdminClient()
  const { data: authData, error: authError } = await admin.auth.admin.createUser({ email, password: data.password, email_confirm: true, user_metadata: { full_name: name } })
  if (authError || !authData.user) return { ok: false, error: authError?.message ?? "Could not create the account." }
  // A profile is not created by Supabase Auth unless the project has an Auth
  // trigger installed.  Upsert makes provisioning work both with and without
  // that trigger, and also lets us re-issue credentials for an existing
  // cleaner profile.
  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: authData.user.id,
        full_name: name,
        phone: data.phone?.trim() || null,
        role: "cleaner",
      },
      { onConflict: "id" },
    )

  if (!profileError) return { ok: true }

  const { error: rollbackError } = await admin.auth.admin.deleteUser(authData.user.id)
  if (rollbackError) {
    return { ok: false, error: `The cleaner profile could not be created (${profileError.message}), and the Auth account could not be rolled back. Please contact an administrator.` }
  }
  return { ok: false, error: `The cleaner profile could not be created: ${profileError.message}` }
}

export async function updateJobStatusAction(jobId: string, status: "scheduled" | "accepted" | "in-progress" | "completed"): Promise<ActionResult> {
  const user = await appAuth.currentUser()
  if (!user) return { ok: false, error: "Your session has expired." }
  const next = databaseStatus(status)
  if (user.role === "manager") {
    const { error } = await createAdminClient().from("jobs").update({ status: next }).eq("id", jobId)
    return error ? { ok: false, error: error.message } : { ok: true }
  }
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc("advance_my_job", { p_job_id: jobId, p_status: next })
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function createJobAction(data: { title: string; clientName: string; serviceAddress: string; suburb: string; postcode: string; cleaner: string; scheduledAt: string; durationMinutes: number; estimatedEarnings: number; instructions?: string }): Promise<ActionResult> {
  const user = await appAuth.currentUser()
  if (!user || user.role !== "manager") return { ok: false, error: "Manager access required." }
  if (!data.title.trim() || !data.clientName.trim() || !data.serviceAddress.trim() || !data.suburb.trim() || !/^\d{4}$/.test(data.postcode.trim()) || !data.cleaner || !data.scheduledAt) return { ok: false, error: "Complete all required fields, including a four-digit postcode." }
  const start = new Date(data.scheduledAt); const end = new Date(start.getTime() + Math.max(15, Number(data.durationMinutes)) * 60_000)
  if (Number.isNaN(start.getTime())) return { ok: false, error: "Enter a valid scheduled time." }
  try {
    const admin = createAdminClient()
    const { data: client, error: clientError } = await admin.from("clients").insert({ full_name: data.clientName.trim() }).select("id").single()
    if (clientError || !client) throw clientError ?? new Error("Could not create the client.")
    const { data: property, error: propertyError } = await admin.from("properties").insert({ client_id: client.id, address_line1: data.serviceAddress.trim(), suburb: data.suburb.trim(), postcode: data.postcode.trim(), cleaning_instructions: data.instructions?.trim() || null }).select("id").single()
    if (propertyError || !property) throw propertyError ?? new Error("Could not create the property.")
    const { data: job, error: jobError } = await admin.from("jobs").insert({ title: data.title.trim(), property_id: property.id, cleaner_id: data.cleaner, scheduled_start: start.toISOString(), scheduled_end: end.toISOString(), estimated_earnings: Math.max(0, Number(data.estimatedEarnings)), instructions: data.instructions?.trim() || null }).select("id").single()
    if (jobError || !job) throw jobError ?? new Error("Could not create the job.")
    const { error: checklistError } = await admin.from("checklist_items").insert([{ job_id: job.id, task_name: "Kitchen surfaces and sink", sort_order: 1 }, { job_id: job.id, task_name: "Bathrooms and mirrors", sort_order: 2 }, { job_id: job.id, task_name: "Vacuum and mop floors", sort_order: 3 }, { job_id: job.id, task_name: "Final quality check", sort_order: 4 }])
    if (checklistError) throw checklistError
    return { ok: true }
  } catch (error) {
  console.error("CREATE JOB SERVER ERROR:", error)

  return {
    ok: false,
    error: error instanceof Error
      ? error.message
      : "Unknown server error",
  }
}
}
