/*
# Waitlist referrals, positions and atomic joins

1. Changes
- `waitlist_submissions` gains `position` (sequential, unique),
  `referral_code` (short, unique) and `referred_by` (nullable referral code).
- Existing rows are backfilled with positions and codes.
- `waitlist_join(...)` is a SECURITY DEFINER function that inserts and returns
  the new row, or returns the existing row when the lowercased email is already
  on the list. Positions come from a sequence, so concurrent signups can never
  share a number.
- A unique index on `lower(email)` makes duplicate detection case-insensitive.
- Anonymous visitors can only execute the join function and insert; they still
  cannot select rows directly.

2. Notes
- Safe to re-run: columns, indexes, constraints and functions are guarded.
- Existing rows keep their data; only new columns are filled.
*/

CREATE SEQUENCE IF NOT EXISTS public.waitlist_position_seq;

ALTER TABLE public.waitlist_submissions
  ADD COLUMN IF NOT EXISTS position bigint,
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by text;

-- Backfill existing rows in creation order as closely as the sequence allows.
UPDATE public.waitlist_submissions
SET position = nextval('public.waitlist_position_seq')
WHERE position IS NULL;

SELECT setval(
  'public.waitlist_position_seq',
  COALESCE((SELECT max(position) FROM public.waitlist_submissions), 0) + 1,
  false
);

ALTER TABLE public.waitlist_submissions
  ALTER COLUMN position SET DEFAULT nextval('public.waitlist_position_seq');

ALTER TABLE public.waitlist_submissions
  ALTER COLUMN position SET NOT NULL;

-- Stable, short codes for existing rows; new rows get a fresh code from the
-- column default. md5 of a UUID gives an 8-character code; the unique
-- constraint below catches the vanishingly unlikely collision.
UPDATE public.waitlist_submissions
SET referral_code = upper(substr(md5(id::text), 1, 8))
WHERE referral_code IS NULL;

ALTER TABLE public.waitlist_submissions
  ALTER COLUMN referral_code SET DEFAULT upper(substr(md5(gen_random_uuid()::text), 1, 8));

ALTER TABLE public.waitlist_submissions
  ALTER COLUMN referral_code SET NOT NULL;

-- Same email in different casing must resolve to the same waitlist entry.
UPDATE public.waitlist_submissions
SET email = lower(btrim(email))
WHERE email <> lower(btrim(email));

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_submissions_email_lower_key
  ON public.waitlist_submissions (lower(email));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_position_key'
  ) THEN
    ALTER TABLE public.waitlist_submissions
      ADD CONSTRAINT waitlist_position_key UNIQUE (position);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_referral_code_key'
  ) THEN
    ALTER TABLE public.waitlist_submissions
      ADD CONSTRAINT waitlist_referral_code_key UNIQUE (referral_code);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_referred_by_fkey'
  ) THEN
    ALTER TABLE public.waitlist_submissions
      ADD CONSTRAINT waitlist_referred_by_fkey
      FOREIGN KEY (referred_by)
      REFERENCES public.waitlist_submissions (referral_code)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS waitlist_submissions_referred_by_idx
  ON public.waitlist_submissions (referred_by);

-- Join (or re-open) a waitlist entry. The function owns the whole operation,
-- so an anon-key client never needs SELECT access to the table.
CREATE OR REPLACE FUNCTION public.waitlist_join(
  p_name text,
  p_email text,
  p_country text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_notify boolean DEFAULT false,
  p_source text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_referred_by text DEFAULT NULL
)
RETURNS TABLE (id uuid, "position" bigint, referral_code text, already_joined boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_name text := btrim(coalesce(p_name, ''));
  v_country text := nullif(upper(btrim(coalesce(p_country, ''))), '');
  v_phone text := nullif(btrim(coalesce(p_phone, '')), '');
  v_source text := nullif(btrim(coalesce(p_source, '')), '');
  v_referrer text := nullif(btrim(coalesce(p_referrer, '')), '');
  v_user_agent text := nullif(btrim(coalesce(p_user_agent, '')), '');
  v_referred_by text := nullif(upper(btrim(coalesce(p_referred_by, ''))), '');
  v_row public.waitlist_submissions%rowtype;
  v_attempt integer := 0;
BEGIN
  IF char_length(v_name) < 1 OR char_length(v_name) > 120 THEN
    RAISE EXCEPTION 'Invalid name' USING ERRCODE = '22023';
  END IF;

  IF char_length(v_email) < 3 OR char_length(v_email) > 320 OR position('@' IN v_email) = 0 THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
  END IF;

  SELECT w.* INTO v_row
  FROM public.waitlist_submissions w
  WHERE lower(w.email) = v_email
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_row.id, v_row.position, v_row.referral_code, true;
    RETURN;
  END IF;

  -- A referral code must belong to a real signup. If it does not, the
  -- SELECT INTO leaves v_referred_by NULL and the join proceeds unattributed.
  IF v_referred_by IS NOT NULL THEN
    SELECT w.referral_code INTO v_referred_by
    FROM public.waitlist_submissions w
    WHERE w.referral_code = v_referred_by
    LIMIT 1;
  END IF;

  LOOP
    v_attempt := v_attempt + 1;
    BEGIN
      INSERT INTO public.waitlist_submissions (
        email,
        name,
        country_code,
        phone,
        notify_opt_in,
        source,
        referrer,
        user_agent,
        referred_by
      ) VALUES (
        v_email,
        v_name,
        v_country,
        v_phone,
        coalesce(p_notify, false),
        v_source,
        v_referrer,
        v_user_agent,
        v_referred_by
      )
      RETURNING * INTO v_row;

      RETURN QUERY SELECT v_row.id, v_row.position, v_row.referral_code, false;
      RETURN;
    EXCEPTION WHEN unique_violation THEN
      -- A concurrent request may have inserted the same email between our
      -- lookup and insert. Return that winner instead of failing.
      SELECT w.* INTO v_row
      FROM public.waitlist_submissions w
      WHERE lower(w.email) = v_email
      LIMIT 1;

      IF FOUND THEN
        RETURN QUERY SELECT v_row.id, v_row.position, v_row.referral_code, true;
        RETURN;
      END IF;

      -- Otherwise the generated referral code collided; try a fresh one.
      IF v_attempt >= 5 THEN
        RAISE;
      END IF;
    END;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.waitlist_join(text, text, text, text, boolean, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.waitlist_join(text, text, text, text, boolean, text, text, text, text)
  TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON SEQUENCE public.waitlist_position_seq TO anon, authenticated, service_role;
GRANT INSERT ON public.waitlist_submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist_submissions TO service_role;

COMMENT ON FUNCTION public.waitlist_join(text, text, text, text, boolean, text, text, text, text) IS
  'Atomically joins or reopens a waitlist entry and returns position + referral code.';
COMMENT ON COLUMN public.waitlist_submissions.referral_code IS
  'Short public code used in /?ref=CODE referral links.';
COMMENT ON COLUMN public.waitlist_submissions.position IS
  'Sequential waitlist position assigned from waitlist_position_seq.';
