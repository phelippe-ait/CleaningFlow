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


export async function updateJobAction(
  jobId: string,
  data: {
  title: string
  scheduledAt: string
  durationMinutes: number
  estimatedEarnings: number
  instructions: string
  serviceAddress: string
  suburb: string
  postcode: string
}
): Promise<ActionResult> {
  const user = await appAuth.currentUser()

  if (!user || user.role !== "manager") {
    return { ok: false, error: "Manager access required." }
  }

  const title = data.title.trim()
  const start = new Date(data.scheduledAt)
  const duration = Number(data.durationMinutes)
  const earnings = Number(data.estimatedEarnings)

  if (!jobId || !title) {
    return { ok: false, error: "Job title is required." }
  }

  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isInteger(duration) ||
    duration < 15 ||
    !Number.isFinite(earnings) ||
    earnings < 0
  ) {
    return { ok: false, error: "Invalid job details." }
  }

  const end = new Date(start.getTime() + duration * 60000)

const admin = createAdminClient()

const { data: existingJob, error: lookupError } = await admin
  .from("jobs")
  .select("property_id")
  .eq("id", jobId)
  .maybeSingle()

if (lookupError) {
  return { ok: false, error: lookupError.message }
}

if (!existingJob?.property_id) {
  return { ok: false, error: "Job property not found." }
}


  const { data: updatedJob, error } = await admin
    .from("jobs")
    .update({
      title,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      estimated_earnings: earnings,
      instructions: data.instructions.trim() || null,
    })
    .eq("id", jobId)
    .select("id")
    .maybeSingle()

  if (error) {
    return { ok: false, error: error.message }
  }

  if (!updatedJob) {
    return { ok: false, error: "Job not found." }
  }

  const address = data.serviceAddress.trim()
const suburb = data.suburb.trim()
const postcode = data.postcode.trim()

if (!address || !suburb || !/^\d{4}$/.test(postcode)) {
  return {
    ok: false,
    error: "Enter a valid address, suburb and 4-digit postcode.",
  }
}

const { error: propertyError } = await admin
  .from("properties")
  .update({
    address_line1: address,
    suburb,
    postcode,
  })
  .eq("id", existingJob.property_id)

if (propertyError) {
  return { ok: false, error: propertyError.message }
}

  return { ok: true }
}

export async function createClientAction(data: {
  fullName: string
  email?: string
  phone?: string
  notes?: string
  isActive: boolean
}): Promise<ActionResult> {
  const user = await appAuth.currentUser()

  if (!user || user.role !== "manager") {
    return { ok: false, error: "Manager access required." }
  }

  if (!data.fullName.trim()) {
    return { ok: false, error: "Client name is required." }
  }

  try {
    const admin = createAdminClient()

    const { error } = await admin.from("clients").insert({
      full_name: data.fullName.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      notes: data.notes?.trim() || null,
      is_active: data.isActive,
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    console.error("CREATE CLIENT ERROR:", error)

    return {
      ok: false,
      error: "Could not create the client.",
    }
  }
}

export async function updateClientAction(data: {
  id: string
  fullName: string
  email?: string
  phone?: string
  notes?: string
  isActive: boolean
}): Promise<ActionResult> {
  const user = await appAuth.currentUser()

  if (!user || user.role !== "manager") {
    return { ok: false, error: "Manager access required." }
  }

  if (!data.id || !data.fullName.trim()) {
    return { ok: false, error: "Client name is required." }
  }

  try {
    const admin = createAdminClient()

    const { error } = await admin
      .from("clients")
      .update({
        full_name: data.fullName.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        notes: data.notes?.trim() || null,
        is_active: data.isActive,
      })
      .eq("id", data.id)
      .select("id")
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    console.error("UPDATE CLIENT ERROR:", error)

    return {
      ok: false,
      error: "Could not update the client.",
    }
  }
}


export async function deleteClientAction(
  clientId: string
): Promise<ActionResult> {
  const user = await appAuth.currentUser()

  if (!user || user.role !== "manager") {
    return { ok: false, error: "Manager access required." }
  }

  if (!clientId) {
    return { ok: false, error: "Invalid client." }
  }

  try {
    const admin = createAdminClient()

    const { count, error: propertyError } = await admin
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)

    if (propertyError) {
      return { ok: false, error: propertyError.message }
    }

    if (count === null || count > 0) {
      return {
        ok: false,
        error: "Cannot delete a client with registered properties. Please deactivate the client instead.",
      }
    }

    const { error } = await admin
      .from("clients")
      .delete()
      .eq("id", clientId)
      .select("id")
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    console.error("DELETE CLIENT ERROR:", error)

    return {
      ok: false,
      error: "Could not delete the client.",
    }
  }
}

export async function deletePropertyAction(
  propertyId: string
): Promise<ActionResult> {
  const user = await appAuth.currentUser()

  if (!user || user.role !== "manager") {
    return { ok: false, error: "Manager access required." }
  }

  if (!propertyId) {
    return { ok: false, error: "Invalid property." }
  }

  try {
    const admin = createAdminClient()

    const { count, error: countError } = await admin
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId)

    if (countError || count === null) {
      return {
        ok: false,
        error: "Could not verify associated jobs.",
      }
    }

    if (count > 0) {
      return {
        ok: false,
        error:
          "This property has associated jobs and cannot be deleted. Deactivate it instead.",
      }
    }

    const { data: deletedProperty, error } = await admin
      .from("properties")
      .delete()
      .eq("id", propertyId)
      .select("id")
      .single()

    if (error || !deletedProperty) {
      return {
        ok: false,
        error: error?.message || "Property not found.",
      }
    }

    return { ok: true }

  } catch (error) {
    console.error("DELETE PROPERTY ERROR:", error)

    return {
      ok: false,
      error: "Could not delete the property.",
    }
  }
}

