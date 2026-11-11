# CleanFlow

CleanFlow is a web app for coordinating a cleaning team. Managers can organise
clients, properties, cleaners, and cleaning jobs; cleaners can sign in to view
their assigned work and update its progress.

## What it includes

- Separate manager and cleaner sign-in and workflows
- Job scheduling with addresses, instructions, estimated earnings, and checklists
- Job progress tracking: scheduled, accepted, in progress, and completed
- A Payload CMS admin area for managing application records
- Supabase Auth and database integration

## Tech stack

- Next.js 15, React 19, and TypeScript
- Supabase Auth and database
- Payload CMS 4
- SQLite for the local Payload database by default; PostgreSQL is also supported

## Run locally

### Requirements

- Node.js 20.9 or newer
- pnpm 11.25
- A Supabase project configured with the CleanFlow application schema

### 1. Install dependencies

```sh
pnpm install
```

### 2. Configure environment variables

Create your local environment file:

```sh
cp .env.example .env
```

Set a private `PAYLOAD_SECRET` (for example, generate one with
`node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`),
then configure the Supabase values in `.env`:

| Variable | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | Secret used by Payload CMS. Keep it private. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL of your Supabase project. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key used by the app. |
| `SUPABASE_SECRET_KEY` | Server-only Supabase key used for account provisioning. Never expose it to the browser. |
| `LOCAL_MANAGER_NAME` | Name for the initial manager account. |
| `LOCAL_MANAGER_EMAIL` | Email for the initial manager account. |
| `LOCAL_MANAGER_PASSWORD` | Private password for the initial manager account. |

`DATABASE_URI` defaults to a local SQLite file named `cleaningflow.db`.
Optionally set `SUPABASE_DATABASE_URL` to use PostgreSQL for Payload instead.
This only selects Payload's database; the app's Supabase Auth and application
data still require a configured Supabase project.

### 3. Prepare Supabase and create a manager

The Supabase project must have the database schema and policies required by the
app, including the `profiles` table and job-related tables. Ensure new Auth
accounts receive a corresponding `profiles` row (for example, through your
project's Auth trigger). The manager provisioning command creates the Supabase
Auth account and Payload manager record; it does not install the application
database schema.

Apply the SQL migration in
[`supabase/migrations/20261110000000_grant_service_role_profiles_access.sql`](./supabase/migrations/20261110000000_grant_service_role_profiles_access.sql)
to grant the server-side service role the required access to `profiles`.

With the required Supabase schema and environment variables in place, run:

```sh
pnpm seed:manager
```

The manager email and password are the values configured in `.env`. Keep the
password private.

### 4. Start the app

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The Payload admin area is
available at [http://localhost:3000/admin](http://localhost:3000/admin).

## Useful commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the local development server. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Run the production server after building. |
| `pnpm seed:manager` | Provision the initial manager account. |
| `pnpm payload:generate:types` | Regenerate Payload TypeScript types. |
| `pnpm payload:generate:importmap` | Regenerate the Payload admin import map. |

## Security notes

- Never commit `.env` or share Supabase secret keys or passwords.
- `SUPABASE_SECRET_KEY` is server-only; do not add the `NEXT_PUBLIC_` prefix.
- `.env.example` contains placeholders for local setup, not production
  credentials.
- Use a unique, strong `PAYLOAD_SECRET` and private manager credentials.
