import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.jsx'

export function useEntries() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('entries')
      .select('id,user_id,date,type,segments')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching entries:', error)
          setEntries([])
        } else {
          setEntries(data)
        }
        setLoading(false)
      })
  }, [user])

  const addEntry = async (jsonString) => {
    if (!user) throw new Error('Not authenticated')
    const payload = JSON.parse(jsonString)
    const { data, error } = await supabase
      .from('entries')
      .insert([{
        user_id: user.id,
        date:     payload.date,
        type:     payload.activity,
        segments: payload
      }])
      .single()
    if (error) throw error
    setEntries(prev => [data, ...prev])
  }

  // NEW: delete an entry
  const deleteEntry = async (id) => {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)
    if (error) throw error
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return { entries, loading, addEntry, deleteEntry }
}