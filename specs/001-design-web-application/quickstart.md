# Quickstart – The Urlist

## Prerequisites
- Node.js 20+
- PostgreSQL 15+ running locally (database: `urlist_dev`)
- PNPM installed (`corepack enable` recommended)

## 1. Install Dependencies
```powershell
pnpm install
```

## 2. Configure Environment
Create `.env.local`:
```
DATABASE_URL=postgres://user:password@localhost:5432/urlist_dev
SESSION_COOKIE_NAME=creator_session
METADATA_FETCH_TIMEOUT_MS=5000
```

## 3. Generate shadcn/ui Components
Add required primitives (incrementally):
```powershell
npx shadcn@latest add button input form toast dialog badge separator
```

## 4. Run Database Migrations
(Placeholder – migrations not yet generated.) After creating migration SQL files in `migrations/`:
```powershell
psql $env:DATABASE_URL -f migrations/202509131200_init.sql
```

## 5. Start Dev Server
```powershell
pnpm dev
```
Open http://localhost:3000

## 6. Create a Draft List (Manual cURL)
```powershell
curl -i -X POST http://localhost:3000/api/lists
```
Capture `Set-Cookie` with `creator_session_id` for subsequent requests.

## 7. Add URL Entry
```powershell
curl -i -H "Cookie: creator_session_id=<uuid>" -H "Content-Type: application/json" -d '{"url":"https://example.com"}' http://localhost:3000/api/lists/<listId>/entries
```

## 8. Publish List
```powershell
curl -i -H "Cookie: creator_session_id=<uuid>" -X POST http://localhost:3000/api/lists/<listId>/publish
```

## 9. Public View
```powershell
curl -i http://localhost:3000/api/public/lists/<slug>
```

## Testing (Planned)
- Contract tests: `/tests/contract` (API shape) – run via `pnpm test:contract`
- Integration: DB + route handlers – `pnpm test:integration`
- Unit: Pure functions (URL normalization, slug generator)

## Performance Checks
- Slug availability p95 < 1s (capture via simple timer around availability endpoint)
- DB query count per list render ≤ 3 (list, entries, optional metadata inlined)

## Cleanup
To reset DB:
```powershell
psql $env:DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## Troubleshooting
| Issue | Resolution |
|-------|------------|
| Connection refused | Verify Postgres running & `DATABASE_URL` correct |
| Metadata timeouts | Increase `METADATA_FETCH_TIMEOUT_MS` cautiously |
| Slug conflicts | Retry with different slug or let system autogenerate |

## Next Steps
Proceed to generate `tasks.md` via /tasks command (not automated here). Then implement tests first.
