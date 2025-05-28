import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert } from '@/integrations/supabase/types'

export function useActiveTimeEntry() {
  return useQuery({
    queryKey: ['active-time-entry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error
      return data as Tables<'time_entries'> | null
    },
  })
}

export function useStartTimeTracking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: Omit<TablesInsert<'time_entries'>, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          ...entry,
          user_id: user.id,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-time-entry'] })
    },
  })
}

export function useStopTimeTracking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entryId: string) => {
      const endTime = new Date().toISOString()
      
      // Get the current entry to calculate duration
      const { data: entry } = await supabase
        .from('time_entries')
        .select('start_time')
        .eq('id', entryId)
        .single()

      if (!entry) throw new Error('Time entry not found')

      const startTime = new Date(entry.start_time)
      const endTimeObj = new Date(endTime)
      const durationMinutes = Math.round((endTimeObj.getTime() - startTime.getTime()) / (1000 * 60))

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime,
          duration_minutes: durationMinutes,
          is_active: false,
        })
        .eq('id', entryId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-time-entry'] })
    },
  })
}

export function useTimeTracking() {
  const { data: activeEntry } = useActiveTimeEntry()
  const startTracking = useStartTimeTracking()
  const stopTracking = useStopTimeTracking()

  return {
    activeEntry,
    isTracking: !!activeEntry,
    startTracking,
    stopTracking,
  }
}
