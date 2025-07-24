// src/pages/History.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function History() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    if (error) alert(`Error: ${error.message}`)
    else setEntries(data || [])
    setLoading(false)
  }

  const handleDelete = async id => {
    if (!confirm('Delete permanently?')) return
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (error) alert(`Error: ${error.message}`)
    else setEntries(prev => prev.filter(e => e.id !== id))
  }

  const handleEdit = entry => navigate('/log', { state: { entry } })

  const gym   = entries.filter(e => e.type === 'Gym')
  const other = entries.filter(e => e.type !== 'Gym')

  function EntryCard({ entry }) {
    const badgeStyles = {
      Gym:   'bg-purple-800 text-purple-200',
      Run:   'bg-green-800  text-green-200',
      Swim:  'bg-blue-800   text-blue-200',
      Cycle: 'bg-yellow-800 text-yellow-200',
    }[entry.type] || 'bg-gray-800 text-gray-200'

    return (
      <div className="bg-n-7 rounded-2xl shadow-md p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-n-1">
              {new Date(entry.date).toLocaleDateString('en-GB')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeStyles}`}>
              {entry.type}
            </span>
          </div>
          {entry.exercises?.length > 0 && (
            <ul className="list-disc ml-5 space-y-1 text-n-3">
              {entry.exercises.map((ex, i) => (
                <li key={i}>
                  <strong className="text-n-1">{ex.name}</strong>: {ex.sets}×{ex.reps} {ex.weight && `@ ${ex.weight}kg`}
                </li>
              ))}
            </ul>
          )}
          {entry.segments?.length > 0 && (
            <p className="mb-3 text-n-3">
              {entry.segments[0].distance || entry.segments[0].laps || entry.segments[0].detail}
            </p>
          )}
          {entry.notes && <p className="italic text-n-4">“{entry.notes}”</p>}
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button onClick={() => handleEdit(entry)}>
            <PencilIcon className="h-5 w-5 text-n-1" />
          </button>
          <button onClick={() => handleDelete(entry.id)}>
            <TrashIcon className="h-5 w-5 text-red-500" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="p-6 bg-n-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-n-1">History</h1>
      {loading ? (
        <p className="text-center text-n-4">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-center text-n-4">No entries yet.</p>
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-n-2">🏋️ Gym Workouts</h2>
            {gym.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gym.map(e => <EntryCard key={e.id} entry={e} />)}
              </div>
            ) : (
              <p className="text-n-4">No gym workouts logged.</p>
            )}
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-n-2">🎽 Other Activities</h2>
            {other.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {other.map(e => <EntryCard key={e.id} entry={e} />)}
              </div>
            ) : (
              <p className="text-n-4">No other activities logged.</p>
            )}
          </section>
        </div>
      )}
    </main>
  )
}