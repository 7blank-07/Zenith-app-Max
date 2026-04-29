CREATE TABLE IF NOT EXISTS redeem_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  code_value text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('global', 'in', 'id', 'my', 'vn', 'th', 'ph', 'us', 'ae')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  published_at timestamptz NOT NULL DEFAULT NOW(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS redeem_codes_scope_status_published_idx
  ON redeem_codes (scope, status, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS redeem_codes_status_published_idx
  ON redeem_codes (status, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS redeem_codes_scope_updated_idx
  ON redeem_codes (scope, updated_at DESC NULLS LAST);

CREATE UNIQUE INDEX IF NOT EXISTS redeem_codes_active_scope_unique_idx
  ON redeem_codes (scope)
  WHERE status = 'active';

DROP TRIGGER IF EXISTS redeem_codes_set_updated_at ON redeem_codes;
CREATE TRIGGER redeem_codes_set_updated_at
  BEFORE UPDATE ON redeem_codes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();
