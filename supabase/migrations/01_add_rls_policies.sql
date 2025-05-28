-- Add RLS policies for clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Users can view all clients (for project assignment)
CREATE POLICY "Users can view all clients" 
  ON public.clients 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Users can create clients
CREATE POLICY "Users can create clients" 
  ON public.clients 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid());

-- Users can update clients they created or admins can update any
CREATE POLICY "Users can update their clients or admins can update any" 
  ON public.clients 
  FOR UPDATE 
  TO authenticated 
  USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Users can delete clients they created or admins can delete any
CREATE POLICY "Users can delete their clients or admins can delete any" 
  ON public.clients 
  FOR DELETE 
  TO authenticated 
  USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Add RLS policies for projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can view projects they created or are members of
CREATE POLICY "Users can view their projects or projects they are members of" 
  ON public.projects 
  FOR SELECT 
  TO authenticated 
  USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Users can create projects
CREATE POLICY "Users can create projects" 
  ON public.projects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid());

-- Users can update projects they created or are managers/admins of
CREATE POLICY "Users can update projects they created or manage" 
  ON public.projects 
  FOR UPDATE 
  TO authenticated 
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('Manager', 'Admin')
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Users can delete projects they created or admins can delete any
CREATE POLICY "Users can delete projects they created or admins can delete any" 
  ON public.projects 
  FOR DELETE 
  TO authenticated 
  USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Add RLS policies for project_members table
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Users can view project members for projects they have access to
CREATE POLICY "Users can view project members for accessible projects" 
  ON public.project_members 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id AND (
        p.created_by = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
      )
    )
  );

-- Project creators and managers can add members
CREATE POLICY "Project creators and managers can add members" 
  ON public.project_members 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id AND (
        p.created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.project_members pm 
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid() AND pm.role IN ('Manager', 'Admin')
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
      )
    )
  );

-- Project creators and managers can update members
CREATE POLICY "Project creators and managers can update members" 
  ON public.project_members 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id AND (
        p.created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.project_members pm 
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid() AND pm.role IN ('Manager', 'Admin')
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
      )
    )
  );

-- Project creators and managers can remove members
CREATE POLICY "Project creators and managers can remove members" 
  ON public.project_members 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id AND (
        p.created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.project_members pm 
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid() AND pm.role IN ('Manager', 'Admin')
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
      )
    )
  );

-- Add RLS policies for profiles table (admin-only access for CRUD)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile and admins can view all
CREATE POLICY "Users can view their own profile or admins can view all" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Only admins can update user profiles (except users can update their own basic info)
CREATE POLICY "Users can update own profile or admins can update any" 
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