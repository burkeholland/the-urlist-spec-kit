# Research – The Urlist

## Decision Log Format
Each decision lists: Decision, Rationale, Alternatives Considered.

### 1. Technology Stack Confirmation
- Decision: Use Next.js App Router (15.x) with React Server Components; shadcn/ui for interactive primitives; PostgreSQL for persistence; direct SQL via `pg` (to be added) rather than ORM.
- Rationale: Aligns with Constitution Principles II, III, IV discouraging unnecessary abstraction and endorsing direct framework & DB usage.
- Alternatives: Prisma ORM (rejected: added abstraction + migration layer not required at current complexity); Drizzle (rejected: additional abstraction; direct SQL adequate).

### 2. Session-Bound Creator Identification
- Decision: Use an opaque `creator_session_id` stored in httpOnly cookie on first list-creation; reused for authorization on subsequent draft mutations.
- Rationale: Full auth out-of-scope; minimal stable identifier needed to restrict mutations (FR-018).
- Alternatives: JWT auth (rejected scope); IP-based (rejected instability); localStorage token (rejected security principle V).

### 3. Slug Generation & Uniqueness Strategy
- Decision: On publication if no custom slug, generate 6–10 char lowercase alphanumeric slug ensuring uniqueness via `INSERT ... ON CONFLICT DO NOTHING` loop (<3 attempts expected). Unique index on `lists.slug` where status='published'. Pre-publication availability check uses case-insensitive query.
- Rationale: Simple, atomic collision handling and meets FR-008..FR-011, FR-021 p95 latency.
- Alternatives: UUID segments (less human-friendly); separate slug table (overhead not justified yet).

### 4. Metadata Fetch Implementation
- Decision: Server-side fetch with timeout controller (5s) retrieving page HTML, parse `<title>` and basic meta description; if unavailable fallback placeholders.
- Rationale: Satisfies FR-003, FR-015, FR-020 using minimal dependencies (native fetch + small HTML parser like `node-html-parser`).
- Alternatives: Headless browser (overkill); external enrichment API (adds dependency & latency).

### 5. Concurrency & Ordering
- Decision: Insert entry row immediately with `fetch_status='pending'`; enrichment updates row in place; position determined by monotonic `position` integer using `COALESCE(MAX(position)+1,0)` inside transaction.
- Rationale: Guarantees insertion order (FR-017) even with rapid operations.
- Alternatives: Client-managed ordering (risk of race); timestamp ordering (ties possible).

### 6. Duplicate URL Handling
- Decision: Normalize URL for duplicate detection (lowercase scheme+host, remove trailing slash, preserve path/query) and perform case-insensitive existence check to trigger warning flag returned in API response but still insert.
- Rationale: FR-024 requires non-blocking feedback.
- Alternatives: Unique constraint (blocks duplicates – conflicts with spec).

### 7. Publication Immutability Enforcement
- Decision: Database check constraint or application guard preventing modifications (other than delete) when `status='published'`; route handlers verify before update/delete operations.
- Rationale: FR-027 enforcement close to persistence layer reduces logic duplication.
- Alternatives: Pure application-layer enforcement (risk of missed paths).

### 8. Logging Strategy
- Decision: JSON structured logs for publish/delete with fields: `event`, `list_id`, `slug`, `timestamp`. Stored in append-only `actions_log` table for 90 days via scheduled cleanup SQL job (cron outside initial scope, placeholder maintenance script task).
- Rationale: FR-025 auditability.
- Alternatives: External logging service (overhead early stage).

### 9. Performance Targets & Indexing
- Decision: Indexes: `lists(slug)` unique partial (WHERE status='published'), `url_entries(list_id, position)`, `url_entries(list_id, fetch_status)`, `actions_log(list_id)`. Ensures O(log n) slug lookups, ordered entry scans.
- Rationale: Meets slug validation p95 <1s, efficient list rendering.
- Alternatives: Full-text index (unnecessary yet), separate slug table (not needed yet).

### 10. Testing Approach
- Decision: Use Jest for integration (with `supertest` against Next route handlers) and React Testing Library for component tests; Node test DB spun up via connection string env pointing to local Postgres.
- Rationale: Widely adopted; minimal config with Next.js.
- Alternatives: Vitest (similar but Jest more common + ecosystem docs) ; Cypress (E2E later phase).

### 11. Component Selection (shadcn/ui)
- Decision: Initially add: `button`, `input`, `form` primitives, `toast` (for duplicate warning), `dialog` (confirm deletions), `badge` (status), `spinner` (loading enrichment), `separator`.
- Rationale: Supports core interactions with minimal surface; aligns with Constitution Principle III.
- Alternatives: Custom Tailwind components (risk inconsistency), full dashboard block (overkill early).

### 12. Security Considerations
- Decision: Validate all incoming URLs with Zod schema + custom URL length + protocol whitelist (http/https). Reject >2000 chars or unsupported protocols.
- Rationale: FR-019, FR-026; prevents injection vectors (javascript:).
- Alternatives: Regex-only validation (less robust).

### 13. Error Model
- Decision: Use discriminated union result objects `{ ok: true, data } | { ok: false, code, message }` from domain functions; route handlers map to HTTP status codes (400 validation, 404 not found, 409 slug conflict, 500 unexpected).
- Rationale: Consistency and testability; avoids throwing for expected domain errors.
- Alternatives: Throw + catch for control flow (less explicit).

## Open Items (Resolved in Plan)
None – specification assumptions cover prior ambiguities.

## Summary
Research confirms minimalistic, constitution-aligned design using direct SQL, selective shadcn/ui components, and simple async enrichment workflow.
