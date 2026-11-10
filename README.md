# CleanFlow

## Run locally

Requires Node.js 20.9 or newer and pnpm 11.25.

```sh
pnpm install
pnpm seed:manager
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The local manager email and password are in `.env` as `LOCAL_MANAGER_EMAIL` and `LOCAL_MANAGER_PASSWORD`.

CleanFlow signs users in with Supabase Auth and stores their manager/cleaner profiles in Payload. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project's **Connect** panel. Set `SUPABASE_SECRET_KEY` from **Settings → API Keys** as a server-only value; it lets the manager screen and `pnpm seed:manager` provision Auth users. Never prefix this key with `NEXT_PUBLIC_` or expose it to the browser.

The local setup uses SQLite in `cleaningflow.db`; setting `SUPABASE_DATABASE_URL` switches Payload to Postgres. Figma Content API and hosted storage are disabled for local development; the Figma integration can be initialized separately when needed.

To set up another checkout, copy `.env.example` to `.env`, set a private `PAYLOAD_SECRET`, Supabase URL and keys, and local manager credentials, then run the commands above. Existing Payload cleaner profiles can be provisioned in Supabase Auth by adding them again from the manager screen with a new temporary password.
