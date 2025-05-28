import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Tables } from "@/integrations/supabase/types"

type ProjectRole = "member" | "admin"

type ProjectMember = Tables<'project_members'> & {
  profiles: Tables<'profiles'> | null
}

export function useProjectMembers(projectId: string) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profiles:user_id (*)
        `)
        .eq('project_id', projectId)

      if (error) throw error
      return data as ProjectMember[]
    }
  })

  const addMember = useMutation({
    mutationFn: async ({ project_id, user_id, role }: { project_id: string; user_id: string; role: ProjectRole }) => {
      const { error } = await supabase
        .from('project_members')
        .insert([{
          project_id,
          user_id,
          role
        }])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
    }
  })

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
    }
  })

  return {
    data,
    isLoading,
    addMember,
    removeMember
  }
} 