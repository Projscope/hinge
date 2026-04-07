-- ============================================================
-- myhinge — make profiles public by default
-- ============================================================

-- Change default so new rows are public
alter table public.public_profiles
  alter column is_public set default true;

-- Flip all existing profiles to public
update public.public_profiles set is_public = true where is_public = false;
