-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can delete user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can create a profile" ON public.profiles;

-- Create new policies
-- Anyone can create a profile (needed for the new user flow)
CREATE POLICY "Anyone can create a profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can view their own profile and admins can view all
CREATE POLICY "Users can view their own profile or admins can view all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Users can update their own profile or admins can update any
CREATE POLICY "Users can update their own profile or admins can update any"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Only admins can delete user profiles
CREATE POLICY "Only admins can delete user profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 