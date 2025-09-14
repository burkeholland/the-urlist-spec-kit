This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Constitution

Core, non‑negotiable engineering principles live in `.specify/memory/constitution.md` (version 3.0.0). All contributions must cite relevant principle numbers in PR descriptions. If a change cannot comply, open an amendment proposal first (see Governance section inside the constitution). 

Quick highlights:
1. Server Components by default; Client Components only when required.
2. shadcn/ui is the only source of UI primitives; variants via `cva`.
3. PostgreSQL is canonical; migrations are forward/back compatible.
4. Security: parameterized queries, validated input, no secrets in client.
5. Observability: structured logs + metrics (req count, p95, query count, errors).
6. Tests first; CI blocks on type, lint, test, accessiblity, size, perf guards.

Read the full constitution before significant contributions.

## Getting Started

### 1. Start PostgreSQL (Docker)

The test and development database can be started via Docker:

```bash
pnpm db:up
# view logs (optional)
pnpm db:logs
```

Environment variables (copy `.env.example` to `.env`):

```bash
DATABASE_URL=postgres://user:password@localhost:5432/urlist_dev
SESSION_COOKIE_NAME=urlist_session
METADATA_FETCH_TIMEOUT_MS=5000
```

Run migrations (idempotent):

```bash
pnpm migrate
```

### 2. Run the development server

After the DB is up and env vars are set:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## UI Primitives (shadcn/ui)

The project will use `shadcn/ui` components (to be scaffolded later). A placeholder `components/ui/.keep` file exists so the directory is tracked. Once the component pipeline is initialized, generated primitives will live under `components/ui/` and be wrapped with project‑specific variants via `class-variance-authority`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
