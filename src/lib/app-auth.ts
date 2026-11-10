import "server-only"

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"

export type AppUser = {
  id: string
  name: string
  email: string
  role: "manager" | "cleaner"
}

export async function currentUser(): Promise<AppUser | null> {
  const supabase = await createSupabaseServerClient()
  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError || !auth.user?.email) return null

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", auth.user.id)
    .maybeSingle()

  if (profileError || !profile || !["manager", "cleaner"].includes(profile.role)) return null
  return { id: profile.id, name: profile.full_name, email: auth.user.email, role: profile.role as AppUser["role"] }
}

export async function login(email: string, password: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
  if (error || !data.user) throw new Error("Email or password is incorrect.")
  const user = await currentUser()
  if (!user) {
    await supabase.auth.signOut()
    throw new Error("No CleanFlow profile is provisioned for this account.")
  }
  return user
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const appAuth = { currentUser, login, logout }
