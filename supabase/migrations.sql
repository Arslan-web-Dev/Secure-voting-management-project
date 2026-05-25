-- ============================================================
-- SecureVote — Schema Migrations
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Fix 1: Add pending_approval and rejected to elections status
ALTER TABLE elections DROP CONSTRAINT IF EXISTS elections_status_check;
ALTER TABLE elections ADD CONSTRAINT elections_status_check 
  CHECK (status IN ('draft', 'pending_approval', 'published', 'active', 'completed', 'cancelled', 'rejected'));

-- Fix 2: Add rejection_reason column to elections (if not exists)
ALTER TABLE elections ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Fix 3: Add creator_email to elections for notification lookups
-- (elections already has creator_id which joins to profiles.email)

-- Fix 4: Auto-transition elections based on dates
-- This function is called by a scheduled cron or manually
CREATE OR REPLACE FUNCTION public.auto_transition_election_status()
RETURNS void AS $$
DECLARE
  rec RECORD;
BEGIN
  -- published → active (when start_date is reached)
  FOR rec IN
    SELECT id, title FROM elections
    WHERE status = 'published'
      AND start_date <= NOW()
      AND is_locked = true
  LOOP
    UPDATE elections SET status = 'active' WHERE id = rec.id;
    INSERT INTO audit_logs (action, metadata, ip_address, timestamp)
    VALUES ('ELECTION_AUTO_ACTIVATED', 
            jsonb_build_object('election_id', rec.id, 'title', rec.title), 
            'system', NOW());
  END LOOP;

  -- active → completed (when end_date is passed)
  FOR rec IN
    SELECT id, title FROM elections
    WHERE status = 'active'
      AND end_date <= NOW()
  LOOP
    UPDATE elections SET status = 'completed' WHERE id = rec.id;
    INSERT INTO audit_logs (action, metadata, ip_address, timestamp)
    VALUES ('ELECTION_AUTO_COMPLETED', 
            jsonb_build_object('election_id', rec.id, 'title', rec.title), 
            'system', NOW());
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 5: Schedule the auto-transition (requires pg_cron extension)
-- Enable pg_cron: Supabase Dashboard → Database → Extensions → pg_cron
-- Then run:
-- SELECT cron.schedule('auto-transition-elections', '*/15 * * * *', 'SELECT public.auto_transition_election_status()');

-- Fix 6: Trigger-based auto-transition (fires on any election update as backup)
CREATE OR REPLACE FUNCTION public.check_election_status_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- published + locked + start_date passed → active
  IF NEW.status = 'published' AND NEW.is_locked = true AND NEW.start_date <= NOW() THEN
    NEW.status := 'active';
  END IF;
  -- active + end_date passed → completed
  IF NEW.status = 'active' AND NEW.end_date <= NOW() THEN
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_election_status_check ON elections;
CREATE TRIGGER trg_election_status_check
  BEFORE UPDATE ON elections
  FOR EACH ROW EXECUTE FUNCTION public.check_election_status_on_update();

-- Fix 7: Also check status on SELECT (view) via a function voters can call
CREATE OR REPLACE FUNCTION public.refresh_election_statuses()
RETURNS TABLE(updated_count INTEGER) AS $$
DECLARE
  cnt INTEGER := 0;
BEGIN
  -- Activate elections
  UPDATE elections 
  SET status = 'active'
  WHERE status = 'published' AND is_locked = true AND start_date <= NOW();
  GET DIAGNOSTICS cnt = ROW_COUNT;
  
  -- Complete elections
  UPDATE elections 
  SET status = 'completed'
  WHERE status = 'active' AND end_date <= NOW();
  GET DIAGNOSTICS cnt = cnt + ROW_COUNT;
  
  RETURN QUERY SELECT cnt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow anyone to call refresh (safe — only updates status based on dates)
GRANT EXECUTE ON FUNCTION public.refresh_election_statuses() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_transition_election_status() TO anon, authenticated;
