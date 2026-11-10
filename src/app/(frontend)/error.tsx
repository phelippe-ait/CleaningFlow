"use client"

export default function AppError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/50">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-500 text-xl font-bold text-white">
          C
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-950">
          Something interrupted the flow.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Try loading your workspace again. If the issue continues, sign out and return.
        </p>
        <button
          className="mt-7 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
          onClick={() => unstable_retry()}
        >
          Reload workspace
        </button>
      </div>
    </main>
  )
}
