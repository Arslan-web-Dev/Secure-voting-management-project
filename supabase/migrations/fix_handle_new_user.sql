-- Fix: handle_new_user trigger robustly handles NULL/missing metadata
-- Run this in your Supabase Dashboard > SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User'),
    new.email,
    new.raw_user_meta_data->>'phone',
    COALESCE(
      (new.raw_user_meta_data->>'role')::user_role,
      'voter'
    )
  )
  ON CONFLICT (id) DO NOTHING; -- Idempotent: won't fail if profile already exists
  RETURN new;
EXCEPTION WHEN others THEN
  -- Log the error but don't block user creation
  RAISE WARNING 'handle_new_user failed for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
