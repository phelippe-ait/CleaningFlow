"use client"

import {
  useMemo,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  createCleanerAction,
  createJobAction,
  loginAction,
  logoutAction,
  updateJobStatusAction,
  updateChecklistAction,
} from "./actions"

type Cleaner = {
  id: string
  name: string
  email: string
}
type Job = {
  id: string
  title: string
  clientName: string
  serviceAddress: string
  cleaner: Cleaner | string
  scheduledAt: string
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

type DashboardProps = {
  user: {
    id: string
    name: string
    email: string
    role: "manager" | "cleaner"
  }
  jobs: Job[]
  cleaners: Cleaner[]
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

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-900/10">
        <Icon name="sparkle" className="size-6" />
      </span>
      {!compact && (
        <span className="text-xl font-bold tracking-tight text-slate-900">
          CleanFlow
        </span>
      )}
    </div>
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
  clientCount,
  propertyCount,
}: DashboardProps) {
  const router = useRouter()
  const [tab, setTab] = useState("Overview")
  const [query, setQuery] = useState("")
  const [mobileNav, setMobileNav] = useState(false)
  const [newJob, setNewJob] = useState(false)
  const [newCleaner, setNewCleaner] = useState(false)
  const [cleanerError, setCleanerError] = useState("")
  const [selected, setSelected] = useState<Job | null>(null)
  const [notice, setNotice] = useState("")
  const [pending, startTransition] = useTransition()
  const manager = user.role === "manager"

  const filtered = useMemo(
    () =>
      jobs.filter((job) =>
        `${job.title} ${job.clientName} ${job.serviceAddress}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [jobs, query],
  )
  const upcoming = filtered.filter((job) => job.status !== "completed")
  const completed = jobs.filter((job) => job.status === "completed")
  const earnings = jobs.reduce(
    (sum, job) =>
      sum + (job.status === "completed" ? job.estimatedEarnings : 0),
    0,
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
          <Logo />
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
              <div className="rounded-xl border border-slate-200 bg-white p-1">
                <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                  List
                </button>
                <button className="px-4 py-2 text-sm font-medium text-slate-500">
                  Calendar
                </button>
              </div>
            )}
          </div>

          {tab === "Overview" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                <Metric
                  icon="check"
                  label="Completed"
                  value={completed.length}
                  detail="All-time jobs"
                  accent="blue"
                />
                <Metric
                  icon="money"
                  label="Earnings"
                  value={money(earnings)}
                  detail={
                    manager ? "Completed job value" : "Your completed jobs"
                  }
                  accent="amber"
                />
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
            <JobList
              title={`${filtered.length} scheduled jobs`}
              jobs={filtered}
              onSelect={setSelected}
            />
          )}
          {tab === "Clients" && (
            <EmptyPanel
              icon="users"
              title={`${clientCount} clients in your workspace`}
              text="Client profiles and their contact details are managed securely in Payload Admin."
            />
          )}
          {tab === "Cleaners" && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {cleaners.length} active{" "}
                  {cleaners.length === 1 ? "cleaner" : "cleaners"}
                </p>
                <button
                  onClick={() => {
                    setCleanerError("")
                    setNewCleaner(true)
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-700"
                >
                  <Icon name="plus" className="size-4" />
                  Add cleaner
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cleaners.length ? (
                  cleaners.map((cleaner) => (
                    <div
                      key={cleaner.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6"
                    >
                      <span className="grid size-12 place-items-center rounded-2xl bg-teal-50 font-bold text-teal-700">
                        {cleaner.name.charAt(0)}
                      </span>
                      <p className="mt-4 font-semibold">{cleaner.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {cleaner.email}
                      </p>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-teal-600">
                        {
                          jobs.filter(
                            (j) =>
                              typeof j.cleaner !== "string" &&
                              j.cleaner.id === cleaner.id,
                          ).length
                        }{" "}
                        assigned jobs
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyPanel
                    icon="team"
                    title="Build your cleaning team"
                    text="Add your first cleaner with their sign-in email and a temporary password."
                  />
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {newJob && (
        <NewJobModal
          cleaners={cleaners}
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
}) {
  const [view, setView] = useState<"My day" | "All jobs" | "Earnings">("My day")
  const activeJobs = jobs.filter((job) => job.status !== "completed")
  const completedJobs = jobs.filter((job) => job.status === "completed")
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
            {(["My day", "All jobs", "Earnings"] as const).map((item) => (
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
              jobs={jobs}
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

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/95 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        {([
          ["My day", "grid"],
          ["All jobs", "briefcase"],
          ["Earnings", "money"],
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
              disabled={pending || job.status === "completed"}
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
  pending,
  close,
  submit,
}: {
  cleaners: Cleaner[]
  pending: boolean
  close: () => void
  submit: (data: Parameters<typeof createJobAction>[0]) => void
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    submit({
      title: String(data.get("title")),
      clientName: String(data.get("clientName")),
      serviceAddress: String(data.get("serviceAddress")),
      suburb: String(data.get("suburb") ?? ""),
      postcode: String(data.get("postcode") ?? ""),
      cleaner: String(data.get("cleaner")),
      scheduledAt: String(data.get("scheduledAt")),
      durationMinutes: Number(data.get("durationMinutes")),
      estimatedEarnings: Number(data.get("estimatedEarnings")),
      instructions: String(data.get("instructions")),
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
            <Field
              label="Client name"
              name="clientName"
              placeholder="Sofia Bennett"
            />
            <label className="sm:col-span-2 block text-sm font-medium text-slate-700">
              Service address
              <input
                required
                name="serviceAddress"
                placeholder="24 Harbour Street, Sydney"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
              />
            </label>
            <Field label="Suburb" name="suburb" placeholder="Sydney" />
            <Field
              label="Postcode"
              name="postcode"
              inputMode="numeric"
              pattern="[0-9]{4}"
              placeholder="2000"
            />
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
