# Implementation Plan: The Urlist – Create & Share URL Collections

**Branch**: `001-design-web-application` | **Date**: 2025-09-13 | **Spec**: `spec.md`
**Input**: Feature specification from `/specs/001-design-web-application/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
2. Fill Technical Context (scan for NEEDS CLARIFICATION) – none outstanding; spec resolved ambiguities.
3. Evaluate Constitution Check section below – initial pass documented.
4. Execute Phase 0 → research.md (created)
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, copilot agent file (skipped agent file per instruction absence)
6. Re-evaluate Constitution Check section – post-design pass.
7. Plan Phase 2 → Describe task generation approach (below)
8. STOP - Ready for /tasks command
```

## Summary
Users create draft URL lists, add/edit/delete URL entries with async metadata enrichment, assign or auto-generate unique slug, and publish lists for public read-only access; published lists become immutable (except deletion). Stack: Next.js App Router (RSC-first), shadcn/ui for components, PostgreSQL for persistence, strict constitutional principles (simplicity, no premature abstraction, direct SQL).

## Technical Context
**Language/Version**: TypeScript (TS 5.x) / Node runtime via Next.js 15
**Primary Dependencies**: `next`, `react`, `shadcn/ui` components (installed ad hoc), `class-variance-authority`, `lucide-react`
**Storage**: PostgreSQL (single primary database)
**Testing**: Vitest/Jest (NEEDS CLARIFICATION) → Decision: Use Jest + @testing-library/react + supertest (chosen due to common Next.js ecosystem). 
**Target Platform**: Web (Next.js App Router, server-rendered + edge-capable) 
**Project Type**: web (frontend + backend unified in Next.js app directory) 
**Performance Goals**: Slug validation <1s p95, metadata fetch concurrency efficient (target <200ms DB round trips p95 for list CRUD operations excluding external fetch). 
**Constraints**: List publish blocked until at least 1 entry; metadata fetch timeout 5s; duplicate URL allowed; insertion order stable. 
**Scale/Scope**: Initial small scale (<10k lists) - design indices to scale to 100k lists & 1M URL entries.

## Constitution Check
**Simplicity**:
- Projects: 1 (Next.js app) ✓
- Direct framework usage (no wrapper abstractions) ✓
- Single data model layer (SQL migrations + lightweight query helpers) ✓
- Avoiding patterns (no repository/UoW/ORM) ✓

**Architecture**:
- Library per feature: Not required; single app boundary acceptable ✓
- Additional libraries: none introduced ✓
- CLI: Not required in scope ✓

**Testing (NON-NEGOTIABLE)**:
- TDD intention: contract & integration tests precede implementation ✓ (to be enforced in tasks)
- Real DB (Postgres test instance) ✓
- Order: contract → integration → unit planned ✓

**Observability**:
- Structured logging plan (JSON via simple logger wrapper around console on server) ✓
- Error context: route handlers will wrap DB ops with contextual error classes ✓

**Versioning**:
- App version tracked via `package.json` (semver) ✓
- Breaking schema changes via migrations with backward-compatible step where feasible ✓

No violations requiring Complexity Tracking.

## Project Structure
Using existing Next.js App Router structure (Option 1 variant embedded in `app/`).

**Structure Decision**: Single project (Next.js app) + `lib/` for DB and domain logic.

## Phase 0: Outline & Research
See `research.md` for decisions on metadata fetching, slug generation, session identification, and component selection.

## Phase 1: Design & Contracts
Artifacts produced: `data-model.md`, `contracts/*.md`, `quickstart.md`.

## Phase 2: Task Planning Approach
**Task Generation Strategy**:
- Each functional requirement FR-001..FR-028 mapped to one or more tasks (test-first, then implementation).
- Endpoints (create list, add entry, edit entry, delete entry, delete list, publish list, slug availability check, view list) each yield: contract test task [P], integration test task, implementation task.
- Data model tasks: migrations (lists, url_entries, actions_log), index creation, constraints validation test.
- UI tasks: minimal RSC page for draft management, client components only for interactive entry forms.

**Ordering Strategy**:
1. Migrations & DB client
2. Contract tests (API shape)
3. Route handlers (server actions / handlers) to satisfy contracts
4. Metadata fetch worker utility (async enrichment) with test harness
5. UI server components (list view) then client components (entry form)
6. Slug uniqueness & publication flow
7. Logging and audit tests
8. Performance/query count guards

Estimated tasks: ~32 (will enumerate in `tasks.md` by /tasks command).

## Phase 3+: Future Implementation
Out of current plan scope.

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| (none) |  |  |

## Progress Tracking
**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - approach documented)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution v3.0.0 - See `/memory/constitution.md`*
