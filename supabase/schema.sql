-- SQL Schema for Secure Online Election Management System

-- 1. Profiles Table (Extends Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'voter' CHECK (role IN ('super_admin', 'election_creator', 'voter')),
  organization TEXT,
  election_purpose TEXT,
  is_approved BOOLEAN DEFAULT FALSE, -- Specifically for election_creator
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Elections Table
CREATE TABLE IF NOT EXISTS elections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  max_voters INTEGER NOT NULL DEFAULT 1000,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'completed', 'cancelled')),
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  designation TEXT,
  manifesto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Voter Registrations Table
CREATE TABLE IF NOT EXISTS voter_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  secret_id_hash TEXT, -- Hashed secret ID for verification
  masked_secret_id TEXT, -- e.g., ****7821
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'waitlisted', 'rejected')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(election_id, user_id)
);

-- 5. Votes Table (Anonymous)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  voter_hash TEXT NOT NULL, -- To prevent double voting without linking to user_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(election_id, voter_hash)
);

-- 6. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all (to see election creators), but only update their own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Elections: Everyone can view published/active/completed elections
DROP POLICY IF EXISTS "Viewable elections" ON elections;
DROP POLICY IF EXISTS "Creators can manage their elections" ON elections;
DROP POLICY IF EXISTS "Admins can manage elections" ON elections;
CREATE POLICY "Viewable elections" ON elections FOR SELECT USING (status != 'draft' OR creator_id = auth.uid());
CREATE POLICY "Creators can manage their elections" ON elections FOR ALL USING (creator_id = auth.uid());
CREATE POLICY "Admins can manage elections" ON elections FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Candidates: Everyone can view
DROP POLICY IF EXISTS "Candidates are viewable by everyone" ON candidates;
DROP POLICY IF EXISTS "Creators can manage candidates" ON candidates;
DROP POLICY IF EXISTS "Admins can manage candidates" ON candidates;
CREATE POLICY "Candidates are viewable by everyone" ON candidates FOR SELECT USING (true);
CREATE POLICY "Creators can manage candidates" ON candidates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM elections
    WHERE elections.id = candidates.election_id AND elections.creator_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage candidates" ON candidates FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Voter Registrations: Users can see their own, admins/creators see all for their election
DROP POLICY IF EXISTS "Voters see own registration" ON voter_registrations;
DROP POLICY IF EXISTS "Creators see their election registrations" ON voter_registrations;
DROP POLICY IF EXISTS "Voters can insert own registration" ON voter_registrations;
DROP POLICY IF EXISTS "Creators can update registrations" ON voter_registrations;
DROP POLICY IF EXISTS "Admins can manage registrations" ON voter_registrations;

CREATE POLICY "Voters see own registration" ON voter_registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Creators see their election registrations" ON voter_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM elections WHERE elections.id = voter_registrations.election_id AND elections.creator_id = auth.uid())
);
CREATE POLICY "Voters can insert own registration" ON voter_registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Creators can update registrations" ON voter_registrations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM elections WHERE elections.id = voter_registrations.election_id AND elections.creator_id = auth.uid())
);
CREATE POLICY "Admins can manage registrations" ON voter_registrations FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Votes: Blind insert, and SELECT for results
DROP POLICY IF EXISTS "Anonymous voting insert" ON votes;
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON votes;
CREATE POLICY "Anonymous voting insert" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);

-- Audit Logs
DROP POLICY IF EXISTS "Audit logs are viewable by everyone" ON audit_logs;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON audit_logs;
CREATE POLICY "Audit logs are viewable by everyone" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- TRIGGERS
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone, organization, election_purpose)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'voter'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'organization',
    new.raw_user_meta_data->>'election_purpose'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
