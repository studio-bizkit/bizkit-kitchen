-- Drop all existing policies
DO $$ 
BEGIN
    -- Drop profiles policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles') THEN
        DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update their own profile or admins can update any" ON public.profiles;
        DROP POLICY IF EXISTS "Only admins can delete user profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Anyone can create a profile" ON public.profiles;
    END IF;

    -- Drop projects policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects') THEN
        DROP POLICY IF EXISTS "Users can view their projects or projects they are members of" ON public.projects;
        DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
        DROP POLICY IF EXISTS "Users can update projects they created or manage" ON public.projects;
        DROP POLICY IF EXISTS "Users can delete projects they created or admins can delete any" ON public.projects;
    END IF;

    -- Drop tasks policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks') THEN
        DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
        DROP POLICY IF EXISTS "Users can create tasks in their projects" ON public.tasks;
        DROP POLICY IF EXISTS "Users can update tasks in their projects" ON public.tasks;
        DROP POLICY IF EXISTS "Users can delete tasks in their projects" ON public.tasks;
    END IF;
END $$;

-- Create or replace the is_admin function with correct case
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

-- Recreate profiles policies with correct case
CREATE POLICY "Anyone can create a profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own profile or admins can view all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    is_admin()
  );

CREATE POLICY "Users can update their own profile or admins can update any"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    is_admin()
  );

CREATE POLICY "Only admins can delete user profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    is_admin()
  );

-- Recreate projects policies with correct case
CREATE POLICY "Users can view their projects or projects they are members of"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid()) OR
    is_admin()
  );

CREATE POLICY "Users can create projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update projects they created or manage"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = id AND user_id = auth.uid() AND role IN ('Admin', 'Manager')
    ) OR
    is_admin()
  );

CREATE POLICY "Users can delete projects they created or admins can delete any"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    is_admin()
  );

-- Recreate tasks policies with correct case
CREATE POLICY "Users can view tasks in their projects"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND (
        p.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = p.id AND user_id = auth.uid()) OR
        is_admin()
      )
    )
  );

CREATE POLICY "Users can create tasks in their projects"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND (
        p.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = p.id AND user_id = auth.uid()) OR
        is_admin()
      )
    )
  );

CREATE POLICY "Users can update tasks in their projects"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND (
        p.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = p.id AND user_id = auth.uid()) OR
        is_admin()
      )
    )
  );

CREATE POLICY "Users can delete tasks in their projects"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND (
        p.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = p.id AND user_id = auth.uid()) OR
        is_admin()
      )
    )
  );