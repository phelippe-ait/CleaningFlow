"use client"

import {
  useMemo,
  useState,
  useTransition,
  useEffect,
  type FormEvent,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  createCleanerAction,
  updateCleanerAction,
  createJobAction,
  createClientAction,
  updateClientAction,
  deleteClientAction,
  createPropertyAction,
  updatePropertyAction,
  deletePropertyAction,
  loginAction,
  logoutAction,
  updateJobStatusAction,
  updateJobAction,
  updateChecklistAction,
  toggleJobArchiveAction,
  
} from "./actions"

type Cleaner = {
  id: string
  name: string
  email: string
  phone?: string | null
  isActive?: boolean
  createdAt?: string
  notes?: string | null
}
type Job = {
  id: string
  archived: boolean
  title: string
  clientName: string
  serviceAddress: string
  suburb?: string
postcode?: string
  cleaner: Cleaner | string
  scheduledAt: string
actualStart: string | null
actualEnd: string | null
durationMinutes: number
  estimatedEarnings: number
  status: "scheduled" | "accepted" | "in-progress" | "completed"
  instructions?: string | null
  checklist?: {
    id?: string | null
    task: string
    completed?: boolean | null
  }[] | null
}

type Property = {
  id: string
  property_name: string | null
  address_line1: string
  address_line2: string | null
  suburb: string
  state: string
  postcode: string
  property_type: string
  access_instructions: string | null
  cleaning_instructions: string | null
  is_active: boolean
}

type Client = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  properties: Property[]
}


type DashboardProps = {
  user: {
    id: string
    name: string
    email: string
    role: "manager" | "cleaner"
  }
  jobs: Job[]
  cleaners: Cleaner[]
  clients: Client[]
  clientCount: number
  propertyCount: number
}

type IconName = "grid" | "calendar" | "users" | "team" | "settings" | "search" | "bell" | "plus" | "clock" | "pin" | "money" | "check" | "arrow" | "briefcase" | "sparkle" | "menu" | "close" | "logout"

function Icon({
  name,
  className = "size-5",
}: {
  name: IconName
  className?: string
}) {
  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    team: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.1A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.39.28.7.65.6 1.1v3.5h-.1A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    money: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <circle cx="12" cy="12" r="3" />
        <path d="M7 9H6v1M17 15h1v-1" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="3" />
        <path d="M9 7V5h6v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
        <path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      </>
    ),
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  )
}

function Logo({
  compact = false,
  onClick,
}: {
  compact?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.()
        window.scrollTo({ top: 0, behavior: "smooth" })
      }}
      aria-label="CleaningFlow - Home"
      className="flex cursor-pointer items-center gap-3 text-left transition hover:opacity-80"
    >
      <span className="grid size-10 place-items-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-900/10">
        <Icon name="sparkle" className="size-6" />
      </span>

      {!compact && (
        <span className="text-xl font-bold tracking-tight text-slate-900">
          CleaningFlow
        </span>
      )}
    </button>
  )
}

export function AuthScreen() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError("")
    startTransition(async () => {
      const result = await loginAction(
        String(form.get("email")),
        String(form.get("password")),
      )
      if (!result.ok) return setError(result.error)
      router.refresh()
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 sm:p-12">
      <section className="w-full max-w-md">
        <div className="mb-12 flex justify-center">
          <Logo />
        </div>
        <p className="text-center text-sm font-semibold uppercase tracking-[.2em] text-teal-600">
          Welcome back
        </p>
        <h2 className="mt-3 text-center text-4xl font-semibold tracking-tight text-slate-950">
          Sign in to CleanFlow
        </h2>
        <p className="mt-3 text-center text-slate-500">
          Enter your account details to continue.
        </p>

        <form className="mt-9 space-y-5" onSubmit={submit}>
          <Field
            label="Email address"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {error && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}
          <button
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
            {!pending && <Icon name="arrow" className="size-4" />}
          </button>
        </form>
        <p className="mt-7 text-center text-sm leading-6 text-slate-500">
          Need access? Contact your CleanFlow manager.
        </p>
      </section>
    </main>
  )
}

function Field({
  label,
  ...props
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: "numeric"
  pattern?: string
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        required
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
        {...props}
      />
    </label>
  )
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value))
const money = (value: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value)

export function Dashboard({
  user,
  jobs,
  cleaners,
  clients,
  clientCount,
  propertyCount,
}: DashboardProps) {
  const router = useRouter()
  const [tab, setTab] = useState("Overview")
  const [query, setQuery] = useState("")

  const [editingCleaner, setEditingCleaner] =
  useState<Cleaner | null>(null)

const [editCleanerError, setEditCleanerError] =
  useState("")
  const [cleanerSearch, setCleanerSearch] = useState("")

const [cleanerFilter, setCleanerFilter] = useState<
  "all" | "active" | "inactive"
>("all")

const [selectedCleanerId, setSelectedCleanerId] = useState<
  string | null
>(null)
  const [clientSearch, setClientSearch] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null)
  const [newClient, setNewClient] = useState(false)
const [clientError, setClientError] = useState("")
const [editingClient, setEditingClient] = useState<
  DashboardProps["clients"][number] | null
>(null)

const [deletingClient, setDeletingClient] = useState<
  DashboardProps["clients"][number] | null
>(null)

const [deleteClientError, setDeleteClientError] = useState("")
const [propertyClient, setPropertyClient] = useState<
  DashboardProps["clients"][number] | null
>(null)

const [propertyError, setPropertyError] = useState("")
const [editingProperty, setEditingProperty] = useState<
  DashboardProps["clients"][number]["properties"][number] | null
>(null)

const [deletingProperty, setDeletingProperty] = useState<
  DashboardProps["clients"][number]["properties"][number] | null
>(null)

const [deletePropertyError, setDeletePropertyError] = useState("")
const [clientFilter, setClientFilter] = useState<
  "all" | "active" | "inactive"
>("all")
  const [mobileNav, setMobileNav] = useState(false)
  const [newJob, setNewJob] = useState(false)
  const [newCleaner, setNewCleaner] = useState(false)
  const [cleanerError, setCleanerError] = useState("")
  const [selected, setSelected] = useState<Job | null>(null)
  const [notice, setNotice] = useState("")
  const [pending, startTransition] = useTransition()
  const [scheduleView, setScheduleView] = useState<"list" | "calendar">("list")
  const [earningsPeriod, setEarningsPeriod] = useState<
  "all" | "week" | "month" | "custom"
>("all")

const [earningsCleaner, setEarningsCleaner] = useState("all")

const [earningsFrom, setEarningsFrom] = useState("")
const [earningsTo, setEarningsTo] = useState("")
  const [scheduleFilter, setScheduleFilter] = useState<
  "all" | "active" | "completed"
>("all")
  const manager = user.role === "manager"
const selectedClient = clients.find(
  (client) => client.id === selectedClientId
) ?? null

const selectedCleaner = cleaners.find(
  (cleaner) => cleaner.id === selectedCleanerId
) ?? null

const selectedCleanerJobs = jobs.filter(
  (job) =>
    typeof job.cleaner !== "string" &&
    job.cleaner.id === selectedCleanerId
)

const selectedCleanerCompletedJobs =
  selectedCleanerJobs.filter(
    (job) => job.status === "completed"
  )

const selectedCleanerWorkedMinutes =
  selectedCleanerCompletedJobs.reduce((total, job) => {
    if (!job.actualStart || !job.actualEnd) {
      return total
    }

    const start = new Date(job.actualStart).getTime()
    const end = new Date(job.actualEnd).getTime()

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return total
    }

    return total + Math.max(0, (end - start) / 60000)
  }, 0)

const selectedCleanerHours = Math.floor(
  selectedCleanerWorkedMinutes / 60
)

const selectedCleanerMinutes = Math.floor(
  selectedCleanerWorkedMinutes % 60
)

const selectedCleanerEarnings =
  selectedCleanerCompletedJobs.reduce(
    (total, job) => total + job.estimatedEarnings,
    0
  )

const activeCleanerCount = cleaners.filter(
  (cleaner) => cleaner.isActive === true
).length

