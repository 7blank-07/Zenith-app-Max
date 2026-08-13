CREATE TABLE IF NOT EXISTS url_redirects (
  id bigserial PRIMARY KEY,
  old_url text NOT NULL UNIQUE,
  new_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
