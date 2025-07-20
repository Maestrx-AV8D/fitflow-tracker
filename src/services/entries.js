// src/services/entries.js
import { supabase } from '../lib/supabaseClient'

// fetch all entries, newest first
export async function getEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// insert a new log entry
export async function createEntry(entry) {
  const { data, error } = await supabase
    .from('entries')
    .insert(entry)
    .single()

  if (error) throw new Error(error.message)
  return data
}