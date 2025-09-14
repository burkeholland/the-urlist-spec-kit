# Data Model – The Urlist

## ERD (Conceptual)
```
List (1) ──< URL_Entry
List (1) ──< Action_Log
```

## Tables
### lists
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK default gen_random_uuid() | Primary identifier |
| creator_session_id | uuid | NOT NULL | Opaque creator identity |
| slug | text | UNIQUE WHERE status='published' (partial) | Nullable until publish |
| status | text | NOT NULL CHECK (status IN ('draft','published')) | Publication state |
| created_at | timestamptz | NOT NULL DEFAULT now() | Immutable |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Updated trigger |
| published_at | timestamptz | NULL | Set on publish |
| deleted_at | timestamptz | NULL | Soft delete for auditing (public 404) |

Indexes:
- `lists_slug_unique_published` UNIQUE (lower(slug)) WHERE status='published' AND deleted_at IS NULL
- `lists_creator_session_idx` (creator_session_id)

### url_entries
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK default gen_random_uuid() | |
| list_id | uuid | NOT NULL REFERENCES lists(id) ON DELETE CASCADE | |
| original_url | text | NOT NULL | Raw user input (validated) |
| normalized_url | text | NOT NULL | For duplicate warning (lowercased host etc.) |
| title | text | NULL | User editable / fetched |
| description | text | NULL | User editable / fetched |
| fetch_status | text | NOT NULL CHECK (fetch_status IN ('pending','success','failed')) | Async enrichment state |
| position | integer | NOT NULL | Insertion order |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

Indexes:
- `url_entries_list_position_idx` (list_id, position)
- `url_entries_list_fetch_status_idx` (list_id, fetch_status)
- `url_entries_list_normurl_idx` (list_id, normalized_url)

### actions_log
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | bigserial | PK | |
| list_id | uuid | NOT NULL REFERENCES lists(id) ON DELETE CASCADE | |
| event | text | NOT NULL CHECK (event IN ('publish','delete')) | |
| slug | text | NULL | Snapshot of slug at event |
| created_at | timestamptz | NOT NULL DEFAULT now() | Timestamp |

Index: `actions_log_list_id_idx` (list_id)
Retention: 90 days (cleanup job planned).

## State Transitions
List.status: `draft` → `published` (one-way). Delete sets `deleted_at`; status remains `published` or `draft` but public queries filter `deleted_at IS NULL`.

URL_Entry.fetch_status: `pending` → `success|failed` (terminal). Re-fetch attempt (not in initial scope) would create new cycle; out of scope.

## Validation Rules
- URL length ≤ 2000 chars; protocol http/https only.
- Slug: lowercase alphanumeric + hyphen, 3–40 chars.
- Duplicate handling: If another entry with same `normalized_url` exists for list, still insert; API returns `duplicate=true` flag.
- Publish requires: list.status='draft', ≥1 url_entries, slug (custom or generated) available.
- No mutations allowed (except delete) once published.

## DDL (Initial Migration Sketch)
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid

CREATE TABLE lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_session_id uuid NOT NULL,
  slug text,
  status text NOT NULL CHECK (status IN ('draft','published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  deleted_at timestamptz
);

CREATE UNIQUE INDEX lists_slug_unique_published ON lists (lower(slug))
  WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX lists_creator_session_idx ON lists (creator_session_id);

CREATE TABLE url_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  original_url text NOT NULL,
  normalized_url text NOT NULL,
  title text,
  description text,
  fetch_status text NOT NULL CHECK (fetch_status IN ('pending','success','failed')),
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX url_entries_list_position_idx ON url_entries (list_id, position);
CREATE INDEX url_entries_list_fetch_status_idx ON url_entries (list_id, fetch_status);
CREATE INDEX url_entries_list_normurl_idx ON url_entries (list_id, normalized_url);

CREATE TABLE actions_log (
  id bigserial PRIMARY KEY,
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('publish','delete')),
  slug text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX actions_log_list_id_idx ON actions_log (list_id);
```

## Query Patterns
- Fetch draft list + entries (creator view): single SELECT with join ordered by position.
- Public list view: SELECT list (status='published', deleted_at IS NULL) + entries.
- Slug availability: SELECT 1 FROM lists WHERE lower(slug)=lower($1) AND status='published' AND deleted_at IS NULL.
- Insert entry: use transaction to compute next position.
- Publish list: transaction: ensure requirements met, set slug (if needed), set published_at, update status.

## Edge Case Handling
- Concurrent slug claims: unique partial index causes one success; loser retries with conflict error.
- Rapid add/remove: position determined in transaction prevents duplication.
- Delete after publish: sets deleted_at; public fetch returns 404 by filtering.

## Future Considerations
- Tagging or categorization (not in scope)
- Reordering support (will require position reindex strategy)
- Soft vs hard delete retention beyond 90 days (policy extension)