export async function updatePropertyAction(data: {
  propertyId: string
  propertyName?: string
  addressLine1: string
  addressLine2?: string
  suburb: string
  state: string
  postcode: string
  propertyType: string
  accessInstructions?: string
  cleaningInstructions?: string
  isActive: boolean
}): Promise<ActionResult> {
  const user = await appAuth.currentUser()

  if (!user || user.role !== "manager") {
    return { ok: false, error: "Manager access required." }
  }

  if (
    !data.propertyId ||
    !data.addressLine1.trim() ||
    !data.suburb.trim() ||
    !data.state.trim() ||
    !data.propertyType.trim() ||
    !/^\d{4}$/.test(data.postcode.trim())
  ) {
    return {
      ok: false,
      error: "Complete all required address fields.",
    }
  }

  try {
    const admin = createAdminClient()

    const { data: updatedProperty, error } = await admin
      .from("properties")
      .update({
        property_name: data.propertyName?.trim() || null,
        address_line1: data.addressLine1.trim(),
        address_line2: data.addressLine2?.trim() || null,
        suburb: data.suburb.trim(),
        state: data.state.trim(),
        postcode: data.postcode.trim(),
        property_type: data.propertyType.trim(),
        access_instructions:
          data.accessInstructions?.trim() || null,
        cleaning_instructions:
          data.cleaningInstructions?.trim() || null,
        is_active: data.isActive,
      })
      .eq("id", data.propertyId)
      .select("id")
      .single()

    if (error || !updatedProperty) {
      return {
        ok: false,
        error: error?.message || "Property not found.",
      }
    }

    return { ok: true }

  } catch (error) {
    console.error("UPDATE PROPERTY ERROR:", error)

    return {
      ok: false,
      error: "Could not update the property.",
    }
  }
}

export async function createPropertyAction(data: {
  clientId: string
  propertyName?: string
  addressLine1: string
  addressLine2?: string
  suburb: string
  state: string
  postcode: string
  propertyType: string
  accessInstructions?: string
  cleaningInstructions?: string
}): Promise<ActionResult> {
  const user = await appAuth.currentUser()

  if (!user || user.role !== "manager") {
    return { ok: false, error: "Manager access required." }
  }

  if (
    !data.clientId ||
    !data.addressLine1.trim() ||
    !data.suburb.trim() ||
    !data.state.trim() ||
    !data.propertyType.trim() ||
    !/^\d{4}$/.test(data.postcode.trim())
  ) {
    return {
      ok: false,
      error: "Complete all required address fields.",
    }
  }

  try {
    const admin = createAdminClient()

    const { error } = await admin
      .from("properties")
      .insert({
        client_id: data.clientId,
        property_name: data.propertyName?.trim() || null,
        address_line1: data.addressLine1.trim(),
        address_line2: data.addressLine2?.trim() || null,
        suburb: data.suburb.trim(),
        state: data.state.trim(),
        postcode: data.postcode.trim(),
        property_type: data.propertyType.trim(),
        access_instructions:
          data.accessInstructions?.trim() || null,
        cleaning_instructions:
          data.cleaningInstructions?.trim() || null,
        is_active: true,
      })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    console.error("CREATE PROPERTY ERROR:", error)

    return {
      ok: false,
      error: "Could not create the property.",
    }
  }
}

