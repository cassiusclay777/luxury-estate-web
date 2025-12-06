-- =============================================================================
-- PUSH NOTIFICATIONS & PRICE TRACKING
-- =============================================================================
-- Tables and functions for:
-- 1. Push notification subscriptions
-- 2. Property price history tracking
-- 3. Price drop detection
--
-- @author LuxEstate Team 2025
-- @license MIT
-- =============================================================================

-- =============================================================================
-- TABLE: push_subscriptions
-- =============================================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
  ON push_subscriptions(endpoint);

-- =============================================================================
-- TABLE: property_price_history
-- =============================================================================

CREATE TABLE IF NOT EXISTS property_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  old_price NUMERIC(12, 2) NOT NULL,
  new_price NUMERIC(12, 2) NOT NULL,
  price_change NUMERIC(12, 2) GENERATED ALWAYS AS (new_price - old_price) STORED,
  price_change_percent NUMERIC(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN old_price > 0 THEN ((new_price - old_price) / old_price) * 100
      ELSE 0
    END
  ) STORED,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for price drop queries
CREATE INDEX IF NOT EXISTS idx_price_history_property_id
  ON property_price_history(property_id);

CREATE INDEX IF NOT EXISTS idx_price_history_changed_at
  ON property_price_history(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_price_change
  ON property_price_history(price_change)
  WHERE price_change < 0; -- Only index price drops

-- =============================================================================
-- FUNCTION: Track price changes automatically
-- =============================================================================

CREATE OR REPLACE FUNCTION track_property_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if price actually changed
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO property_price_history (property_id, old_price, new_price)
    VALUES (NEW.id, OLD.price, NEW.price);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on properties table
DROP TRIGGER IF EXISTS trigger_track_price_change ON properties;

CREATE TRIGGER trigger_track_price_change
  AFTER UPDATE OF price ON properties
  FOR EACH ROW
  EXECUTE FUNCTION track_property_price_change();

-- =============================================================================
-- FUNCTION: Get recent price drops
-- =============================================================================

CREATE OR REPLACE FUNCTION get_recent_price_drops(hours_ago INTEGER DEFAULT 24)
RETURNS TABLE (
  id UUID,
  title TEXT,
  old_price NUMERIC,
  new_price NUMERIC,
  price_change NUMERIC,
  price_change_percent NUMERIC,
  image_url TEXT,
  changed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    ph.old_price,
    ph.new_price,
    ph.price_change,
    ph.price_change_percent,
    p.image_url,
    ph.changed_at
  FROM property_price_history ph
  JOIN properties p ON ph.property_id = p.id
  WHERE
    ph.changed_at > NOW() - (hours_ago || ' hours')::INTERVAL
    AND ph.price_change < 0 -- Only price drops
    AND p.status = 'active' -- Only active properties
  ORDER BY ph.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_price_history ENABLE ROW LEVEL SECURITY;

-- Push subscriptions: Users can manage their own
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions
CREATE POLICY "Service role can manage all subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Price history: Public read access
CREATE POLICY "Price history is publicly readable"
  ON property_price_history
  FOR SELECT
  USING (true);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE push_subscriptions IS 'Web Push notification subscriptions';
COMMENT ON TABLE property_price_history IS 'Tracks all property price changes';
COMMENT ON FUNCTION get_recent_price_drops IS 'Returns properties with price drops in the last N hours';
COMMENT ON FUNCTION track_property_price_change IS 'Automatically logs price changes to history table';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON push_subscriptions TO anon, authenticated;
GRANT SELECT ON property_price_history TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_recent_price_drops TO anon, authenticated;
