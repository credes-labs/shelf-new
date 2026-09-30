/*
# Create waitlist submissions table

1. New Tables
- `waitlist_submissions`
- `id` (uuid, primary key): Unique submission identifier.
- `email` (text, unique, not null): Email address entered by a visitor.
- `created_at` (timestamptz): Time the visitor joined the waitlist.

2. Security
- Row Level Security is enabled.
- Anonymous and authenticated visitors may insert their own email submission.
- Anonymous and authenticated visitors may not read, update, or delete submissions.

3. Important Notes
- This is a single-tenant public landing page with no sign-in flow.
- Email uniqueness prevents duplicate waitlist entries without exposing the existing list.
*/

CREATE TABLE IF NOT EXISTS public.waitlist_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can join waitlist" ON public.waitlist_submissions;
CREATE POLICY "Public can join waitlist"
  ON public.waitlist_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (length(trim(email)) BETWEEN 3 AND 320);

DROP POLICY IF EXISTS "Waitlist submissions are private" ON public.waitlist_submissions;
CREATE POLICY "Waitlist submissions are private"
  ON public.waitlist_submissions
  FOR SELECT
  TO anon, authenticated
  USING (false);

DROP POLICY IF EXISTS "Waitlist updates are disabled" ON public.waitlist_submissions;
CREATE POLICY "Waitlist updates are disabled"
  ON public.waitlist_submissions
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Waitlist deletions are disabled" ON public.waitlist_submissions;
CREATE POLICY "Waitlist deletions are disabled"
  ON public.waitlist_submissions
  FOR DELETE
  TO anon, authenticated
  USING (false);