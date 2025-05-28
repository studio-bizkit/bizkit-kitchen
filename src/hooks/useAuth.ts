import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tables } from '@/integrations/supabase/types'

type User = Tables<'profiles'>

export function useAuth() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      // First get the authenticated user from Supabase Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!authUser) return { user: null }

      // Then fetch their profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        // If profile doesn't exist, create one with default role
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email: authUser.email!,
              role: 'Employee', // Default role
              department: 'developer', // Default department
            })
            .select()
            .single()

          if (createError) throw createError
          return { user: newProfile as User }
        }
        throw profileError
      }

      return { user: profile as User }
    },
  })
}

// Helper function to check if user has required role
export function useHasRole(requiredRole: User['role']) {
  const { data: authData } = useAuth()
  return authData?.user?.role === requiredRole
}

// Helper function to check if user has admin or manager role
export function useIsAdminOrManager() {
  const { data: authData } = useAuth()
  return authData?.user?.role === 'Admin' || authData?.user?.role === 'Manager'
}

// Helper function to check if user can manage another user
export function useCanManageUser(targetUserRole: User['role']) {
  const { data: authData } = useAuth()
  const userRole = authData?.user?.role

  if (!userRole) return false
  if (userRole === 'Admin') return true
  if (userRole === 'Manager') return targetUserRole !== 'Admin' && targetUserRole !== 'Manager'
  return false
} 