const filteredCleaners = cleaners.filter((cleaner) => {
  const search = cleanerSearch.trim().toLowerCase()

  const matchesSearch =
    cleaner.name.toLowerCase().includes(search) ||
    cleaner.email.toLowerCase().includes(search) ||
    (cleaner.phone ?? "").toLowerCase().includes(search)

  const matchesStatus =
    cleanerFilter === "all" ||
    (cleanerFilter === "active" && cleaner.isActive === true) ||
    (cleanerFilter === "inactive" && cleaner.isActive === false)

  return matchesSearch && matchesStatus
})
  const filteredClients = clients.filter((client) => {
  const search = clientSearch.trim().toLowerCase()

  const searchableText = [
    client.full_name,
    client.email,
    client.phone,
    ...client.properties.map((property) =>
      [
        property.address_line1,
        property.address_line2,
        property.suburb,
        property.state,
        property.postcode,
      ].filter(Boolean).join(" ")
    ),
  ].filter(Boolean).join(" ").toLowerCase()

  const matchesSearch = searchableText.includes(search)

  const matchesStatus =
    clientFilter === "all" ||
    (clientFilter === "active" && client.is_active) ||
    (clientFilter === "inactive" && !client.is_active)

  return matchesSearch && matchesStatus
})

  const filtered = useMemo(
    () =>
      jobs.filter((job) =>
        (manager || !job.archived) &&
        `${job.title} ${job.clientName} ${job.serviceAddress}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [jobs, query],
  )

  const scheduleJobs = filtered.filter((job) => {
  if (scheduleFilter === "completed") {
    return job.status === "completed"
  }

  if (scheduleFilter === "active") {
    return job.status !== "completed"
  }

  return true
})

  const upcoming = filtered.filter((job) => job.status !== "completed")
  const completed = jobs.filter(
  (job) =>
    job.status === "completed" &&
    (manager || !job.archived)
)

const archived = jobs.filter(
  (job) =>
    !manager &&
    job.status === "completed" &&
    job.archived
)
  const earnings = jobs.reduce(
    (sum, job) =>
      sum + (job.status === "completed" ? job.estimatedEarnings : 0),
    0,
  )

  const now = new Date()

const weekStart = new Date(now)
weekStart.setHours(0, 0, 0, 0)
weekStart.setDate(
  now.getDate() - ((now.getDay() + 6) % 7)
)

const weekEnd = new Date(weekStart)
weekEnd.setDate(weekStart.getDate() + 7)

const monthStart = new Date(
  now.getFullYear(),
  now.getMonth(),
  1
)

const monthEnd = new Date(
  now.getFullYear(),
  now.getMonth() + 1,
  1
)

const weeklyEarnings = completed
  .filter((job) => {
    const date = new Date(job.actualEnd ?? job.scheduledAt)
    return date >= weekStart && date < weekEnd
  })
  .reduce((sum, job) => sum + job.estimatedEarnings, 0)

const monthlyEarnings = completed
  .filter((job) => {
    const date = new Date(job.actualEnd ?? job.scheduledAt)
    return date >= monthStart && date < monthEnd
  })
  .reduce((sum, job) => sum + job.estimatedEarnings, 0)

const filteredEarningsJobs = completed.filter((job) => {
  const date = new Date(job.actualEnd ?? job.scheduledAt)

  if (earningsCleaner !== "all") {
    if (
      typeof job.cleaner === "string" ||
      job.cleaner.id !== earningsCleaner
    ) {
      return false
    }
  }

  if (earningsPeriod === "week") {
    return date >= weekStart && date < weekEnd
  }

  if (earningsPeriod === "month") {
    return date >= monthStart && date < monthEnd
  }

  if (earningsPeriod === "custom") {
    const from = earningsFrom
      ? new Date(`${earningsFrom}T00:00:00`)
      : null

    const to = earningsTo
      ? new Date(`${earningsTo}T23:59:59.999`)
      : null

    if (from && date < from) return false
    if (to && date > to) return false
  }

  return true
})

const filteredEarnings = filteredEarningsJobs.reduce(
  (sum, job) => sum + job.estimatedEarnings,
  0
)


  function changeStatus(job: Job, status: Job["status"]) {
    startTransition(async () => {
      const result = await updateJobStatusAction(job.id, status)
      if (!result.ok) setNotice(result.error)
      else {
        setSelected(null)
        setNotice("Job status updated.")
        router.refresh()
      }
    })
  }


  function restoreJob(jobId: string) {
  startTransition(async () => {
    const result = await toggleJobArchiveAction(jobId, false)

    if (!result.ok) {
      setNotice(result.error)
    } else {
      setSelected(null)
      setNotice("Job restored successfully.")
      router.refresh()
    }
  })
}

  function toggleChecklist(
  checklistItemId: string,
  completed: boolean
) {
  startTransition(async () => {
    const result = await updateChecklistAction(
      checklistItemId,
      completed
    )

    if (!result.ok) {
      setNotice(result.error)
    } else {
      setSelected((current) => {
        if (!current) return null

        return {
          ...current,
          checklist: current.checklist?.map((item) =>
            item.id === checklistItemId
              ? { ...item, completed }
              : item
          ),
        }
      })

      setNotice("Checklist updated.")
      router.refresh()
    }
  })
}

  function signOut() {
    startTransition(async () => {
      await logoutAction()
      router.refresh()
    })
  }

  const nav = [
  ["Overview", "grid"],
  ["Schedule", "calendar"],
  ...(manager
    ? [
        ["Earnings", "money"],
        ["Clients", "users"],
        ["Cleaners", "team"],
      ]
    : []),
] as [string, IconName][]

  if (!manager) {
    return (
      <CleanerWorkspace
        user={user}
        jobs={jobs}
        notice={notice}
        pending={pending}
        selected={selected}
        setNotice={setNotice}
        setSelected={setSelected}
        changeStatus={changeStatus}
        signOut={signOut}
        toggleChecklist={toggleChecklist}
        restoreJob={restoreJob}
      />
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f8f8] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white p-6 transition-transform lg:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
         <Logo
  onClick={() => {
    setTab("Overview")
    setMobileNav(false)
  }}
/>
          <button className="lg:hidden" onClick={() => setMobileNav(false)}>
            <Icon name="close" />
          </button>
        </div>
        <nav className="mt-12 space-y-2">
          {nav.map(([label, icon]) => (
            <button
              key={label}
              onClick={() => {
                setTab(label)
                setMobileNav(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                tab === label
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon name={icon} className="size-5" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-slate-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-400 font-bold text-slate-950">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="capitalize text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            <Icon name="logout" className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur md:px-9">
          <button className="lg:hidden" onClick={() => setMobileNav(true)}>
            <Icon name="menu" />
          </button>
          <div className="relative ml-4 hidden max-w-md flex-1 md:block lg:ml-0">
            <Icon
              name="search"
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jobs, clients or addresses"
              className="w-full rounded-xl bg-slate-100 py-2.5 pl-11 pr-4 text-sm outline-none ring-teal-500/20 focus:ring-4"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500">
              <Icon name="bell" className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-teal-500 ring-2 ring-white" />
            </button>
            {manager && (
              <button
                onClick={() =>
                  tab === "Cleaners"
                    ? (setCleanerError(""), setNewCleaner(true))
                    : setNewJob(true)
                }
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                <Icon name="plus" className="size-4" />
                <span className="hidden sm:inline">
                  {tab === "Cleaners" ? "Add cleaner" : "New job"}
                </span>
              </button>
            )}
          </div>
        </header>

        <section className="mx-auto max-w-[1500px] p-5 md:p-9">
          {notice && (
            <button
              onClick={() => setNotice("")}
              className="mb-5 w-full rounded-xl bg-teal-50 px-4 py-3 text-left text-sm font-medium text-teal-800"
            >
              {notice}
            </button>
          )}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-teal-600">
                {new Intl.DateTimeFormat("en-AU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(new Date())}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                {tab === "Overview"
                  ? `Good ${
                      new Date().getHours() < 12 ? "morning" : "afternoon"
                    }, ${user.name.split(" ")[0]}`
                  : tab}
              </h1>
              <p className="mt-2 text-slate-500">
                {tab === "Overview"
                  ? manager
                    ? "Here’s how your operation is moving today."
                    : "Everything you need for a smooth day."
                  : `Manage your ${tab.toLowerCase()} in one place.`}
              </p>
            </div>
            {tab === "Schedule" && (
  <div className="flex rounded-xl border border-slate-200 bg-white p-1">
    <button
      type="button"
      onClick={() => setScheduleView("list")}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        scheduleView === "list"
          ? "bg-slate-950 text-white"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      List
    </button>

    <button
      type="button"
      onClick={() => setScheduleView("calendar")}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        scheduleView === "calendar"
          ? "bg-slate-950 text-white"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      Calendar
    </button>
  </div>
)}
          </div>

          {tab === "Overview" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <button
  type="button"
  className="w-full rounded-2xl text-left transition hover:ring-2 hover:ring-teal-300"
  onClick={() => {
    setTab("Schedule")
    setScheduleView("list")
    setScheduleFilter("active")
  }}
>
  <Metric
    icon="briefcase"
    label={manager ? "Active jobs" : "Upcoming jobs"}
    value={upcoming.length}
    detail={
      upcoming.length
        ? `${upcoming.filter((j) => j.status === "in-progress").length} in progress`
        : "Ready for new work"
    }
    accent="teal"
  />
</button>
                <button
  type="button"
  onClick={() => {
    setScheduleFilter("completed")
    setScheduleView("list")
    setTab("Schedule")
  }}
  className="w-full rounded-2xl text-left transition hover:ring-2 hover:ring-teal-300"
>
  <Metric
    icon="check"
    label="Completed"
    value={completed.length}
    detail="View completed jobs"
    accent="blue"
  />
</button>
                <button
  type="button"
  onClick={() => setTab("Earnings")}
  className="w-full rounded-2xl text-left transition hover:ring-2 hover:ring-teal-300"
>
  <Metric
    icon="money"
    label="Earnings"
    value={money(earnings)}
    detail="View earnings history"
    accent="amber"
  />
</button>
                <button
  type="button"
  onClick={() => setTab("Clients")}
  className="w-full rounded-2xl text-left transition hover:ring-2 hover:ring-teal-300"
>
  <Metric
    icon={manager ? "users" : "clock"}
    label={manager ? "Clients & properties" : "Scheduled hours"}
    value={
      manager
        ? clientCount + propertyCount
        : Math.round(
            jobs.reduce((s, j) => s + j.durationMinutes, 0) / 60,
          )
    }
    detail={
      manager
        ? `${clientCount} clients · ${propertyCount} properties`
        : "Across assigned jobs"
    }
    accent="violet"
  />
</button>
              </div>

              
              <div className="mt-7 grid gap-7 xl:grid-cols-[1.5fr_.7fr]">
                <JobList
                  title="Next up"
                  jobs={upcoming.slice(0, 5)}
                  onSelect={setSelected}
                />
                <div className="space-y-7">
                  <div className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Today’s flow</p>
                        <p className="mt-2 text-2xl font-semibold">
                          {upcoming.length ? "On track" : "All clear"}
                        </p>
                      </div>
                      <span className="grid size-11 place-items-center rounded-2xl bg-teal-400/15 text-teal-300">
                        <Icon name="sparkle" />
                      </span>
                    </div>
                    <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-teal-400"
                        style={{
                          width: `${
                            jobs.length
                              ? Math.max(
                                  8,
                                  (completed.length / jobs.length) * 100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between text-xs text-slate-400">
                      <span>{completed.length} completed</span>
                      <span>{jobs.length} total</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="font-semibold">Quick actions</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <QuickAction
                        icon="calendar"
                        label="Schedule"
                        action={() => setTab("Schedule")}
                      />
                      <QuickAction
                        icon={manager ? "plus" : "pin"}
                        label={manager ? "Add job" : "Directions"}
                        action={() =>
                          manager
                            ? setNewJob(true)
                            : upcoming[0] &&
                              window.open(
                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(upcoming[0].serviceAddress)}`,
                                "_blank",
                              )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "Schedule" && (
  <div className="space-y-5">
    <div className="flex flex-wrap gap-2">
      {(["all", "active", "completed"] as const).map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => setScheduleFilter(filter)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            scheduleFilter === filter
              ? "bg-teal-600 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {filter === "all"
            ? "All jobs"
            : filter === "active"
              ? "Active jobs"
              : "Completed jobs"}
        </button>
      ))}
    </div>

    {scheduleView === "list" ? (
      <JobList
        title={`${scheduleJobs.length} jobs`}
        jobs={scheduleJobs}
        onSelect={setSelected}
      />
    ) : (
      <JobCalendar
        jobs={scheduleJobs}
        onSelect={setSelected}
      />
    )}
  </div>
)}

  {tab === "Earnings" && manager && (
  <div className="space-y-6">

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric
        icon="money"
        label="Total earnings"
        value={money(earnings)}
        detail="All-time completed job value"
        accent="teal"
      />

      <Metric
        icon="check"
        label="Completed jobs"
        value={completed.length}
        detail="Successfully completed services"
        accent="blue"
      />

      <Metric
        icon="calendar"
        label="This week"
        value={money(weeklyEarnings)}
        detail="Monday – Sunday"
        accent="amber"
      />

      <Metric
        icon="money"
        label="This month"
        value={money(monthlyEarnings)}
        detail="Current calendar month"
        accent="violet"
      />
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Filter earnings
        </h2>

        <button
          type="button"
          onClick={() => {
            setEarningsPeriod("all")
            setEarningsCleaner("all")
            setEarningsFrom("")
            setEarningsTo("")
          }}
          className="text-sm font-semibold text-teal-600 hover:text-teal-800"
        >
          Reset filters
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Period
          </label>

          <select
            value={earningsPeriod}
            onChange={(event) =>
              setEarningsPeriod(
                event.target.value as
                  | "all"
                  | "week"
                  | "month"
                  | "custom"
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          >
            <option value="all">All time</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="custom">Custom dates</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Cleaner
          </label>

          <select
            value={earningsCleaner}
            onChange={(event) =>
              setEarningsCleaner(event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          >
            <option value="all">All cleaners</option>

            {cleaners.map((cleaner) => (
              <option key={cleaner.id} value={cleaner.id}>
                {cleaner.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {earningsPeriod === "custom" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              From
            </label>

            <input
              type="date"
              value={earningsFrom}
              max={earningsTo || undefined}
              onChange={(event) =>
                setEarningsFrom(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              To
            </label>

            <input
              type="date"
              value={earningsTo}
              min={earningsFrom || undefined}
              onChange={(event) =>
                setEarningsTo(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl bg-teal-50 p-5">
        <p className="text-sm font-medium text-teal-700">
          Filtered earnings
        </p>

        <p className="mt-1 text-3xl font-bold text-teal-900">
          {money(filteredEarnings)}
        </p>

        <p className="mt-2 text-sm text-teal-700">
          {filteredEarningsJobs.length} completed jobs
        </p>
      </div>
    </div>

    <JobList
      title="Earnings history"
      jobs={filteredEarningsJobs}
      onSelect={setSelected}
    />

  </div>
)}

{selectedClient && manager && tab === "Clients" && (
  <div className="fixed inset-0 z-40 flex justify-end">

    <div
      className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      onClick={() => setSelectedClientId(null)}
    />

    <aside className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">

      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Client details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage client information and properties.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedClientId(null)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">

        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-50 text-2xl font-bold text-teal-700">
            {selectedClient.full_name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {selectedClient.full_name}
            </h3>

            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              selectedClient.is_active
                ? "bg-teal-50 text-teal-700"
                : "bg-slate-100 text-slate-500"
            }`}>
              {selectedClient.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="mb-4 font-semibold text-slate-900">
            Contact information
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Email address
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {selectedClient.email || "Not registered"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Phone number
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {selectedClient.phone || "Not registered"}
              </p>
            </div>
          </div>
        </div>

            <div className="rounded-2xl border border-slate-200 p-5">

  <div className="mb-4 flex items-center justify-between gap-3">
    <h3 className="font-semibold text-slate-900">
      Properties ({selectedClient.properties.length})
    </h3>

    <button
      type="button"
      onClick={() => {
  setEditingProperty(null)
  setPropertyError("")
  setPropertyClient(selectedClient)
}}
      className="flex items-center gap-1.5 rounded-lg border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
    >
      <Icon name="plus" className="size-4" />
      Add property
    </button>
  </div>

  {selectedClient.properties.length === 0 ? (
    <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
      No properties registered yet.
    </div>
  ) : (
    <div className="space-y-3">

      {selectedClient.properties.map((property) => (
        <div
          key={property.id}
          className="overflow-hidden rounded-xl border border-slate-200"
        >

          <button
            type="button"
            aria-expanded={expandedPropertyId === property.id}
            onClick={() =>
              setExpandedPropertyId(
                expandedPropertyId === property.id
                  ? null
                  : property.id
              )
            }
            className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50"
          >

            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Icon name="pin" className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {property.property_name || "Property"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {property.address_line1}, {property.suburb}
              </p>
            </div>

            <span className="text-lg text-slate-400">
              {expandedPropertyId === property.id ? "−" : "+"}
            </span>

          </button>

          {expandedPropertyId === property.id && (
            <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-4">

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600">
                  {property.property_type}
                </span>

                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  property.is_active
                    ? "bg-teal-100 text-teal-700"
                    : "bg-slate-200 text-slate-500"
                }`}>
                  {property.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Full address
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {[
                    property.address_line1,
                    property.address_line2,
                    property.suburb,
                    property.state,
                    property.postcode,
                  ].filter(Boolean).join(", ")}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Access instructions
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {property.access_instructions || "No instructions provided."}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Cleaning instructions
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {property.cleaning_instructions || "No instructions provided."}
                </p>
              </div>

              <div className="flex justify-between gap-2 border-t border-slate-200 pt-4">

  <button
    type="button"
    onClick={() => {
      setDeletePropertyError("")
      setDeletingProperty(property)
    }}
    className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:border-red-500 hover:bg-red-50"
  >
    Delete property
  </button>

  <button
    type="button"
    onClick={() => {
      setEditingProperty(property)
      setPropertyError("")
      setPropertyClient(selectedClient)
    }}
    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-700"
  >
    Edit property
  </button>

</div>

            </div>
          )}

        </div>
      ))}

    </div>
  )}

</div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="mb-3 font-semibold text-slate-900">
            Client notes
          </h3>

          <p className="whitespace-pre-wrap text-sm text-slate-600">
            {selectedClient.notes || "No additional notes."}
          </p>
        </div>

      </div>
<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white p-6">

  <button
    type="button"
    onClick={() => {
      setDeleteClientError("")
      setDeletingClient(selectedClient)
    }}
    className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-500"
  >
    Delete client
  </button>

  <button
    type="button"
    onClick={() => {
      setEditingClient(selectedClient)
      setClientError("")
      setNewClient(true)
    }}
    className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
  >
    Edit client
  </button>

</div>
    </aside>
  </div>
)}

{propertyClient && manager && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">

      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {editingProperty ? "Edit property" : "Add property"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {editingProperty
  ? "Update the information for this property."
  : "Register a new property for this client."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPropertyClient(null)}
          disabled={pending}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>

      <form
        className="space-y-5 p-6"
        onSubmit={(event) => {
          event.preventDefault()
          setPropertyError("")

          const form = new FormData(event.currentTarget)

          const propertyData = {
            clientId: propertyClient.id,
            propertyName: String(form.get("propertyName") || ""),
            addressLine1: String(form.get("addressLine1") || ""),
            addressLine2: String(form.get("addressLine2") || ""),
            suburb: String(form.get("suburb") || ""),
            state: String(form.get("state") || ""),
            postcode: String(form.get("postcode") || ""),
            propertyType: String(form.get("propertyType") || ""),
            accessInstructions: String(form.get("accessInstructions") || ""),
            cleaningInstructions: String(form.get("cleaningInstructions") || ""),
            isActive: form.has("isActive"),
          }

          startTransition(async () => {
            try {
              const result = editingProperty
  ? await updatePropertyAction({
      ...propertyData,
      propertyId: editingProperty.id,
    })
  : await createPropertyAction(propertyData)

              if (!result.ok) {
                setPropertyError(
                  result.error || "Could not create property."
                )
                return
              }

              setPropertyClient(null)
setEditingProperty(null)
router.refresh()
            } catch {
              setPropertyError("An unexpected error occurred.")
            }
          })
        }}
      >

        <div className="rounded-xl bg-teal-50 p-4">
          <p className="text-xs font-medium text-teal-600">
            Selected client
          </p>
          <p className="mt-1 font-semibold text-teal-800">
            {propertyClient.full_name}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Property name
          </label>
          <input
            name="propertyName"
            placeholder="Main house, Office, Apartment..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
            defaultValue={editingProperty?.property_name ?? ""}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Address line 1 *
          </label>
          <input
            name="addressLine1"
            required
            placeholder="Street address"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
            defaultValue={editingProperty?.address_line1 ?? ""}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Address line 2
          </label>
          <input
            name="addressLine2"
            placeholder="Unit, apartment, suite..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
            defaultValue={editingProperty?.address_line2 ?? ""}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Suburb *
          </label>
          <input
            name="suburb"
            required
            placeholder="Ryde"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
            defaultValue={editingProperty?.suburb ?? ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              State *
            </label>
            <select
              name="state"
              
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
              defaultValue={editingProperty?.state ?? "NSW"}
            >
              {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Postcode *
            </label>
            <input
              name="postcode"
              required
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              placeholder="2112"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
              	defaultValue={editingProperty?.postcode ?? ""}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Property type
          </label>
          <select
            name="propertyType"
          
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
            	defaultValue={editingProperty?.property_type ?? "house"}
          >
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="townhouse">Townhouse</option>
            <option value="office">Office</option>
            <option value="commercial">Commercial</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Access instructions
          </label>
          <textarea
            name="accessInstructions"
            rows={3}
            defaultValue={editingProperty?.access_instructions ?? ""}
            placeholder="Keys, parking, access instructions..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Cleaning instructions
          </label>
          <textarea
            name="cleaningInstructions"
            rows={3}
            	defaultValue={editingProperty?.cleaning_instructions ?? ""}
            placeholder="Specific cleaning requirements..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
          />
        </div>


{editingProperty && (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

    <div>
      <p className="text-sm font-semibold text-slate-900">
        Active property
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Deactivate this property without deleting its history.
      </p>
    </div>

    <input
      type="checkbox"
      name="isActive"
      defaultChecked={editingProperty.is_active}
      className="size-5 shrink-0 cursor-pointer accent-teal-600"
    />

  </label>
)}
        {propertyError && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {propertyError}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
  setPropertyClient(null)
  setEditingProperty(null)
}}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {pending
  ? "Saving..."
  : editingProperty
    ? "Save changes"
    : "Add property"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}


{deletingProperty && manager && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          Delete property
        </h2>

        <button
          type="button"
          disabled={pending}
          onClick={() => setDeletingProperty(null)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>

      <p className="text-sm text-slate-600">
        Are you sure you want to delete this property?
      </p>

      <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">
          {deletingProperty.property_name || "Property"}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {deletingProperty.address_line1},{" "}
          {deletingProperty.suburb}
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        This action cannot be undone. Properties with associated
        jobs cannot be deleted and should be deactivated instead.
      </div>

      {deletePropertyError && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {deletePropertyError}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">

        <button
          type="button"
          disabled={pending}
          onClick={() => setDeletingProperty(null)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setDeletePropertyError("")

            startTransition(async () => {
              try {
                const result = await deletePropertyAction(
                  deletingProperty.id
                )

                if (!result.ok) {
                  setDeletePropertyError(
                    result.error || "Could not delete property."
                  )
                  return
                }

                setDeletingProperty(null)
                setExpandedPropertyId(null)
                router.refresh()

              } catch {
                setDeletePropertyError(
                  "An unexpected error occurred."
                )
              }
            })
          }}
          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "Deleting..." : "Delete property"}
        </button>

      </div>

    </div>
  </div>
)}

{deletingClient && manager && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
        <span className="text-2xl font-bold text-red-600">!</span>
      </div>

      <h2 className="text-xl font-bold text-slate-900">
        Delete client?
      </h2>

      <p className="mt-3 text-sm text-slate-600">
        Are you sure you want to delete{" "}
        <strong>{deletingClient.full_name}</strong>?
      </p>

      <p className="mt-2 text-sm text-slate-500">
        This action is permanent and cannot be undone.
      </p>

      {deletingClient.properties.length > 0 && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          This client has registered properties and cannot
          be deleted. Please deactivate the client instead.
        </div>
      )}

      {deleteClientError && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {deleteClientError}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">

        <button
          type="button"
          onClick={() => setDeletingClient(null)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
  type="button"
  disabled={deletingClient.properties.length > 0 || pending}
  onClick={() => {
    setDeleteClientError("")

    startTransition(async () => {
      try {
        const result = await deleteClientAction(deletingClient.id)

        if (!result.ok) {
          setDeleteClientError(
            result.error || "Could not delete client."
          )
          return
        }

        setDeletingClient(null)
        router.refresh()
      } catch {
        setDeleteClientError("An unexpected error occurred.")
      }
    })
  }}
  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
>
  {pending ? "Deleting..." : "Delete client"}
</button>

      </div>
    </div>
  </div>
)}

{newClient && manager && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">

      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
  {editingClient ? "Edit client" : "Add client"}
</h2>
          <p className="mt-1 text-sm text-slate-500">
            {editingClient
  ? "Update client information."
  : "Create a new client profile."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewClient(false)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>

      <form
        className="space-y-5 p-6"
        onSubmit={async (event) => {
          event.preventDefault()
          setClientError("")

          const form = new FormData(event.currentTarget)

          try {
            const clientData = {
  fullName: String(form.get("fullName") || ""),
  email: String(form.get("email") || ""),
  phone: String(form.get("phone") || ""),
  notes: String(form.get("notes") || ""),
  isActive: form.get("status") === "active",
}

const result = editingClient
  ? await updateClientAction({
      id: editingClient.id,
      ...clientData,
    })
  : await createClientAction(clientData)

            if (!result.ok) {
              setClientError(result.error || "Could not create client.")
              return
            }

            setNewClient(false)
setEditingClient(null)
router.refresh()
          } catch {
            setClientError("An unexpected error occurred.")
          }
        }}
      >

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Full name *
          </label>
          <input
  name="fullName"
  defaultValue={editingClient?.full_name ?? ""}
  required
  placeholder="Enter client's full name"
  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
/>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Email address
          </label>
          <input
  name="email"
  defaultValue={editingClient?.email ?? ""}
  type="email"
  placeholder="client@example.com"
  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
/>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Phone number
          </label>
          <input
  name="phone"
  defaultValue={editingClient?.phone ?? ""}
  type="tel"
  placeholder="04XX XXX XXX"
  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
/>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Client notes
          </label>
          <textarea
  name="notes"
  defaultValue={editingClient?.notes ?? ""}
  rows={3}
  placeholder="Additional information about this client..."
  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
/>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Status
          </label>
          <select
  name="status"
  defaultValue={editingClient?.is_active === false ? "inactive" : "active"}
  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</select>
        </div>

        {clientError && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {clientError}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setNewClient(false)}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {editingClient ? "Save changes" : "Create client"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}

          {tab === "Clients" && manager && (
  <div className="space-y-6">

    <div className="grid gap-4 sm:grid-cols-3">
      <Metric
        icon="users"
        label="Total clients"
        value={clients.length}
        detail="Registered clients"
        accent="teal"
      />

      <Metric
        icon="check"
        label="Active clients"
        value={clients.filter((client) => client.is_active).length}
        detail="Currently active"
        accent="blue"
      />

      <Metric
        icon="pin"
        label="Properties"
        value={propertyCount}
        detail="Registered properties"
        accent="violet"
      />
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
  <div>
    <h2 className="text-lg font-semibold">
      Client directory
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Manage your clients and their properties.
    </p>
  </div>

  <button
    type="button"
    onClick={() => {
  setEditingClient(null)
  setClientError("")
  setNewClient(true)
}}
    className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
  >
    <Icon name="plus" className="size-4" />
    Add client
  </button>
</div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">

  <div className="relative flex-1">
    <Icon
      name="search"
      className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
    />

    <input
      type="text"
      placeholder="Search clients..."
      value={clientSearch}
      onChange={(event) => setClientSearch(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
    />
  </div>

  <div className="flex rounded-xl border border-slate-200 bg-white p-1">
    {(["all", "active", "inactive"] as const).map((filter) => (
      <button
        key={filter}
        type="button"
        onClick={() => setClientFilter(filter)}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
          clientFilter === filter
            ? "bg-slate-950 text-white"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        {filter === "all"
          ? "All clients"
          : filter === "active"
            ? "Active"
            : "Inactive"}
      </button>
    ))}
  </div>

</div>

<p className="mt-4 text-xs font-medium text-slate-500">
  {filteredClients.length}{" "}
  {filteredClients.length === 1 ? "client" : "clients"} found
</p>

      </div>

     {filteredClients.length === 0 ? (
  <div className="p-12 text-center text-slate-500">
    No clients match your search.
  </div>
) : (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">

      <thead className="border-b border-slate-200 bg-slate-50">
        <tr>
          <th className="px-6 py-4 font-semibold text-slate-500">
            Client
          </th>
          <th className="px-6 py-4 font-semibold text-slate-500">
            Phone
          </th>
          <th className="px-6 py-4 text-center font-semibold text-slate-500">
            Properties
          </th>
          <th className="px-6 py-4 font-semibold text-slate-500">
            Status
          </th>
          <th className="px-6 py-4 text-right font-semibold text-slate-500">
            Actions
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {filteredClients.map((client) => (
          <tr
            key={client.id}
            className="transition hover:bg-slate-50"
          >

            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 font-bold text-teal-700">
                  {client.full_name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {client.full_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {client.email || "No email registered"}
                  </p>
                </div>
              </div>
            </td>

            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
              {client.phone || "—"}
            </td>

            <td className="px-6 py-4 text-center">
              <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                {client.properties.length}
              </span>
            </td>

            <td className="px-6 py-4">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                client.is_active
                  ? "bg-teal-50 text-teal-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {client.is_active ? "Active" : "Inactive"}
              </span>
            </td>

            <td className="px-6 py-4 text-right">
              <button
                type="button"
                onClick={() => {
                  setSelectedClientId(client.id)
                  setExpandedPropertyId(null)
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
              >
                View details
              </button>
            </td>

          </tr>
        ))}
      </tbody>

    </table>
  </div>
)}
    </div>
  </div>
)}
          {tab === "Cleaners" && (
  <div className="space-y-6">

    {/* Cleaner statistics */}
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        {
          label: "Total cleaners",
          value: cleaners.length,
        },
        {
          label: "Active cleaners",
          value: activeCleanerCount,
        },
        {
          label: "Inactive cleaners",
          value: cleaners.length - activeCleanerCount,
        },
      ].map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
            <Icon name="team" className="size-5" />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            {metric.label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {metric.value}
          </p>
        </div>
      ))}
    </div>

    {/* Cleaner directory */}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Cleaner directory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your cleaning team and their information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCleanerError("")
            setNewCleaner(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <Icon name="plus" className="size-4" />
          Add cleaner
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row">

        <div className="relative flex-1">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={cleanerSearch}
            onChange={(event) =>
              setCleanerSearch(event.target.value)
            }
            placeholder="Search by name, email or phone..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={cleanerFilter}
          onChange={(event) =>
            setCleanerFilter(
              event.target.value as "all" | "active" | "inactive"
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-500"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

      </div>

      <div className="px-6 py-3 text-xs text-slate-500">
        Showing {filteredCleaners.length} of {cleaners.length} cleaners
      </div>

      {/* Cleaner table */}
      {filteredCleaners.length === 0 ? (
        <div className="p-12 text-center text-sm text-slate-500">
          No cleaners match your search.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="border-y border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-500">
                  Cleaner
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  Phone
                </th>

                <th className="px-6 py-4 text-center font-semibold text-slate-500">
                  Loaded jobs
                </th>

                <th className="px-6 py-4 font-semibold text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right font-semibold text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredCleaners.map((cleaner) => {
                const assignedJobs = jobs.filter(
                  (job) =>
                    typeof job.cleaner !== "string" &&
                    job.cleaner.id === cleaner.id
                ).length

                return (
                  <tr
                    key={cleaner.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 font-bold text-teal-700">
                          {cleaner.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {cleaner.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {cleaner.email || "No email available"}
                          </p>
                        </div>

                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {cleaner.phone || "—"}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                        {assignedJobs}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          cleaner.isActive
                            ? "bg-teal-50 text-teal-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cleaner.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCleanerId(cleaner.id)
                        }
                        className="whitespace-nowrap rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                )
              })}

            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}
        </section>
      </div>
{selectedCleaner && manager && tab === "Cleaners" && (
  <div className="fixed inset-0 z-40 flex justify-end">

    {/* Background overlay */}
    <button
      type="button"
      aria-label="Close cleaner details"
      onClick={() => setSelectedCleanerId(null)}
      className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
    />

    {/* Cleaner drawer */}
    <aside className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">

      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 p-6">

        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-50 text-xl font-bold text-teal-700">
          {selectedCleaner.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-900">
            {selectedCleaner.name}
          </h2>

          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
              selectedCleaner.isActive
                ? "bg-teal-50 text-teal-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {selectedCleaner.isActive
              ? "Active cleaner"
              : "Inactive cleaner"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSelectedCleanerId(null)}
          className="rounded-xl bg-slate-100 p-2.5 text-slate-500 hover:bg-slate-200"
        >
          <Icon name="close" className="size-5" />
        </button>

      </div>

      {/* Drawer content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">

        {/* Contact information */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">
            Contact information
          </h3>

          <div className="space-y-4 rounded-xl border border-slate-200 p-4">

            <div>
              <p className="text-xs font-medium text-slate-500">
                Full name
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {selectedCleaner.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Email address
              </p>
              <p className="mt-1 break-all text-sm text-slate-700">
                {selectedCleaner.email || "Not registered"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Phone number
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {selectedCleaner.phone || "Not registered"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Member since
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {selectedCleaner.createdAt
                  ? new Date(
                      selectedCleaner.createdAt
                    ).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "Australia/Sydney",
                    })
                  : "Not available"}
              </p>
            </div>

          </div>
        </div>

                    {/* Performance overview */}
<div>
  <h3 className="mb-4 text-sm font-bold text-slate-900">
    Performance overview
  </h3>

  <div className="grid grid-cols-2 gap-3">
    {[
      {
        label: "Loaded jobs",
        value: selectedCleanerJobs.length,
        icon: "briefcase" as const,
      },
      {
        label: "Completed jobs",
        value: selectedCleanerCompletedJobs.length,
        icon: "check" as const,
      },
      {
        label: "Hours worked",
        value: `${selectedCleanerHours}h ${selectedCleanerMinutes}m`,
        icon: "clock" as const,
      },
      {
        label: "Estimated earnings",
        value: selectedCleanerEarnings.toLocaleString("en-AU", {
          style: "currency",
          currency: "AUD",
        }),
        icon: "money" as const,
      },
    ].map((metric) => (
      <div
        key={metric.label}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="grid size-9 place-items-center rounded-lg bg-teal-50 text-teal-700">
          <Icon name={metric.icon} className="size-5" />
        </div>

        <p className="mt-3 text-xs font-medium text-slate-500">
          {metric.label}
        </p>

        <p className="mt-1 text-xl font-bold text-slate-900">
          {metric.value}
        </p>
      </div>
    ))}
  </div>

  <p className="mt-3 text-xs text-slate-400">
    Based on loaded jobs. Working hours and estimated
    earnings are calculated from completed jobs.
  </p>
</div>

{/* Job history */}
<div>
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-sm font-bold text-slate-900">
      Job history
    </h3>

    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
      {selectedCleanerJobs.length} jobs
    </span>
  </div>

  {selectedCleanerJobs.length === 0 ? (
    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
      No jobs assigned to this cleaner.
    </div>
  ) : (
    <div className="max-h-96 space-y-3 overflow-y-auto">

      {[...selectedCleanerJobs]
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        )
        .map((job) => (
          <div
            key={job.id}
            className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {job.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {job.clientName}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  job.status === "completed"
                    ? "bg-teal-50 text-teal-700"
                    : job.status === "in-progress"
                    ? "bg-amber-50 text-amber-700"
                    : job.status === "accepted"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {job.status === "completed"
                  ? "Completed"
                  : job.status === "in-progress"
                  ? "In progress"
                  : job.status === "accepted"
                  ? "Accepted"
                  : "Scheduled"}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Icon name="pin" className="size-4" />
                {job.serviceAddress}
                {job.suburb ? `, ${job.suburb}` : ""}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Icon name="calendar" className="size-4" />

                {new Date(job.scheduledAt).toLocaleDateString(
                  "en-AU",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "Australia/Sydney",
                  }
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
                Estimated earnings
              </span>

              <span className="text-sm font-bold text-teal-700">
                {job.estimatedEarnings.toLocaleString("en-AU", {
                  style: "currency",
                  currency: "AUD",
                })}
              </span>
            </div>
          </div>
        ))}

    </div>
  )}

  <p className="mt-2 text-xs text-slate-400">
    Showing currently loaded jobs, most recent first.
  </p>
</div>

        {/* Internal notes */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Internal notes
          </h3>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="whitespace-pre-wrap text-sm text-slate-600">
              {selectedCleaner.notes ||
                "No internal notes registered."}
            </p>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Only managers can view these notes.
          </p>
        </div>

      </div>

     {/* Footer */}
<div className="flex gap-3 border-t border-slate-200 p-6">
  <button
    type="button"
    onClick={() => setSelectedCleanerId(null)}
    className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
  >
    Close
  </button>

  <button
    type="button"
    onClick={() => {
      setEditCleanerError("")
      setEditingCleaner(selectedCleaner)
    }}
    className="flex-1 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
  >
    Edit cleaner
  </button>
</div>

    </aside>
  </div>
)}

{editingCleaner && manager && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">

      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Edit cleaner
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update cleaner information and status.
          </p>
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={() => setEditingCleaner(null)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>

      <form
        className="space-y-5 p-6"
        onSubmit={(event) => {
          event.preventDefault()
          setEditCleanerError("")

          const form = new FormData(event.currentTarget)

          startTransition(async () => {
            try {
              const result = await updateCleanerAction({
  id: editingCleaner.id,
  name: String(form.get("name") || ""),
  email: editingCleaner.email,
  phone: String(form.get("phone") || ""),
  notes: String(form.get("notes") || ""),
  isActive: form.get("status") === "active",
})

              if (!result.ok) {
                setEditCleanerError(
                  result.error || "Could not update cleaner."
                )
                return
              }

              setEditingCleaner(null)
              router.refresh()
            } catch {
              setEditCleanerError(
                "An unexpected error occurred."
              )
            }
          })
        }}
      >

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Full name
          </label>
          <input
            required
            name="name"
            defaultValue={editingCleaner.name}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Email address
          </label>
          <input
            disabled
            value={editingCleaner.email}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
          />
          <p className="mt-2 text-xs text-slate-400">
            Email is linked to the cleaner's login account.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Phone number
          </label>
          <input
            name="phone"
            type="tel"
            defaultValue={editingCleaner.phone ?? ""}
            placeholder="0400 000 000"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Status
          </label>
          <select
            name="status"
            defaultValue={
              editingCleaner.isActive ? "active" : "inactive"
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Internal notes
          </label>
          <textarea
            name="notes"
            rows={4}
            defaultValue={editingCleaner.notes ?? ""}
            placeholder="Add internal notes about this cleaner..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
          />
        </div>

        {editCleanerError && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {editCleanerError}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            disabled={pending}
            onClick={() => setEditingCleaner(null)}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}

      {newJob && (
        <NewJobModal
          cleaners={cleaners.filter(
  (cleaner) => cleaner.isActive === true
)}
          clients={clients}
          pending={pending}
          close={() => setNewJob(false)}
          submit={(data) => {
  console.log("JOB DATA:", data)

  startTransition(async () => {
    try {
      const result = await createJobAction(data)

      console.log("CREATE JOB RESULT:", result)

      if (!result.ok) {
        console.error("CREATE JOB ERROR:", result.error)
        setNotice(result.error)
      } else {
        setNotice("Job created and assigned.")
        setNewJob(false)
        router.refresh()
      }
    } catch (error) {
      console.error("CREATE JOB EXCEPTION:", error)
      setNotice("Failed to create job. Check the console.")
    }
  })
}}
        />
      )}
      {newCleaner && (
        <NewCleanerModal
          pending={pending}
          error={cleanerError}
          close={() => setNewCleaner(false)}
          submit={(data) =>
            startTransition(async () => {
              const result = await createCleanerAction(data)
              if (!result.ok) setCleanerError(result.error)
              else {
                setNotice(
                  `${data.name.trim()} can now sign in with the email and temporary password you provided.`,
                )
                setNewCleaner(false)
                setTab("Cleaners")
                router.refresh()
              }
            })
          }
        />
      )}
      {selected && (
        <JobDrawer
          job={selected}
          pending={pending}
          isManager
          close={() => setSelected(null)}
          changeStatus={changeStatus}
          toggleChecklist={toggleChecklist}
        />
      )}
    </main>
  )
}

function CleanerWorkspace({
  user,
  jobs,
  notice,
  pending,
  selected,
  setNotice,
  setSelected,
  changeStatus,
  toggleChecklist,
  signOut,
  restoreJob,
}: {
  user: DashboardProps["user"]
  jobs: Job[]
  notice: string
  pending: boolean
  selected: Job | null
  setNotice: (notice: string) => void
  setSelected: (job: Job | null) => void
  changeStatus: (job: Job, status: Job["status"]) => void
  toggleChecklist: (
  checklistItemId: string,
  completed: boolean
) => void
  signOut: () => void
  restoreJob: (jobId: string) => void
}) {
  const [view, setView] = useState<
  "My day" | "All jobs" | "Calendar" | "Earnings" | "Archived"
>("My day")
  const activeJobs = jobs.filter(
  (job) => job.status !== "completed" && !job.archived
)

const completedJobs = jobs.filter(
  (job) => job.status === "completed" && !job.archived
)

const archivedJobs = jobs.filter(
  (job) => job.status === "completed" && job.archived
)
  const nextShift = activeJobs[0]
  const earned = completedJobs.reduce(
    (total, job) => total + job.estimatedEarnings,
    0,
  )
  const pendingEarnings = activeJobs.reduce(
    (total, job) => total + job.estimatedEarnings,
    0,
  )

  function primaryAction(job: Job) {
    if (job.status === "scheduled") changeStatus(job, "accepted")
    else if (job.status === "accepted") changeStatus(job, "in-progress")
    else setSelected(job)
  }

  const actionLabel = (status: Job["status"]) => {
    if (status === "scheduled") return "Accept shift"
    if (status === "accepted") return "Start shift"
    if (status === "in-progress") return "Continue shift"
    return "View details"
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-950 md:pb-8">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-400">Cleaner</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-teal-100 font-bold text-teal-800">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <button
              onClick={signOut}
              className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-950"
              aria-label="Sign out"
            >
              <Icon name="logout" className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-10">
        {notice && (
          <button
            onClick={() => setNotice("")}
            className="mb-6 w-full rounded-xl bg-teal-50 px-4 py-3 text-left text-sm font-medium text-teal-800"
          >
            {notice}
          </button>
        )}

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-teal-700">
              {new Intl.DateTimeFormat("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Hi {user.name.split(" ")[0]}, here’s your day
            </h1>
            <p className="mt-2 text-slate-500">
              Review your assigned shifts and keep your progress up to date.
            </p>
          </div>
          <div className="hidden rounded-xl border border-slate-200 bg-white p-1 md:flex">
            {(["My day", "All jobs", "Calendar", "Earnings", "Archived"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  view === item
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

            {view === "Calendar" && (
  <div className="mt-8">
    <JobCalendar
      jobs={jobs.filter((job) => !job.archived)}
      onSelect={setSelected}
    />
  </div>
)}

        {view === "My day" && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Metric
                icon="calendar"
                label="Assigned shifts"
                value={activeJobs.length}
                detail={`${jobs.filter((job) => job.status === "accepted").length} accepted`}
                accent="teal"
              />
              <Metric
                icon="clock"
                label="Hours scheduled"
                value={`${Math.round(activeJobs.reduce((sum, job) => sum + job.durationMinutes, 0) / 60)}h`}
                detail="Across upcoming shifts"
                accent="blue"
              />
              <Metric
                icon="money"
                label="Expected earnings"
                value={money(pendingEarnings)}
                detail="From active assignments"
                accent="amber"
              />
            </div>

            {nextShift ? (
              <section className="mt-7 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-300/30">
                <div className="grid lg:grid-cols-[1fr_auto]">
                  <div className="p-6 md:p-9">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-300">
                        {nextShift.status === "in-progress"
                          ? "Shift in progress"
                          : "Your next shift"}
                      </p>
                      <Status value={nextShift.status} />
                    </div>
                    <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                      {nextShift.title}
                    </h2>
                    <p className="mt-2 text-slate-400">
                      {nextShift.clientName}
                    </p>
                    <div className="mt-7 grid gap-4 text-sm sm:grid-cols-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-teal-300">
                          <Icon name="calendar" className="size-4" />
                        </span>
                        <span>
                          <span className="block text-xs text-slate-500">
                            Date
                          </span>
                          {formatDate(nextShift.scheduledAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-teal-300">
                          <Icon name="clock" className="size-4" />
                        </span>
                        <span>
                          <span className="block text-xs text-slate-500">
                            Time
                          </span>
                          {formatTime(nextShift.scheduledAt)} ·{" "}
                          {nextShift.durationMinutes} min
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-teal-300">
                          <Icon name="money" className="size-4" />
                        </span>
                        <span>
                          <span className="block text-xs text-slate-500">
                            Earnings
                          </span>
                          {money(nextShift.estimatedEarnings)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(nextShift)}
                      className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
                    >
                      <Icon name="pin" className="size-4" />
                      {nextShift.serviceAddress}
                      <Icon name="arrow" className="size-4" />
                    </button>
                  </div>
                  <div className="flex flex-col justify-center gap-3 border-t border-white/10 bg-white/5 p-6 lg:min-w-64 lg:border-l lg:border-t-0">
                    <button
                      disabled={pending}
                      onClick={() => primaryAction(nextShift)}
                      className="rounded-xl bg-teal-400 px-6 py-3.5 font-semibold text-slate-950 hover:bg-teal-300 disabled:opacity-50"
                    >
                      {pending ? "Updating…" : actionLabel(nextShift.status)}
                    </button>
                    <button
                      onClick={() => setSelected(nextShift)}
                      className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      View shift details
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <section className="mt-7 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon name="check" />
                </span>
                <h2 className="mt-5 text-xl font-semibold">
                  You’re all caught up
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  New assigned shifts will appear here.
                </p>
              </section>
            )}

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Upcoming assignments
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Only jobs assigned to your account are shown.
                  </p>
                </div>
                <button
                  onClick={() => setView("All jobs")}
                  className="text-sm font-semibold text-teal-700"
                >
                  View all
                </button>
              </div>
              <CleanerJobGrid
                jobs={activeJobs}
                pending={pending}
                onOpen={setSelected}
                onAction={primaryAction}
                actionLabel={actionLabel}
              />
            </section>
          </>
        )}

        {view === "All jobs" && (
          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">All assigned jobs</h2>
              <p className="mt-1 text-sm text-slate-500">
                Upcoming and completed shifts assigned to you.
              </p>
            </div>
            <CleanerJobGrid
              jobs={jobs.filter((job) => !job.archived)}
              pending={pending}
              onOpen={setSelected}
              onAction={primaryAction}
              actionLabel={actionLabel}
            />
          </section>
        )}

        {view === "Earnings" && (
          <section className="mt-8 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
            <div className="rounded-3xl bg-slate-950 p-7 text-white">
              <p className="text-sm text-slate-400">Completed earnings</p>
              <p className="mt-3 text-5xl font-semibold tracking-tight">
                {money(earned)}
              </p>
              <p className="mt-4 text-sm text-slate-400">
                Across {completedJobs.length} completed{" "}
                {completedJobs.length === 1 ? "shift" : "shifts"}
              </p>
            </div>
            <JobList
              title="Completed shifts"
              jobs={completedJobs}
              onSelect={setSelected}
            />
          </section>
        )}
      </div>

      {view === "Archived" && (
  <section className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    <h2 className="text-xl font-semibold">
      Archived jobs
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Completed jobs you have archived.
    </p>

    {archivedJobs.length === 0 ? (
      <p className="mt-6 text-sm text-slate-500">
        No archived jobs yet.
      </p>
    ) : (
      <div className="mt-5 space-y-3">
        {archivedJobs.map((job) => (
  <div
    key={job.id}
    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <button
      type="button"
      onClick={() => setSelected(job)}
      className="min-w-0 flex-1 text-left"
    >
      <p className="font-semibold">{job.title}</p>
      <p className="mt-1 text-sm text-slate-500">
        {job.serviceAddress}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {new Date(job.scheduledAt).toLocaleDateString("en-AU")}
      </p>
    </button>

    <button
      type="button"
      disabled={pending}
      onClick={() => restoreJob(job.id)}
      className="rounded-xl border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
    >
      Restore job
    </button>
  </div>
))}
      </div>
    )}
  </section>
)}

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        {([
  ["My day", "grid"],
  ["All jobs", "briefcase"],
  ["Calendar", "calendar"],
  ["Earnings", "money"],
  ["Archived", "clock"],
] as [typeof view, IconName][]).map(([item, icon]) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`flex flex-col items-center gap-1 py-1 text-xs font-semibold ${
              view === item ? "text-teal-700" : "text-slate-400"
            }`}
          >
            <Icon name={icon} className="size-5" />
            {item}
          </button>
        ))}
      </nav>

      {selected && (
        <JobDrawer
          job={selected}
          pending={pending}
          isManager={false}
          close={() => setSelected(null)}
          changeStatus={changeStatus}
          toggleChecklist={toggleChecklist}
        />
      )}
    </main>
  )
}

function CleanerJobGrid({
  jobs,
  pending,
  onOpen,
  onAction,
  actionLabel,
}: {
  jobs: Job[]
  pending: boolean
  onOpen: (job: Job) => void
  onAction: (job: Job) => void
  actionLabel: (status: Job["status"]) => string
}) {
  if (!jobs.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
        <p className="font-semibold">No assigned jobs here</p>
        <p className="mt-1 text-sm text-slate-500">
          Your manager’s next assignment will appear automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {jobs.map((job) => (
        <article
          key={job.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/20"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Status value={job.status} />
              <h3 className="mt-3 text-lg font-semibold">{job.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{job.clientName}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatTime(job.scheduledAt)}</p>
              <p className="mt-1 text-xs text-slate-400">
                {formatDate(job.scheduledAt)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpen(job)}
            className="mt-5 flex w-full items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-left text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-800"
          >
            <Icon name="pin" className="size-4 shrink-0" />
            <span className="truncate">{job.serviceAddress}</span>
          </button>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-semibold">
              {job.durationMinutes} min · {money(job.estimatedEarnings)}
            </p>
            <button
              disabled={pending}
              onClick={() =>
                job.status === "completed" ? onOpen(job) : onAction(job)
              }
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-500"
            >
              {actionLabel(job.status)}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: IconName
  label: string
  value: string | number
  detail: string
  accent: string
}) {
  const colors: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span
          className={`grid size-11 place-items-center rounded-2xl ${colors[accent]}`}
        >
          <Icon name={icon} />
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-400">{detail}</p>
    </div>
  )
}

function JobCalendar({
  jobs,
  onSelect,
}: {
  jobs: Job[]
  onSelect: (job: Job) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const [selectedDay, setSelectedDay] = useState(() =>
  new Date().getDate()
)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const today = new Date()

function isToday(day: number) {
  return (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  )
}

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthLabel = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(currentMonth)

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function changeMonth(offset: number) {
  setCurrentMonth(new Date(year, month + offset, 1))
  setSelectedDay(1)
}

  function jobsForDay(day: number) {
    return jobs.filter((job) => {
      const date = new Date(job.scheduledAt)

      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      )
    })
  }

  const statusColors: Record<Job["status"], string> = {
    scheduled: "bg-sky-50 text-sky-700",
    accepted: "bg-violet-50 text-violet-700",
    "in-progress": "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {monthLabel}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded-lg border px-3 py-2 hover:bg-slate-50"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ))}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded-lg border px-3 py-2 hover:bg-slate-50"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200">
        {weekdays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, index) => (
          <div
           key={index}
             className="min-h-14 border-b border-r border-slate-100 p-1 sm:min-h-28 sm:p-2"
          >
            {day !== null && (
              <>
                <button
  type="button"
  onClick={() => setSelectedDay(day)}
  className={`inline-flex size-8 items-center justify-center rounded-full text-sm font-semibold transition ${
    isToday(day)
      ? "bg-teal-600 text-white"
      : selectedDay === day
        ? "bg-teal-100 text-teal-800"
        : "text-slate-700 hover:bg-slate-100"
  }`}
>
  {day}
</button>
  {jobsForDay(day).length > 0 && (
  <div className="mt-1 flex justify-center sm:hidden">
    <span className="size-1.5 rounded-full bg-teal-500" />
  </div>
)}
                <div className="mt-2 hidden space-y-1 sm:block">
                  {jobsForDay(day).map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => onSelect(job)}
                      className={`block w-full truncate rounded-md px-2 py-1 text-left text-xs font-medium hover:opacity-75 ${
                        statusColors[job.status]
                      }`}
                      title={job.title}
                    >
                      {new Date(job.scheduledAt).toLocaleTimeString(
                        "en-AU",
                        { hour: "numeric", minute: "2-digit" }
                      )}{" "}
                      {job.title}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

<div className="border-t border-slate-200 p-4 sm:hidden">
  <h3 className="mb-3 font-semibold text-slate-900">
    {new Date(year, month, selectedDay).toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })}
  </h3>

  {jobsForDay(selectedDay).length === 0 ? (
    <p className="text-sm text-slate-500">
      No jobs scheduled for this day.
    </p>
  ) : (
    <div className="space-y-2">
      {jobsForDay(selectedDay).map((job) => (
        <button
          key={job.id}
          type="button"
          onClick={() => onSelect(job)}
          className="w-full rounded-xl border border-slate-200 p-3 text-left hover:border-teal-300"
        >
          <p className="font-semibold text-slate-900">
            {job.title}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {new Date(job.scheduledAt).toLocaleTimeString("en-AU", {
              hour: "numeric",
              minute: "2-digit",
            })}
            {" · "}
            {job.serviceAddress}
          </p>

          <span className="mt-2 inline-block text-xs font-medium capitalize text-teal-700">
            {job.status}
          </span>
        </button>
      ))}
    </div>
  )}
</div>


    </div>
  )
}

function JobList({
  title,
  jobs,
  onSelect,
}: {
  title: string
  jobs: Job[]
  onSelect: (job: Job) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-xs font-semibold text-slate-400">
          {jobs.length} JOBS
        </span>
      </div>
      {jobs.length ? (
        <div className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => onSelect(job)}
              className="group grid w-full gap-4 px-6 py-5 text-left transition hover:bg-slate-50 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 font-bold text-teal-700">
                {new Date(job.scheduledAt).getDate()}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{job.title}</p>
                  <Status value={job.status} />
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <Icon name="pin" className="size-3.5" />
                  {job.serviceAddress}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {job.clientName} · {formatDate(job.scheduledAt)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-5 sm:justify-end">
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatTime(job.scheduledAt)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {job.durationMinutes} min · {money(job.estimatedEarnings)}
                  </p>
                </div>
                <Icon
                  name="arrow"
                  className="size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-600"
                />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Icon name="calendar" />
          </span>
          <p className="mt-4 font-semibold">No jobs here yet</p>
          <p className="mt-1 text-sm text-slate-500">
            New assignments will appear here.
          </p>
        </div>
      )}
    </div>
  )
}

function Status({ value }: { value: Job["status"] }) {
  const styles = {
    scheduled: "bg-sky-50 text-sky-700",
    accepted: "bg-violet-50 text-violet-700",
    "in-progress": "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
  }
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[value]}`}
    >
      {value.replace("-", " ")}
    </span>
  )
}

function QuickAction({
  icon,
  label,
  action,
}: {
  icon: IconName
  label: string
  action: () => void
}) {
  return (
    <button
      onClick={action}
      className="rounded-xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
    >
      <Icon name={icon} className="mb-3 size-5" />
      {label}
    </button>
  )
}

function EmptyPanel({
  icon,
  title,
  text,
}: {
  icon: IconName
  title: string
  text: string
}) {
  return (
    <div className="col-span-full rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
        <Icon name={icon} />
      </span>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  )
}

function NewCleanerModal({
  pending,
  error,
  close,
  submit,
}: {
  pending: boolean
  error: string
  close: () => void
  submit: (data: Parameters<typeof createCleanerAction>[0]) => void
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

  

    const data = new FormData(event.currentTarget)
    submit({
      name: String(data.get("name")),
      email: String(data.get("email")),
      phone: String(data.get("phone")),
      password: String(data.get("password")),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-600">Team member</p>
            <h2 className="mt-1 text-2xl font-semibold">Add a new cleaner</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create or reissue their sign-in account, then share the temporary
              password with them securely.
            </p>
          </div>
          <button
            onClick={close}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <Field
            label="Full name"
            name="name"
            placeholder="Taylor Morgan"
            autoComplete="off"
          />
          <Field
            label="Email address"
            name="email"
            type="email"
            placeholder="taylor@company.com"
            autoComplete="off"
          />
          <Field
            label="Phone number"
            name="phone"
            type="tel"
            placeholder="0400 000 000"
            autoComplete="off"
          />
          <Field
            label="Temporary password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            CleanFlow does not email credentials automatically. Copy the
            temporary password before closing this form and send it through a
            secure channel.
          </div>
          {error && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              disabled={pending}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50"
            >
              {pending ? "Adding cleaner…" : "Create cleaner account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function NewJobModal({
  cleaners,
  clients,
  pending,
  close,
  submit,
}: {
  cleaners: Cleaner[]
  clients: DashboardProps["clients"]
  pending: boolean
  close: () => void
  submit: (data: Parameters<typeof createJobAction>[0]) => void
}) {

  const [checklistTasks, setChecklistTasks] = useState<string[]>([
  "Kitchen surfaces and sink",
  "Bathrooms and mirrors",
  "Vacuum and mop floors",
  "Final quality check",
])

const [newChecklistTask, setNewChecklistTask] = useState("")

const [selectedClientId, setSelectedClientId] = useState("")
const [selectedPropertyId, setSelectedPropertyId] = useState("")

const activeClients = clients.filter(
  (client) => client.is_active
)

const selectedClient = activeClients.find(
  (client) => client.id === selectedClientId
)

const activeProperties = (selectedClient?.properties ?? []).filter(
  (property) => property.is_active
)

const selectedProperty = activeProperties.find(
  (property) => property.id === selectedPropertyId
)

function addChecklistTask() {
  const task = newChecklistTask.trim()

  if (!task) return

  setChecklistTasks((current) => [...current, task])
  setNewChecklistTask("")
}

function removeChecklistTask(index: number) {
  setChecklistTasks((current) =>
    current.filter((_, itemIndex) => itemIndex !== index)
  )
}



function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    submit({
      title: String(data.get("title")),
      clientId: String(data.get("clientId") ?? ""),
propertyId: String(data.get("propertyId") ?? ""),
      cleaner: String(data.get("cleaner")),
      scheduledAt: String(data.get("scheduledAt")),
      durationMinutes: Number(data.get("durationMinutes")),
      estimatedEarnings: Number(data.get("estimatedEarnings")),
      instructions: String(data.get("instructions")),
      checklistTasks: checklistTasks,
    })
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-600">
              New assignment
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Create a cleaning job
            </h2>
          </div>
          <button
            onClick={close}
            className="grid size-10 place-items-center rounded-xl bg-slate-100"
          >
            <Icon name="close" />
          </button>
        </div>
        {cleaners.length ? (
          <form
            onSubmit={handleSubmit}
            className="mt-7 grid gap-5 sm:grid-cols-2"
          >
            <Field
              label="Job title"
              name="title"
              placeholder="Standard home clean"
            />
           <label className="block text-sm font-medium text-slate-700">
  Client
  <select
    required
    name="clientId"
    value={selectedClientId}
    onChange={(event) => {
      setSelectedClientId(event.target.value)
      setSelectedPropertyId("")
    }}
    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
  >
    <option value="">Select a client</option>

    {activeClients.map((client) => (
      <option key={client.id} value={client.id}>
        {client.full_name}
      </option>
    ))}
  </select>
</label>

<label className="sm:col-span-2 block text-sm font-medium text-slate-700">
  Property
  <select
    required
    name="propertyId"
    value={selectedPropertyId}
    disabled={!selectedClientId}
    onChange={(event) => {
      setSelectedPropertyId(event.target.value)
    }}
    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
  >
    <option value="">
      {selectedClientId
        ? "Select a property"
        : "Select a client first"}
    </option>

    {activeProperties.map((property) => (
      <option key={property.id} value={property.id}>
        {property.property_name || "Property"} — {property.address_line1}, {property.suburb}
      </option>
    ))}
  </select>
</label>

{activeClients.length === 0 && (
  <div className="sm:col-span-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
    No active clients available. Register a client in the
    Clients section first.
  </div>
)}

{selectedClientId && activeProperties.length === 0 && (
  <div className="sm:col-span-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
    This client has no active properties. Add or activate
    a property in the Clients section first.
  </div>
)}

{selectedProperty && (
  <div className="sm:col-span-2 rounded-xl border border-teal-100 bg-teal-50 p-4">

    <div className="flex items-center gap-2 text-teal-700">
      <Icon name="pin" className="size-5" />

      <p className="text-sm font-semibold">
        Service address
      </p>
    </div>

    <p className="mt-2 text-sm font-medium text-slate-800">
      {[
        selectedProperty.address_line1,
        selectedProperty.address_line2,
        selectedProperty.suburb,
        selectedProperty.state,
        selectedProperty.postcode,
      ].filter(Boolean).join(", ")}
    </p>

    <p className="mt-1 text-xs capitalize text-slate-500">
      {selectedProperty.property_type}
    </p>

  </div>
)}
            <label className="block text-sm font-medium text-slate-700">
              Assign cleaner
              <select
                required
                name="cleaner"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
              >
                <option value="">Select a cleaner</option>
                {cleaners.map((cleaner) => (
                  <option key={cleaner.id} value={cleaner.id}>
                    {cleaner.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Date and time"
              name="scheduledAt"
              type="datetime-local"
            />
            <Field
              label="Duration (minutes)"
              name="durationMinutes"
              type="number"
              placeholder="120"
            />
            <Field
              label="Estimated earnings (AUD)"
              name="estimatedEarnings"
              type="number"
              placeholder="120"
            />
            <label className="sm:col-span-2 block text-sm font-medium text-slate-700">
              Instructions
              <textarea
                name="instructions"
                rows={3}
                placeholder="Entry details, priority areas and special notes…"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
              />
            </label>
                  <div className="sm:col-span-2 space-y-3">
  <label className="block text-sm font-medium text-slate-700">
    Cleaning checklist
  </label>

  <p className="text-xs text-slate-500">
    Add or remove tasks for this cleaning job.
  </p>

  <div className="space-y-2">
    {checklistTasks.map((task, index) => (
      <div
        key={index}
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
      >
        <span className="flex-1 text-sm text-slate-700">
          {task}
        </span>

        <button
          type="button"
          onClick={() => removeChecklistTask(index)}
          className="text-sm font-medium text-red-500"
        >
          Remove
        </button>
      </div>
    ))}
  </div>

  <div className="flex gap-2">
    <input
      type="text"
      value={newChecklistTask}
      onChange={(event) => setNewChecklistTask(event.target.value)}
      placeholder="Add a cleaning task..."
      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
    />

    <button
      type="button"
      onClick={addChecklistTask}
      className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-medium text-white"
    >
      Add
    </button>
  </div>
</div>
            
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                disabled={pending}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pending ? "Creating…" : "Create & assign job"}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-16 text-center">
            <p className="font-semibold">Add a cleaner first</p>
            <p className="mt-2 text-sm text-slate-500">
              New team members can create their own cleaner account from the
              sign-in page.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function JobTimer({
  actualStart,
  actualEnd,
}: {
  actualStart: string
  actualEnd: string | null
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (actualEnd) return

    setNow(Date.now())

    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [actualStart, actualEnd])

  const start = new Date(actualStart).getTime()
  const end = actualEnd ? new Date(actualEnd).getTime() : now

  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000))

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const formattedTime = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")

  return (
    <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
        {actualEnd ? "Total time worked" : "Time worked"}
      </p>

      <p className="mt-2 text-4xl font-bold tabular-nums text-teal-900">
        {formattedTime}
      </p>

      <p className="mt-2 text-sm text-teal-700">
        {actualEnd ? "Job completed" : "Timer running"}
      </p>

      <div className="mt-4 space-y-2 border-t border-teal-200 pt-4 text-sm">
  <div className="flex justify-between">
    <span>Started at</span>
    <strong>
      {new Date(actualStart).toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "2-digit",
      })}
    </strong>
  </div>

  {actualEnd && (
    <div className="flex justify-between">
      <span>Completed at</span>
      <strong>
        {new Date(actualEnd).toLocaleTimeString("en-AU", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </strong>
    </div>
  )}
</div>

    </div>
  )
}


function JobDrawer({
  job,
  pending,
  isManager,
  close,
  changeStatus,
  toggleChecklist,
}: {
  job: Job
  pending: boolean
  isManager: boolean
  close: () => void
  changeStatus: (job: Job, status: Job["status"]) => void
  toggleChecklist: (
    checklistItemId: string,
    completed: boolean
  ) => void
}) {
  const [editing, setEditing] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <aside className="ml-auto flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <Status value={job.status} />
            <button
              onClick={close}
              className="grid size-10 place-items-center rounded-xl bg-slate-100"
            >
              <Icon name="close" />
            </button>
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            {job.title}
          </h2>

          {job.actualStart && (
  <JobTimer
    actualStart={job.actualStart}
    actualEnd={job.actualEnd}
  />
)}

          {isManager && (
  <button
    type="button"
    onClick={() => setEditing(true)}
    className="mt-3 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
  >
    Edit job
  </button>
  
)}
{editing && isManager && (
  <form
  onSubmit={(event) => {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const scheduledAt = String(form.get("scheduledAt"))
    const start = new Date(scheduledAt)

    if (Number.isNaN(start.getTime())) {
      alert("Please enter a valid date and time.")
      return
    }

    void (async () => {
      const result = await updateJobAction(job.id, {
        title: String(form.get("title") ?? ""),
        scheduledAt: start.toISOString(),
        durationMinutes: Number(form.get("durationMinutes")),
        estimatedEarnings: Number(form.get("estimatedEarnings")),
        instructions: String(form.get("instructions") ?? ""),
        serviceAddress: String(form.get("serviceAddress") ?? ""),
suburb: String(form.get("suburb") ?? ""),
postcode: String(form.get("postcode") ?? ""),
      })

      if (!result.ok) {
        alert(result.error)
        return
      }

      setEditing(false)
      window.location.reload()
    })()
  }}
    className="mt-4 space-y-4 rounded-2xl border border-teal-200 bg-teal-50 p-4"
  >
    <h3 className="text-lg font-semibold">
      Edit cleaning job
    </h3>

    <label className="block text-sm font-medium">
      Job title
      <input
        name="title"
        type="text"
        defaultValue={job.title}
        required
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
      />
    </label>


<label className="block text-sm font-medium">
  Service address
  <input
    name="serviceAddress"
    type="text"
    defaultValue={job.serviceAddress}
    required
    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
  />
</label>

<label className="block text-sm font-medium">
  Suburb
  <input
    name="suburb"
    type="text"
    defaultValue={job.suburb ?? ""}
    required
    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
  />
</label>

<label className="block text-sm font-medium">
  Postcode
  <input
    name="postcode"
    type="text"
    defaultValue={job.postcode ?? ""}
    required
    maxLength={4}
    pattern="[0-9]{4}"
    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
  />
</label>


      <label className="block text-sm font-medium">
  Date and time
  <input
    name="scheduledAt"
    type="datetime-local"
    defaultValue={(() => {
      const date = new Date(job.scheduledAt)
      const local = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
      return local.toISOString().slice(0, 16)
    })()}
    required
    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
  />
</label>

<label className="block text-sm font-medium">
  Duration (minutes)
  <input
    name="durationMinutes"
    type="number"
    min="15"
    step="1"
    defaultValue={job.durationMinutes}
    required
    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
  />
</label>

    <label className="block text-sm font-medium">
      Instructions
      <textarea
        name="instructions"
        defaultValue={job.instructions ?? ""}
        rows={3}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
      />
    </label>

    <label className="block text-sm font-medium">
      Estimated earnings (AUD)
      <input
        name="estimatedEarnings"
        type="number"
        min="0"
        step="0.01"
        defaultValue={job.estimatedEarnings}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
      />
    </label>

    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Save changes
      </button>
    </div>
  </form>
)}

          <p className="mt-2 text-slate-500">{job.clientName}</p>
        </div>
        <div className="flex-1 space-y-7 p-6">
          <div className="grid grid-cols-2 gap-3">
            <Info
              icon="calendar"
              label="Date"
              value={formatDate(job.scheduledAt)}
            />
            <Info
              icon="clock"
              label="Time"
              value={`${formatTime(job.scheduledAt)} · ${job.durationMinutes} min`}
            />
            <Info
              icon="money"
              label="Earnings"
              value={money(job.estimatedEarnings)}
            />
            <Info
              icon="team"
              label="Cleaner"
              value={
                typeof job.cleaner === "string" ? "Assigned" : job.cleaner.name
              }
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Location
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.serviceAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-teal-300 hover:bg-teal-50"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon name="pin" />
                </span>
                {job.serviceAddress}
              </span>
              <Icon name="arrow" className="size-4" />
            </a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Instructions
            </p>
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {job.instructions ||
                "Complete the standard clean and conduct a final quality check before leaving."}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Checklist
            </p>
            <div className="mt-3 space-y-2">
              {(job.checklist?.length
                ? job.checklist
                : [
                    { task: "Review property instructions" },
                    { task: "Complete cleaning service" },
                    { task: "Final quality check" },
                  ]
              ).map((item, index) => (
                <button
  type="button"
  key={item.id || index}
  disabled={
    pending ||
    isManager ||
    !item.id
  }
  onClick={() => {
    if (item.id) {
      toggleChecklist(item.id, !item.completed)
    }
  }}
  className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left text-sm transition-colors hover:bg-slate-50 disabled:cursor-default"
>
                  <span
                    className={`grid size-6 place-items-center rounded-lg border ${
                      item.completed
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "border-slate-200 text-transparent"
                    }`}
                  >
                    <Icon name="check" className="size-3.5" />
                  </span>
                  {item.task}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 border-t border-slate-100 bg-white p-6">

              {!isManager && job.status === "completed" && !job.archived && (
  <button
    type="button"
    disabled={pending}
    onClick={() => {
      if (!window.confirm("Archive this completed job?")) return

      void (async () => {
        const result = await toggleJobArchiveAction(job.id, true)

        if (!result.ok) {
          alert(result.error)
          return
        }

        window.location.reload()
      })()
    }}
    className="w-full rounded-xl bg-slate-900 py-3.5 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
  >
    Archive Job
  </button>
)}

          {!isManager && job.status === "scheduled" && (
            <button
              disabled={pending}
              onClick={() => changeStatus(job, "accepted")}
              className="w-full rounded-xl bg-slate-950 py-3.5 font-semibold text-white hover:bg-teal-700"
            >
              Accept shift
            </button>
          )}
          {!isManager && job.status === "accepted" && (
            <button
              disabled={pending}
              onClick={() => changeStatus(job, "in-progress")}
              className="w-full rounded-xl bg-slate-950 py-3.5 font-semibold text-white hover:bg-teal-700"
            >
              Start shift
            </button>
          )}
          {!isManager && job.status === "in-progress" && (
            <button
              disabled={pending}
              onClick={() => changeStatus(job, "completed")}
              className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white hover:bg-teal-700"
            >
              Complete shift
            </button>
          )}
          {job.status === "completed" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3.5 font-semibold text-emerald-700">
              <Icon name="check" /> Job completed
            </div>
          )}
          {isManager && job.status !== "completed" && (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-600">
              Shift progress is updated by the assigned cleaner.
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

function Info({
  icon,
  label,
  value,
}: {
  icon: IconName
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon name={icon} className="size-4 text-teal-600" />
      <p className="mt-3 text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}
