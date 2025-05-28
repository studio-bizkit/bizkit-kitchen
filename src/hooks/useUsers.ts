import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types'

type User = Tables<'profiles'>

export type UserRole = 'Admin' | 'Manager' | 'Employee' | 'Intern'
export type UserDepartment = 'designer' | 'developer'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as User[]
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      email, 
      role, 
      department 
    }: { 
      email: string
      role: UserRole
      department: UserDepartment
    }) => {
      try {
        // First, create the profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            email,
            role,
            department,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (profileError) throw profileError

        // Then send magic link to the user
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: {
              role,
              department
            }
          }
        })

        if (authError) {
          // If auth fails, delete the profile
          await supabase
            .from('profiles')
            .delete()
            .eq('id', profile.id)
          throw authError
        }

        return profile
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to create user: ${error.message}`)
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'profiles'> }) => {
      // Ensure we have the required fields
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      // Remove any undefined or null values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key]
        }
      })

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        // If the error is about missing department column, try to create it
        if (error.code === 'PGRST204' && error.message?.includes('department')) {
          // First, try to add the column
          const { error: alterError } = await supabase.rpc('add_department_column')
          if (alterError) throw alterError

          // Then retry the update
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

          if (retryError) throw retryError
          return retryData
        }
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // Call the server-side function to delete the user
        const { error } = await supabase
          .rpc('delete_user', { user_id: id })

        if (error) throw error

        return { id }
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to delete user: ${error.message}`)
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useProjectMembers() {
  return useQuery({
    queryKey: ['project-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profiles(*)
        `)

      if (error) throw error
      return data
    },
  })
}

export function useAssignProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      userId 
    }: { 
      projectId: string
      userId: string 
    }) => {
      const { data, error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members'] })
    },
  })
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      userId 
    }: { 
      projectId: string
      userId: string 
    }) => {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members'] })
    },
  })
} 