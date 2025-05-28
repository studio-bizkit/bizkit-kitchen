-- Create a function to delete a user (both profile and auth)
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'Admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Delete the profile
  DELETE FROM public.profiles WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user(UUID) TO authenticated;

-- Create a policy to allow admins to execute the function
CREATE POLICY "Only admins can execute delete_user function"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  ); 