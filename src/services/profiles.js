import { supabase } from '../lib/supabaseClient';

export async function getProfile(userId) {
  return supabase.from('profiles').select('*').eq('id', userId).single();
}

export async function upsertProfile(profile) {
  return supabase.from('profiles').upsert(profile);
}