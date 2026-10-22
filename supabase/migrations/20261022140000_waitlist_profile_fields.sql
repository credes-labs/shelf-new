/*
# Waitlist: profile fields and a private counter

1. Changes
- `waitlist_submissions` gains the fields the signup form collects: name,
  country_code, phone, notify_opt_in, source, referrer and user_agent.
- Check constraints keep obviously bad values out even if a request bypasses
  the Next.js route.
- `waitlist_count()` returns only the number of signups. It runs as the table
  owner, so the public counter keeps working with an anon key without exposing
  any email addresses.

2. Security
- RLS stays enabled. Anonymous visitors may only INSERT.
- No SELECT / UPDATE / DELETE policies exist for anon or authenticated.
- The count function is the only read path, and it returns a single bigint.

3. Notes
- Safe to re-run: every statement is guarded.
- Existing rows keep NULL name/phone; the unique email constraint is unchanged.
*/

ALTER TABLE public.waitlist_submissions
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS notify_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS user_agent text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_name_length'
  ) THEN
    ALTER TABLE public.waitlist_submissions
      ADD CONSTRAINT waitlist_name_length
      CHECK (name IS NULL OR char_length(btrim(name)) BETWEEN 1 AND 120)
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_email_length'
  ) THEN
    ALTER TABLE public.waitlist_submissions
      ADD CONSTRAINT waitlist_email_length
      CHECK (char_length(btrim(email)) BETWEEN 3 AND 320)
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_phone_length'
  ) THEN
    ALTER TABLE public.waitlist_submissions
      ADD CONSTRAINT waitlist_phone_length
      CHECK (phone IS NULL OR char_length(phone) <= 32)
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_country_length'
  ) THEN
    ALTER TABLE public.waitlist_submissions
      ADD CONSTRAINT waitlist_country_length
      CHECK (country_code IS NULL OR char_length(country_code) <= 8)
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_source_length'
  ) THEN
    ALTER TABLE public.waitlist_submissions
      ADD CONSTRAINT waitlist_source_length
      CHECK (source IS NULL OR char_length(source) <= 200)
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_referrer_length'
  ) THEN
    ALTER TABLE public.waitlist_submissions
      ADD CONSTRAINT waitlist_referrer_length
      CHECK (referrer IS NULL OR char_length(referrer) <= 1000)
      NOT VALID;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS waitlist_submissions_created_at_idx
  ON public.waitlist_submissions (created_at DESC);

-- Public inserts: the route validates, and these checks are the backstop.
DROP POLICY IF EXISTS "Public can join waitlist" ON public.waitlist_submissions;
CREATE POLICY "Public can join waitlist"
  ON public.waitlist_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(btrim(email)) BETWEEN 3 AND 320
    AND (name IS NULL OR char_length(btrim(name)) BETWEEN 1 AND 120)
    AND (phone IS NULL OR char_length(phone) <= 32)
  );

CREATE OR REPLACE FUNCTION public.waitlist_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint FROM public.waitlist_submissions;
$$;

REVOKE ALL ON FUNCTION public.waitlist_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.waitlist_count() TO anon, authenticated, service_role;

-- Table privileges are usually inherited from Supabase's defaults, but making
-- them explicit keeps the anon-key fallback working on a plain Postgres too.
GRANT INSERT ON public.waitlist_submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist_submissions TO service_role;

COMMENT ON FUNCTION public.waitlist_count() IS
  'Public waitlist size. Returns a count only, never rows.';
