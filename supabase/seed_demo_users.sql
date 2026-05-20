-- SQL script to seed test users into auth.users (Supabase Auth)
-- Run this in your Supabase Dashboard > SQL Editor to initialize or reset demo accounts.
-- This script creates the three demo roles with password "demo123" (minimum length requirement).

-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function to safely insert/update demo users
CREATE OR REPLACE FUNCTION public.seed_demo_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- Encrypt password using Blowfish (BF) - standard for Supabase auth.users
  v_encrypted_password := crypt(p_password, gen_salt('bf', 8));
  
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    -- Generate new UUID for user
    v_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token
    )
    VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      p_email,
      v_encrypted_password,
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', p_name, 'role', p_role),
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );
    
    -- Profiles table is automatically populated by on_auth_user_created trigger!
    
  ELSE
    -- Update password and metadata for existing user
    UPDATE auth.users 
    SET encrypted_password = v_encrypted_password,
        raw_user_meta_data = jsonb_build_object('name', p_name, 'role', p_role),
        updated_at = NOW()
    WHERE id = v_user_id;

    -- Update profile role and name (trigger might not fire on update)
    UPDATE public.profiles
    SET role = p_role::user_role,
        name = p_name,
        email = p_email
    WHERE id = v_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Run the helper to insert/reset our 3 demo accounts
-- Password for all accounts: "demo123"
SELECT public.seed_demo_user('admin@voting.com', 'demo123', 'Demo Admin', 'super_admin');
SELECT public.seed_demo_user('creator@voting.com', 'demo123', 'Demo Creator', 'election_creator');
SELECT public.seed_demo_user('voter@voting.com', 'demo123', 'Demo Voter', 'voter');

-- Seed Creator Request as approved for the creator so they are ready to go immediately!
INSERT INTO public.election_requests (creator_id, purpose, status)
SELECT id, 'Testing system features and managing campus elections.', 'approved'
FROM public.profiles
WHERE email = 'creator@voting.com'
ON CONFLICT (id) DO UPDATE SET status = 'approved';

-- Clean up the seed helper function
DROP FUNCTION IF EXISTS public.seed_demo_user(TEXT, TEXT, TEXT, TEXT);
