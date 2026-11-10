"use client"

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
        <main className="max-w-md text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-400 text-2xl font-bold text-slate-950">
            C
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Let’s get you back in flow.</h1>
          <p className="mt-3 text-slate-400">
            CleanFlow hit an unexpected issue. Your information is safe.
          </p>
          <button
            className="mt-7 rounded-xl bg-teal-400 px-6 py-3 font-semibold text-slate-950"
            onClick={() => unstable_retry()}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