export async function createJobAction(data: {
  title: string
  clientId: string
  propertyId: string
  cleaner: string
  scheduledAt: string
  durationMinutes: number
  estimatedEarnings: number
  instructions?: string
  checklistTasks: string[]
}): Promise<ActionResult> {

  const user = await appAuth.currentUser()

  if (!user || user.role !== "manager") {
    return {
      ok: false,
      error: "Manager access required.",
    }
  }

  if (
    !data.title.trim() ||
    !data.clientId ||
    !data.propertyId ||
    !data.cleaner ||
    !data.scheduledAt
  ) {
    return {
      ok: false,
      error: "Complete all required fields.",
    }
  }

  const start = new Date(data.scheduledAt)

  if (
    Number.isNaN(start.getTime()) ||
    !Number.isFinite(data.durationMinutes) ||
    !Number.isFinite(data.estimatedEarnings)
  ) {
    return {
      ok: false,
      error: "Enter valid scheduling and earnings details.",
    }
  }

  const end = new Date(
    start.getTime() +
    Math.max(15, Number(data.durationMinutes)) * 60_000
  )

  if (!data.checklistTasks.some((task) => task.trim().length > 0)) {
    return {
      ok: false,
      error: "Add at least one checklist task.",
    }
  }

  try {
    const admin = createAdminClient()

    const { data: client, error: clientError } = await admin
      .from("clients")
      .select("id")
      .eq("id", data.clientId)
      .eq("is_active", true)
      .single()

    if (clientError || !client) {
      return {
        ok: false,
        error: "The selected client is unavailable or inactive.",
      }
    }

    const { data: property, error: propertyError } = await admin
      .from("properties")
      .select("id")
      .eq("id", data.propertyId)
      .eq("client_id", client.id)
      .eq("is_active", true)
      .single()

    if (propertyError || !property) {
      return {
        ok: false,
        error: "The selected property is unavailable, inactive or does not belong to this client.",
      }
    }
    const { data: job, error: jobError } = await admin.from("jobs").insert({ title: data.title.trim(), property_id: property.id, cleaner_id: data.cleaner, scheduled_start: start.toISOString(), scheduled_end: end.toISOString(), estimated_earnings: Math.max(0, Number(data.estimatedEarnings)), instructions: data.instructions?.trim() || null }).select("id").single()
    if (jobError || !job) throw jobError ?? new Error("Could not create the job.")
    const tasks = data.checklistTasks
  .map((task) => task.trim())
  .filter((task) => task.length > 0)

if (tasks.length === 0) {
  throw new Error("Add at least one checklist task.")
}

const { error: checklistError } = await admin
  .from("checklist_items")
  .insert(
    tasks.map((task, index) => ({
      job_id: job.id,
      task_name: task,
      sort_order: index + 1,
    }))
  )
    if (checklistError) throw checklistError
    return { ok: true }
  } catch (error) {
  console.error("CREATE JOB SERVER ERROR:", error)

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error
        ? String(error.message)
        : String(error)

  return {
    ok: false,
    error: message,
  }
}


}

export async function updateChecklistAction(
  checklistItemId: string,
  completed: boolean
): Promise<ActionResult> {
  const user = await appAuth.currentUser()

  if (!user) {
    return { ok: false, error: "Your session has expired." }
  }

  if (user.role !== "cleaner") {
    return { ok: false, error: "Cleaner access required." }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("job_checklist_progress")
    .upsert(
      {
        checklist_item_id: checklistItemId,
        completed_by: user.id,
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "checklist_item_id" }
    )

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
export async function toggleJobArchiveAction(
  jobId: string,
  archived: boolean
): Promise<ActionResult> {
  const user = await appAuth.currentUser()

  if (!user || user.role !== "cleaner") {
    return { ok: false, error: "Cleaner access required." }
  }

  const supabase = await createSupabaseServerClient()


  const { data: sessionData } = await supabase.auth.getSession()

console.log("Archive session:", {
  role: sessionData.session?.user.role,
  hasAccessToken: Boolean(sessionData.session?.access_token),
})


  const {
  data: { user: supabaseUser },
  error: authError,
} = await supabase.auth.getUser()

console.log("CleanFlow archive auth:", {
  appUserId: user.id,
  supabaseUserId: supabaseUser?.id ?? null,
  authError: authError?.message ?? null,
})

  const { error } = archived
    ? await supabase
        .from("archived_jobs")
.insert({
  cleaner_id: user.id,
  job_id: jobId,
})
    : await supabase
        .from("archived_jobs")
        .delete()
        .eq("cleaner_id", user.id)
        .eq("job_id", jobId)

  return error
    ? { ok: false, error: error.message }
    : { ok: true }
}
