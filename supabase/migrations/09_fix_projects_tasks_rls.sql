-- Fix projects table RLS
DROP POLICY IF EXISTS "Users can view their projects or projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects they created or manage" ON public.projects;
DROP POLICY IF EXISTS "Users can delete projects they created or admins can delete any" ON public.projects;

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
      WHERE project_id = id AND user_id = auth.uid() AND role IN ('admin', 'member')
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

-- Fix tasks table RLS
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their projects" ON public.tasks;

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