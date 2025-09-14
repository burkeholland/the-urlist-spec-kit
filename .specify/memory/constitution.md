# URList Spec Kit Constitution

Authoritative, non‑negotiable principles governing development with Next.js (App Router), shadcn/ui, and PostgreSQL.

## Core Principles

### I. Product & Simplicity First (NON‑NEGOTIABLE)
Every change must serve an explicit user outcome. Remove, do not generalize, if no current user/value path exists. Prefer one obvious implementation over an abstraction until duplication rule of three is met. No premature generalization, feature flags, or config layers without an active requirement.

### II. Next.js App Router Discipline (NON‑NEGOTIABLE)
1 route segment = 1 responsibility. Server Components by default; Client Components only when browser APIs (event handlers, stateful UI, portals) are required. Never wrap entire trees in `"use client"`. Data fetching belongs in Server Components or Route Handlers; Client Components receive already‑resolved data. Revalidate defaults: use `cache: 'force-cache'` unless specific freshness rule; explicit `revalidate` values documented in code comments (why, not what). Dynamic rendering (`export const dynamic = 'force-dynamic'`) requires justification comment and issue link.

### III. UI Consistency via shadcn/ui (NON‑NEGOTIABLE)
All interactive primitives sourced from shadcn/ui then locally themed; no ad‑hoc component libraries. Variants defined with `cva()` + `data-*` attributes; no tailwind explosion in call sites. Accessibility: Each exported component passes axe checks and supports keyboard navigation & dark mode. Styling strictly via Tailwind + CSS variables; no inline style objects except dynamic layout calculations. Design tokens live in `globals.css`; new tokens require audit of existing ones for reuse.

### IV. Database Integrity & Performance (NON‑NEGOTIABLE)
PostgreSQL is the single source of truth; no shadow caches containing canonical state. Schema changes: migration-first, using SQL migration files with forward + backward compatibility—deployment must tolerate one version skew. All queries use the standard PostgreSQL driver (`pg`); no ORM or query builder abstractions. All queries parameterized; never string‑concatenate SQL. N+1 prevention: any route introducing >2 sequential round trips must add a test/profiling note; prefer set‑based queries or explicit batching. Each table: primary key, updated_at, created_at (immutable). Foreign keys & `ON DELETE` strategy explicit (CASCADE vs RESTRICT) in migration rationale comment.

### V. Security & Privacy Baseline (NON‑NEGOTIABLE)
Least privilege: DB roles limited to required statements; no application superuser in production. Secrets only from environment (`process.env`) at edge of system; never re‑export secrets to client bundles. All user input validated at boundary (Zod or similar) before persistence. Output escaping: React Server Components rely on automatic escaping—no `dangerouslySetInnerHTML` without security review + issue link. Authentication & session state never stored in localStorage; use httpOnly cookies or signed tokens; CSRF defenses for state‑changing POST if not using same‑site cookie default.

### VI. Observability & Operational Readiness
Structured logging (JSON) at server boundary; no `console.log` in production code. Each route handler documents: expected latency budget & error classes. Metrics: request count, p95 latency, DB query count per request, error rate. Feature launches require: log key, metric key, rollback note. No silent catches—errors either re‑thrown, typed, or converted into a typed Result. Background tasks instrumented with start/end + duration.

### VII. Performance & Edge Strategy
Use Server Components + streaming where payload > 40KB or waterfall risk. Images through Next.js Image component; explicit width/height; remote patterns whitelisted. Critical CSS only: remove unused shadcn variants; purge tailwind. Avoid client state libraries unless server round trip proven critical; prefer React cache or server actions. DB queries > 50ms p95 require index or justification comment.

### VIII. Testing & Quality Gates
Test pyramid: (a) Fast unit & component tests (JSDOM / react testing lib), (b) Integration tests covering Postgres + Route Handlers, (c) Minimal E2E paths (auth, primary CRUD flows). All new logic: failing test first (red‑green‑refactor). Schema migrations ship with at least one test asserting new constraint/index behavior. Accessibility snapshot (axe) for every exported visual component. Performance guard: at least one integration test asserts query count for critical page (e.g., home) stays <= baseline.

### IX. Branch, Review & CI Enforcement
No direct commits to `main`. PR must show: (1) linked issue, (2) tests added/updated, (3) migration plan (if DB), (4) performance & security checklist if touching route handlers. CI blocks merge on: type errors, lint, tests, migrations forward apply, formatting, accessibility audit. Green CI is the merge gate; manual overrides require governance approval.

### X. Documentation & Traceability
Every exported module top comment: purpose, invariants, ownership tag. Migrations named `YYYYMMDDHHMM_<slug>`; rationale in migration file header. Architectural decisions captured as lightweight ADRs (issues or `/docs/adr/`). Each non‑trivial config toggle documents blast radius + rollback.

## Additional Constraints & Standards

1. TypeScript strict mode only; `any` banned except in typed escape hatches with `// @bounded-any:` justification.
2. Lint rules: no unused exports; no default exports for components except Next.js route segment entry points.
3. Import layering: `app/` can import `lib/` but not vice‑versa. UI components consume pure functions; no direct DB calls in Client Components.
4. Feature flags (if introduced) must be server evaluated and never leak disabled code paths to client bundles.
5. No global mutable singletons except: DB client, telemetry client. Others require governance approval.

## Development Workflow

1. Plan: Write issue / spec referencing relevant principles numbers.
2. Design: Confirm data model changes + migration sketch before coding.
3. TDD Cycle: Write failing test(s) → implement minimal pass → refactor.
4. Review: Checklist in PR description auto‑verifies principle compliance.
5. Deploy: Apply migrations, verify metrics dashboards, smoke test primary flows.
6. Post‑Deploy: Confirm no error spike / latency regression before closing issue.

Quality Gates (must pass): typecheck, lint, test, accessibility, build size diff (< +5% critical bundles unless justified), p95 latency synthetic check.

## Governance

This constitution supersedes all legacy practice documents. Amendments require: (a) written proposal referencing affected principle numbers, (b) migration/cleanup plan, (c) version increment + changelog entry, (d) template & checklist sync (see `constitution_update_checklist.md`). Emergency waivers time‑boxed <=14 days and tracked via issue label `constitution-waiver` with explicit expiry.

Enforcement: Code review rejects violations without remediation path. Repeated violations trigger root‑cause workflow (process / tooling / training). Automation encouraged—manual policing discouraged.

**Version**: 3.0.0 | **Ratified**: 2025-09-13 | **Last Amended**: 2025-09-13