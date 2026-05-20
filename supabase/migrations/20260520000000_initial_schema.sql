-- Safe DROP statements to allow re-running the script
DROP TRIGGER IF EXISTS on_voter_registered ON public.voter_registrations CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.generate_secret_voter_id() CASCADE;
DROP FUNCTION IF EXISTS public.cast_vote(UUID, UUID, TEXT) CASCADE;

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.secret_voter_ids CASCADE;
DROP TABLE IF EXISTS public.voter_registrations CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.elections CASCADE;
DROP TABLE IF EXISTS public.election_requests CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS election_status CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- 1. Custom Types & Enums
CREATE TYPE user_role AS ENUM ('super_admin', 'election_creator', 'voter');
CREATE TYPE election_status AS ENUM ('draft', 'upcoming', 'active', 'registration_closed', 'completed');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'voter',
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  organization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Election Requests Table (Admin Approval Module)
CREATE TABLE public.election_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  purpose TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Elections Table
CREATE TABLE public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  max_voters INTEGER NOT NULL,
  status election_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Candidates Table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  designation TEXT,
  manifesto TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Voter Registrations Table (Waitlist & Locking)
CREATE TABLE public.voter_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_waitlisted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(election_id, voter_id) -- Prevent duplicate registration
);

-- 7. Secret Voter IDs Table
CREATE TABLE public.secret_voter_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  secret_code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(election_id, voter_id) -- One secret ID per voter per election
);

-- 8. Votes Table (Anonymous)
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  -- Deliberately omitting voter_id to ensure anonymity
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_voter_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------

-- Profiles: Users can read all profiles (needed for displays), but only update their own.
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Election Requests: Creators can see their own, Admins can see/update all.
CREATE POLICY "Creators can view own requests" ON public.election_requests FOR SELECT USING (auth.uid() = creator_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "Creators can insert requests" ON public.election_requests FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Admins can update requests" ON public.election_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Elections: Anyone can view active/completed. Admins/Creators can view all. Only creators/admins can insert/update.
CREATE POLICY "Elections are viewable by everyone" ON public.elections FOR SELECT USING (status != 'draft' OR auth.uid() = creator_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "Creators can insert own elections" ON public.elections FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own elections" ON public.elections FOR UPDATE USING (auth.uid() = creator_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Candidates: Viewable by everyone. Modifiable by the election creator.
CREATE POLICY "Candidates viewable by everyone" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Creators can insert candidates" ON public.candidates FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.elections WHERE id = election_id AND creator_id = auth.uid()));
CREATE POLICY "Creators can update candidates" ON public.candidates FOR UPDATE USING (EXISTS (SELECT 1 FROM public.elections WHERE id = election_id AND creator_id = auth.uid()));
CREATE POLICY "Creators can delete candidates" ON public.candidates FOR DELETE USING (EXISTS (SELECT 1 FROM public.elections WHERE id = election_id AND creator_id = auth.uid()));

-- Voter Registrations: Users can see their own. Creators/Admins can see for their elections.
CREATE POLICY "Voters can view own registrations" ON public.voter_registrations FOR SELECT USING (auth.uid() = voter_id OR EXISTS (SELECT 1 FROM public.elections WHERE id = election_id AND creator_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "Voters can register themselves" ON public.voter_registrations FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Secret Voter IDs: Voters can ONLY see their own. Never update/delete directly from client.
CREATE POLICY "Voters can view own secret ID" ON public.secret_voter_ids FOR SELECT USING (auth.uid() = voter_id);
-- (Insertions done via secure backend/Edge Function triggers)

-- Votes: Viewable by everyone (for live results). Insertable by anyone holding a valid secret ID (checked via DB function, not pure RLS).
CREATE POLICY "Votes viewable by everyone" ON public.votes FOR SELECT USING (true);
-- Voting logic should be handled by a Postgres Function to ensure transaction safety and anonymity.

-- Audit Logs: Insertable by anyone (via triggers usually), viewable only by Admins.
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "Anyone can insert logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- -------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
-- -------------------------------------------------------------

-- Trigger: Automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_name TEXT;
  v_phone TEXT;
BEGIN
  -- Safe name resolution
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User');
  v_phone := new.raw_user_meta_data->>'phone';
  
  -- Safe role resolution
  BEGIN
    v_role := (new.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'voter'::user_role;
  END;
  
  IF v_role IS NULL THEN
    v_role := 'voter'::user_role;
  END IF;

  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (new.id, v_name, new.email, v_phone, v_role)
  ON CONFLICT (id) DO UPDATE 
  SET name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role;
      
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger: Automatically generate a unique secret voter ID when registering for an election
CREATE OR REPLACE FUNCTION public.generate_secret_voter_id()
RETURNS TRIGGER AS $$
DECLARE
  v_secret_code TEXT;
BEGIN
  -- Generate unique code POLL-YYYY-XXXX
  v_secret_code := 'POLL-' || to_char(NOW(), 'YYYY') || '-' || floor(random() * (9999-1000+1) + 1000)::text;
  
  -- Ensure it is unique
  WHILE EXISTS (SELECT 1 FROM public.secret_voter_ids WHERE secret_code = v_secret_code) LOOP
    v_secret_code := 'POLL-' || to_char(NOW(), 'YYYY') || '-' || floor(random() * (9999-1000+1) + 1000)::text;
  END LOOP;

  INSERT INTO public.secret_voter_ids (election_id, voter_id, secret_code)
  VALUES (new.election_id, new.voter_id, v_secret_code);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_voter_registered
  AFTER INSERT ON public.voter_registrations
  FOR EACH ROW EXECUTE PROCEDURE public.generate_secret_voter_id();

-- Secure Function: Cast a Vote
CREATE OR REPLACE FUNCTION public.cast_vote(p_election_id UUID, p_candidate_id UUID, p_secret_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_secret_id UUID;
  v_is_used BOOLEAN;
  v_election_status election_status;
BEGIN
  -- Check if election is active
  SELECT status INTO v_election_status FROM public.elections WHERE id = p_election_id;
  IF v_election_status != 'active' THEN
    RAISE EXCEPTION 'Election is not currently active.';
  END IF;

  -- Validate secret code
  SELECT id, is_used INTO v_secret_id, v_is_used 
  FROM public.secret_voter_ids 
  WHERE election_id = p_election_id AND secret_code = p_secret_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid secret code.';
  END IF;

  IF v_is_used THEN
    RAISE EXCEPTION 'Secret code has already been used.';
  END IF;

  -- Insert anonymous vote
  INSERT INTO public.votes (election_id, candidate_id) VALUES (p_election_id, p_candidate_id);

  -- Mark secret code as used
  UPDATE public.secret_voter_ids SET is_used = TRUE WHERE id = v_secret_id;

  -- Log action (anonymously)
  INSERT INTO public.audit_logs (action, details) 
  VALUES ('vote_cast', jsonb_build_object('election_id', p_election_id, 'candidate_id', p_candidate_id));

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
