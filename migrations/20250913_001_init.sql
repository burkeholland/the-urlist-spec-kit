-- Initial schema migration
-- Date: 2025-09-13

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid

-- Tables
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

-- Trigger function & triggers for updated_at (T012 will append if not present)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lists_updated_at
BEFORE UPDATE ON lists
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_url_entries_updated_at
BEFORE UPDATE ON url_entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
