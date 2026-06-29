-- Sprint 10: Avatars storage bucket + RLS policies
-- Apply via Supabase Dashboard → SQL Editor

-- ── 1. Create the avatars bucket ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,           -- public: URLs are readable without auth
  5242880,        -- 5 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 2. RLS policies on storage.objects ───────────────────────────────────────
-- File paths follow the pattern: {user_id}/avatar.{ext}
-- (storage.foldername(name))[1] extracts the first path segment = user_id

-- Public read: anyone can view avatar images (bucket is public)
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Authenticated upload: users can insert only into their own folder
CREATE POLICY "avatars: owner can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated update: users can overwrite only their own file
CREATE POLICY "avatars: owner can update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated delete: users can remove only their own file
CREATE POLICY "avatars: owner can delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── 3. Verify ─────────────────────────────────────────────────────────────────
-- Run separately to confirm setup is correct:
--
--   SELECT id, name, public, file_size_limit, allowed_mime_types
--   FROM storage.buckets
--   WHERE id = 'avatars';
--
--   SELECT policyname, cmd, roles, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects'
--     AND policyname LIKE 'avatars:%'
--   ORDER BY cmd;
