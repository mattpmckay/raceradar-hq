-- Sprint 10: Extended profile fields
-- Apply via Supabase Dashboard → SQL Editor

-- 1. Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name        text,
  ADD COLUMN IF NOT EXISTS last_name         text,
  ADD COLUMN IF NOT EXISTS date_of_birth     date,
  ADD COLUMN IF NOT EXISTS gender            text
    CONSTRAINT profiles_gender_check
    CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS country           text,
  ADD COLUMN IF NOT EXISTS state             text,
  ADD COLUMN IF NOT EXISTS city              text,
  ADD COLUMN IF NOT EXISTS preferred_sports  text[],
  ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- 2. Update auto-create trigger to capture first / last name from sign-up metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_first text;
  v_last  text;
  v_full  text;
BEGIN
  v_first := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '')), '');
  v_last  := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'last_name',  '')), '');
  v_full  := NULLIF(TRIM(CONCAT_WS(' ', v_first, v_last)), '');

  INSERT INTO public.profiles (
    id, first_name, last_name, full_name, created_at, updated_at
  ) VALUES (
    NEW.id,
    v_first,
    v_last,
    COALESCE(v_full, NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '')),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name  = COALESCE(EXCLUDED.last_name,  profiles.last_name),
        full_name  = COALESCE(EXCLUDED.full_name,  profiles.full_name),
        updated_at = NOW();

  RETURN NEW;
END;
$$;
