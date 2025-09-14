# Tasks: The Urlist – Create & Share URL Collections

**Feature Directory**: `specs/001-design-web-application/`
**Design Inputs**: `plan.md`, `research.md`, `data-model.md`, `contracts/lists.md`, `quickstart.md`
**Stack**: Next.js (App Router, RSC-first), TypeScript, PostgreSQL (direct SQL via `pg`), Jest + Supertest, React Testing Library, shadcn/ui

> Ordering enforces: Setup → Schema/Infra → Contract Tests → Integration Tests → Core Implementation (models/services/endpoints) → UI → Integration/Infra (logging, metadata worker) → Polish (unit/perf/docs). All endpoint & domain code is test-driven: contract & integration tests MUST exist & fail before implementing handlers.

## Legend
- Format: `T### [P?] Description (files)`
- `[P]` = Task can run in parallel with other `[P]` tasks (distinct files / no dependency).
- No `[P]` = Must be sequential (shared file or explicit dependency).

## Phase 3.1: Setup & Environment
1. T001 Initialize test config: add Jest + TS preset, `jest.config.ts`, `ts-jest` setup, `scripts` in `package.json` (`test`, `test:contract`, `test:integration`) (files: `package.json`, `jest.config.ts`)
2. T002 Add database client utility: install `pg`, create `lib/db.ts` with pooled connection + helper for transactions (files: `package.json`, `lib/db.ts`)
3. T003 Create env config & validation: `lib/config.ts` (parse `process.env`, validate `DATABASE_URL`, `SESSION_COOKIE_NAME`, `METADATA_FETCH_TIMEOUT_MS`) (file: `lib/config.ts`)
4. T004 Create logging utility: `lib/logger.ts` simple JSON logger + type (file: `lib/logger.ts`)
5. T005 Add test DB bootstrap script: `tests/_setup/test-db.ts` (create/drop schema per run) + Jest globalSetup/globalTeardown wiring (files: `jest.config.ts`, `tests/_setup/test-db.ts`)
6. T006 [P] Add URL normalization utility + tests placeholder (implementation deferred): `lib/url-normalize.ts` exporting `normalizeUrl(raw:string)` (file: `lib/url-normalize.ts`)
7. T007 [P] Add slug generator utility placeholder `lib/slug.ts` with collision retry loop skeleton (file: `lib/slug.ts`)
8. T008 [P] Add metadata fetcher utility placeholder `lib/metadata-fetch.ts` (timeout logic, HTML parse TODO comment) (file: `lib/metadata-fetch.ts`)
9. T009 Configure shadcn/ui pipeline: add initial setup note & placeholder UI folder `components/ui/` (file: `README.md` update, `components/ui/.keep`)
10. T010 Create initial `.env.example` from quickstart values (file: `.env.example`)

## Phase 3.2: Database Schema (Models & Migration) – BEFORE Tests
11. T011 Create initial SQL migration `migrations/20250913_001_init.sql` with tables: `lists`, `url_entries`, `actions_log`, indexes & constraints as per `data-model.md` (file: `migrations/20250913_001_init.sql`)
12. T012 Add `updated_at` trigger function & triggers for `lists`, `url_entries` (append to same migration file) (file: `migrations/20250913_001_init.sql`)
13. T013 Add migration execution helper script `scripts/run-migrations.ts` (file: `scripts/run-migrations.ts`)
14. T014 Create model query helpers: `lib/models/lists.ts` (CRUD draft list, publish, slug availability), `lib/models/urlEntries.ts`, `lib/models/actionsLog.ts` (files: `lib/models/*.ts`)
15. T015 Add model-level domain result types (success/error union) in `lib/models/types.ts` (file: `lib/models/types.ts`)

