import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { getPayload } from "payload"

dotenv.config()

async function main() {
  const name = process.env.LOCAL_MANAGER_NAME?.trim()
  const email = process.env.LOCAL_MANAGER_EMAIL?.trim().toLowerCase()
  const password = process.env.LOCAL_MANAGER_PASSWORD
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

  if (!name || !email || !password || !supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "Set LOCAL_MANAGER_NAME, LOCAL_MANAGER_EMAIL, LOCAL_MANAGER_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SECRET_KEY in .env first.",
    )
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { default: config } = await import("../src/payload.config")
  const payload = await getPayload({ config })
  let createdAuthUserId: string | undefined

  try {
    const { data: authList, error: authListError } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (authListError) throw authListError

    const authUser = authList.users.find(
      (user) => user.email?.toLowerCase() === email,
    )
    if (!authUser) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      })
      if (error || !data.user) {
        throw error ?? new Error("Supabase Auth did not return the new manager user.")
      }
      createdAuthUserId = data.user.id
    }

    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      console.log(`A local account for ${email} already exists; leaving it unchanged.`)
    } else {
      await payload.create({
        collection: "users",
        data: { name, email, password, role: "manager" },
        overrideAccess: true,
      })
      console.log(`Created local manager account: ${email}`)
    }
  } catch (error) {
    if (createdAuthUserId) {
      const { error: cleanupError } = await supabaseAdmin.auth.admin.deleteUser(
        createdAuthUserId,
      )
      if (cleanupError) {
        throw new Error(
          "Manager provisioning failed and the new Supabase Auth account could not be rolled back.",
          { cause: error },
        )
      }
    }
    throw error
  } finally {
    await payload.destroy()
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
