// src/hooks/useEntries.jsx

import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export function useEntries() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['entries', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }
      return data
    },
    // only run this query once we have a user
    enabled: !!user,
  })
}