## Phase 3.3: Contract Tests (API Shape) – MUST FAIL INITIALLY
16. T016 Contract test: POST /api/lists (file: `tests/contract/lists.post.create-list.test.ts`)
17. T017 [P] Contract test: GET /api/lists/{id} (file: `tests/contract/lists.get.list-by-id.test.ts`)
18. T018 [P] Contract test: POST /api/lists/{id}/entries (file: `tests/contract/lists.post.add-entry.test.ts`)
19. T019 [P] Contract test: PATCH /api/lists/{id}/entries/{entryId}` (file: `tests/contract/lists.patch.update-entry.test.ts`)
20. T020 [P] Contract test: DELETE /api/lists/{id}/entries/{entryId}` (file: `tests/contract/lists.delete.entry.test.ts`)
21. T021 [P] Contract test: DELETE /api/lists/{id}` (file: `tests/contract/lists.delete.list.test.ts`)
22. T022 [P] Contract test: GET /api/slug-availability?slug= (file: `tests/contract/slug.get.availability.test.ts`)
23. T023 [P] Contract test: POST /api/lists/{id}/slug (file: `tests/contract/lists.post.assign-slug.test.ts`)
24. T024 [P] Contract test: POST /api/lists/{id}/publish (file: `tests/contract/lists.post.publish.test.ts`)
25. T025 [P] Contract test: GET /api/public/lists/{slug} (file: `tests/contract/public.get.list-by-slug.test.ts`)

## Phase 3.4: Integration Tests (User Scenarios from quickstart & spec) – FAIL FIRST
26. T026 Integration test: draft lifecycle (create → fetch) (file: `tests/integration/list-lifecycle.test.ts`)
27. T027 [P] Integration test: add entries & duplicate detection flag (file: `tests/integration/add-entries-duplicate.test.ts`)
28. T028 [P] Integration test: metadata enrichment transition (pending→success/failed) with timeout mock (file: `tests/integration/metadata-enrichment.test.ts`)
29. T029 [P] Integration test: publish flow (slug assign auto/custom, slug conflict) (file: `tests/integration/publish-flow.test.ts`)
30. T030 [P] Integration test: immutability after publish (mutations 409) (file: `tests/integration/immutability.test.ts`)
31. T031 [P] Integration test: delete list soft delete & public 404 (file: `tests/integration/delete-list.test.ts`)
32. T032 [P] Integration test: delete entry reordering not required (positions stable for remaining) (file: `tests/integration/delete-entry.test.ts`)

## Phase 3.5: Core Implementation (Failing Tests Drive Code)
33. T033 Implement route handler: POST /api/lists (file: `app/api/lists/route.ts`)
34. T034 Implement route handler: GET /api/lists/{id} (file: `app/api/lists/[id]/route.ts`)
35. T035 Implement route handler: POST /api/lists/{id}/entries (file: `app/api/lists/[id]/entries/route.ts`)
36. T036 Implement route handler: PATCH /api/lists/{id}/entries/{entryId} (file: `app/api/lists/[id]/entries/[entryId]/route.ts`)
37. T037 Implement route handler: DELETE /api/lists/{id}/entries/{entryId} (file: `app/api/lists/[id]/entries/[entryId]/route.ts`)
38. T038 Implement route handler: DELETE /api/lists/{id} (file: `app/api/lists/[id]/route.ts`)
39. T039 Implement route handler: GET /api/slug-availability (file: `app/api/slug-availability/route.ts`)
40. T040 Implement route handler: POST /api/lists/{id}/slug (file: `app/api/lists/[id]/slug/route.ts`)
41. T041 Implement route handler: POST /api/lists/{id}/publish (file: `app/api/lists/[id]/publish/route.ts`)
42. T042 Implement route handler: GET /api/public/lists/{slug} (file: `app/api/public/lists/[slug]/route.ts`)
43. T043 Implement metadata enrichment worker (invoke after entry insert) (file: `lib/workers/metadata-enricher.ts`)
44. T044 Implement URL normalization utility (real logic + tests pass) (file: `lib/url-normalize.ts`)
45. T045 Implement slug generator (unique attempt loop) (file: `lib/slug.ts`)
46. T046 Integrate logging (publish/delete events) + actions_log insertion (files: `lib/models/actionsLog.ts`, route handlers)
47. T047 Add error mapping layer (domain result→HTTP) shared helper (file: `lib/http/map-error.ts`)
48. T048 Implement cookie session issuance & parsing (create list sets cookie) (file: `lib/session.ts`)

## Phase 3.6: UI (Server & Client Components)
49. T049 Server component: Draft list management page (list + entries) (file: `app/lists/[id]/page.tsx`)
50. T050 [P] Client component: Add Entry form with optimistic append (file: `components/add-entry-form.tsx`)
51. T051 [P] Client component: Entry item editor (title/description) (file: `components/entry-item.tsx`)
52. T052 [P] Client component: Publish controls (slug input + publish button) (file: `components/publish-controls.tsx`)
53. T053 Public list page (server component) (file: `app/lists/[slug]/page.tsx`)
54. T054 Toast notifications integration for duplicate & errors (file: `components/ui/toaster.tsx`)

## Phase 3.7: Integration & Infra Enhancements
55. T055 Metadata enrichment test harness (jest fake HTML fetch) (file: `tests/integration/metadata-enrichment.test.ts` augment)
56. T056 Add performance guard test: slug availability p95 <1s (file: `tests/perf/slug-availability-perf.test.ts`)
57. T057 Add query count assertion helper (ensuring ≤3 queries public view) (file: `tests/perf/query-count.test.ts`)
58. T058 Maintenance script: cleanup old actions_log (placeholder) (file: `scripts/cleanup-actions-log.sql`)

## Phase 3.8: Polish
59. T059 [P] Unit tests: URL normalization edge cases (file: `tests/unit/url-normalize.test.ts`)
60. T060 [P] Unit tests: slug generator collision retry (file: `tests/unit/slug.test.ts`)
61. T061 [P] Unit tests: validation schemas (URL, slug) (file: `tests/unit/validation.test.ts`)
62. T062 Documentation: update `README.md` quickstart with run scripts & endpoints summary (file: `README.md`)
63. T063 Refactor & de-duplicate model query helpers (file: `lib/models/*.ts`)
64. T064 Security review: ensure URL & slug validation rejects bad inputs (augment tests) (files: `tests/unit/validation.test.ts`)
65. T065 Final pass: remove TODOs, ensure logging structured (files: `lib/**/*.ts`)

## Dependencies Summary
- T001 before any test tasks.
- T002, T003 before DB and model tasks (need config & DB client).
- T011–T013 before contract tests (schema required).
- T014, T015 after migration (schema types) but before implementing handlers (optional pre-contract; handlers rely on them).
- Contract tests T016–T025 before corresponding implementation tasks T033–T042.
- Integration tests T026–T032 before their covered implementation details finalize (they can be written after contract tests, before full implementation).
- Utilities placeholders (T006–T008) precede tests that rely on them (later completed in T044–T045, T043).
- UI tasks (T049–T054) after all API endpoints (T033–T042) ensure backend stable.
- Performance & polish (T056–T065) after core implementation.

## Parallelization Notes
- All `[P]` tasks touch distinct files and have no unmet dependencies at their start.
- Migration edits (T011–T013) are sequential (single file).
- Endpoint implementations (T033–T042) not marked `[P]` due to potential shared helper refactors & to keep linear clarity.
- UI client components (T050–T052) parallel.
- Unit test additions (T059–T061) parallel.

## Parallel Execution Example
```
# Example: Run contract test authoring in parallel (after migrations):
Task: T017 Contract test GET /api/lists/{id}
Task: T018 Contract test POST /api/lists/{id}/entries
Task: T019 Contract test PATCH /api/lists/{id}/entries/{entryId}
Task: T020 Contract test DELETE /api/lists/{id}/entries/{entryId}
Task: T021 Contract test DELETE /api/lists/{id}
Task: T022 Contract test GET /api/slug-availability
Task: T023 Contract test POST /api/lists/{id}/slug
Task: T024 Contract test POST /api/lists/{id}/publish
Task: T025 Contract test GET /api/public/lists/{slug}

