-- Demo Users SQL Script
-- Run this in Supabase SQL Editor to create demo user profiles
-- All users have the same password: Demo@123

-- IMPORTANT: Do NOT create users directly in auth.users via SQL
-- Supabase Auth uses its own password hashing (PBKDF2 with SHA256)
-- which is not compatible with PostgreSQL's crypt() function.
--
-- CORRECT APPROACH:
-- 1. Create users manually in Supabase Dashboard (Authentication > Users)
--    with email and password: Demo@123
-- 2. Then run this SQL script to create their profiles with appropriate roles

-- Create Voter Profile (demo.voter@example.com)
INSERT INTO public.profiles (id, full_name, email, role, is_approved, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo.voter@example.com'),
  'Demo Voter',
  'demo.voter@example.com',
  'voter',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'voter',
  is_approved = true;

-- Create Election Creator Profile (demo.creator@example.com)
INSERT INTO public.profiles (id, full_name, email, role, is_approved, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo.creator@example.com'),
  'Demo Election Creator',
  'demo.creator@example.com',
  'election_creator',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'election_creator',
  is_approved = true;

-- Create Super Admin Profile (demo.admin@example.com)
INSERT INTO public.profiles (id, full_name, email, role, is_approved, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo.admin@example.com'),
  'Demo Super Admin',
  'demo.admin@example.com',
  'super_admin',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_approved = true;
