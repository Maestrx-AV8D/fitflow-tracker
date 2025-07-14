import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useEntries } from '../hooks/useEntries.jsx'
import { supabase } from '../lib/supabase.js'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { entries, loading } = useEntries()

  // Profile info
  const [profile, setProfile] = useState({ name: '', currentWeight: '' })
  // Weight log
  const [weights, setWeights] = useState([])
  const [newWeight, setNewWeight] = useState('')

  // Load profile and weight history on mount
  useEffect(() => {
    async function loadAll() {
      const { data: p } = await supabase
        .from('profiles')
        .select('name, current_weight')
        .eq('user_id', user.id)
        .single()
      if (p) {
        setProfile({ name: p.name, currentWeight: p.current_weight })
      }

      const { data: w } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
      setWeights(w || [])
    }
    loadAll()
  }, [user.id])

  // Save or update profile
  const saveProfile = async (e) => {
    e.preventDefault()
    await supabase.from('profiles').upsert({
      user_id: user.id,
      name: profile.name,
      current_weight: profile.currentWeight
    })
  }

  // Add a new weight entry
  const addWeight = async (e) => {
    e.preventDefault()
    const { data } = await supabase
      .from('weight_logs')
      .insert([{ user_id: user.id, weight: newWeight }])
      .single()
    setWeights(w => [data, ...w])
    setNewWeight('')
  }

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Profile</h2>
        <form onSubmit={saveProfile}>
          <input
            type="text"
            placeholder="Your Name"
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            type="number"
            placeholder="Current Weight"
            value={profile.currentWeight}
            onChange={e => setProfile(p => ({ ...p, currentWeight: e.target.value }))}
            required
          />
          <button type="submit" className="auth-button">
            Save Profile
          </button>
        </form>
        <button className="auth-button" onClick={signOut}>
          Sign Out
        </button>
      </div>

      <div className="page-card">
        <h3>Weight Log</h3>
        <form onSubmit={addWeight} style={{ marginBottom: '1rem' }}>
          <input
            type="number"
            placeholder="New Weight"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">
            Add Weight
          </button>
        </form>
        <ul>
          {weights.map(w => (
            <li key={w.id}>
              {new Date(w.logged_at).toLocaleDateString()}: {w.weight}
            </li>
          ))}
        </ul>
      </div>
    </div>
)
}