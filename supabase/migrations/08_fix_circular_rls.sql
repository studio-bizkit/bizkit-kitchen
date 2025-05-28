-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile or admins can view all') THEN
        DROP POLICY "Users can view their own profile or admins can view all" ON public.profiles;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile or admins can update any') THEN
        DROP POLICY "Users can update their own profile or admins can update any" ON public.profiles;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Only admins can delete user profiles') THEN
        DROP POLICY "Only admins can delete user profiles" ON public.profiles;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Anyone can create a profile') THEN
        DROP POLICY "Anyone can create a profile" ON public.profiles;
    END IF;
END $$;

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
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
  );

-- Users can update their own profile or admins can update any
CREATE POLICY "Users can update their own profile or admins can update any"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
  );

-- Only admins can delete user profiles
CREATE POLICY "Only admins can delete user profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
  );

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace the is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated; 