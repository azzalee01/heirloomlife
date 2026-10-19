-- Enable RLS on employer_enquiries (was disabled — publicly readable without auth)
-- Applied to test project cbnosutzwacmhafsdaeb. Must also apply to prod before launch.
ALTER TABLE public.employer_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to submit enquiries (contact form)
CREATE POLICY "employer_enquiries_insert_public"
  ON public.employer_enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies — only service role (admin) can read submissions