# Example: Run UI component tasks in parallel once APIs complete:
Task: T050 Client component Add Entry form
Task: T051 Client component Entry item editor
Task: T052 Client component Publish controls
```

## Validation Checklist
- [x] All 10 endpoints have contract tests (T016–T025)
- [x] All entities (`lists`, `url_entries`, `actions_log`) have model/migration tasks (T011–T015)
- [x] Tests precede implementation (contract & integration before T033+)
- [x] Parallel tasks do not share files
- [x] Each task names concrete file path(s)
- [x] Performance & polish tasks scheduled last

## Execution Guidance
1. Complete sequential setup tasks T001–T005, run migrations with script after T011–T013.
2. Author contract tests (T016–T025) letting them fail.
3. Add integration tests (T026–T032) – fail.
4. Implement handlers & utilities incrementally until tests pass (T033+).
5. Add UI (T049+) & ensure integration tests still pass.
6. Execute polish and performance tasks.

---
Generated per `tasks.prompt.md` specification on 2025-09-13.
# Tasks – The Urlist (Generated Plan)

> NOTE: This file simulates /tasks output (created for completeness). Follow TDD: tests before implementation. [P] indicates potential parallelization.

## Legend
Type: C=Contract Test, I=Integration Test, U=Unit Test, IMP=Implementation, MIG=Migration, DOC=Documentation, OPS=Ops/Infra

## Phase A – Foundation
1. (MIG) Create initial migration `lists`, `url_entries`, `actions_log` with indexes.
2. (IMP) DB client module (`lib/db.ts`) using `pg`, connection pooling.
3. (U) Slug generator util + tests (length, charset, collision simulation).
4. (U) URL normalization + validation util tests (length, protocol, normalization rules).

## Phase B – Contracts (Tests First)
5. (C) POST /api/lists contract test (201 shape, sets cookie).
6. (C) GET /api/lists/{id} draft contract test.
7. (C) POST /api/lists/{id}/entries contract test (pending fetch_status, duplicate flag).
8. (C) PATCH /api/lists/{id}/entries/{entryId} contract test.
9. (C) DELETE /api/lists/{id}/entries/{entryId} contract test.
10. (C) DELETE /api/lists/{id} contract test.
11. (C) GET /api/slug-availability contract test (available true/false paths).
12. (C) POST /api/lists/{id}/slug contract test (happy + conflict + invalid).
13. (C) POST /api/lists/{id}/publish contract test (no entries, success, already published, slug conflict).
14. (C) GET /api/public/lists/{slug} contract test (200, 404 deleted or missing).

## Phase C – Implement API Handlers
15. (IMP) Implement POST /api/lists with session cookie creation.
16. (IMP) Implement GET /api/lists/{id} with creator auth + entries join.
17. (IMP) Implement POST /api/lists/{id}/entries with duplicate detection + position transaction.
18. (IMP) Implement PATCH /api/lists/{id}/entries/{entryId} guard published.
19. (IMP) Implement DELETE /api/lists/{id}/entries/{entryId}.
20. (IMP) Implement DELETE /api/lists/{id} (soft delete set deleted_at).
21. (IMP) Implement GET /api/slug-availability.
22. (IMP) Implement POST /api/lists/{id}/slug custom slug assignment.
23. (IMP) Implement POST /api/lists/{id}/publish transaction (slug gen, validations, log insert).
24. (IMP) Implement GET /api/public/lists/{slug}.

## Phase D – Metadata Enrichment
25. (U) Metadata fetch util tests (timeout fallback, title/description parsing minimal HTML).
26. (IMP) Metadata fetch worker (background trigger after entry insert; simple in-process queue).
27. (I) Integration test: entry fetch_status transitions to success/failed after timeout.

## Phase E – UI (Server Components + Minimal Client)
28. (IMP) Draft list management page (server component) fetching list + entries.
29. (IMP) Client component for add URL form (uses `button`, `input`).
30. (IMP) Client component entry list item editor (optimistic UI, PATCH endpoint).
31. (IMP) Slug availability client check flow with debounce.
32. (IMP) Publish button flow + toast feedback.
33. (IMP) Public list page (read-only) + status badge.
34. (C) Accessibility tests (axe) for main interactive components.

## Phase F – Logging & Observability
35. (IMP) Structured logging utility wrapper + tests (shape).
36. (I) Publish/delete routes log insertion test.

## Phase G – Performance & Quality Gates
37. (I) Query count test for GET public list (≤2 queries expected).
38. (I) Slug availability latency test assertion (<1s p95 simulated loop or benchmark harness).

## Phase H – Documentation & Cleanup
39. (DOC) Update quickstart with migrations + test commands.
40. (OPS) SQL job or script stub for actions_log 90-day retention.
41. (DOC) Add README section summarizing feature endpoints.

## Parallelization Notes
- Tests 5–14 parallelizable after migration & utils.
- UI tasks 28–33 after API handlers stable.
- Performance tests after implementations.

## Mapping to Functional Requirements
FR-001: 5,15  
FR-002: 7,17  
FR-003: 25,26,27  
FR-004: 16,28,33  
FR-005: 8,18,30  
FR-006: 9,19,30  
FR-007: 10,20  
FR-008: 13,23  
FR-009: 12,22  
FR-010: 13,23  
FR-011: 12,22,23  
FR-012: 13,23  
FR-013: 14,24,33  
FR-014: 14,24  
FR-015: 25,26,27  
FR-016: 26,28,30 (UI update)  
FR-017: 17 (position logic)  
FR-018: 16–23 (auth checks)  
FR-019: 7 (validation)  
FR-020: 25–27  
FR-021: 11–13,21–23  
FR-022: 14,24,33  
FR-023: 10,20  
FR-024: 7,17 (duplicate flag)  
FR-025: 23,35,36  
FR-026: 7 (invalid URL), utils tests 4  
FR-027: 13,18–20,23 (immutability guards)  
FR-028: 28–33 (UI separation)  

## Risk & Mitigation
| Risk | Mitigation |
|------|------------|
| In-process metadata queue may block under load | Abstract worker behind simple interface; replace with external queue later |
| Slug collision loop edge cases | Limit attempts to 5 then regenerate pattern with extra char |
| Race conditions on position | Transaction ensures atomic MAX+1 |

## Done Criteria
- All tests green.
- All FRs mapped and implemented.
- Performance + slug latency tests pass.
- Logging retention script stub present.
