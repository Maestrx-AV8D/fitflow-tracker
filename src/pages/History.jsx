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
    else    setEntries(data || [])
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
    const badgeColor = {
      Gym:   'bg-purple-100 text-purple-800',
      Run:   'bg-green-100 text-green-800',
      Swim:  'bg-blue-100 text-blue-800',
      Cycle: 'bg-yellow-100 text-yellow-800',
    }[entry.type] || 'bg-gray-100 text-gray-800'

    return (
      <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold">
              {new Date(entry.date).toLocaleDateString('en-GB')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
              {entry.type}
            </span>
          </div>
          {entry.exercises?.length > 0 && (
            <ul className="list-disc ml-5 space-y-1 text-gray-700">
              {entry.exercises.map((ex, i) => (
                <li key={i}>
                  <strong>{ex.name}</strong>: {ex.sets}×{ex.reps} {ex.weight && `@ ${ex.weight}kg`}
                </li>
              ))}
            </ul>
          )}
          {entry.segments?.length > 0 && (
            <p className="mb-3 text-gray-700">
              {entry.segments[0].distance || entry.segments[0].laps || entry.segments[0].detail}
            </p>
          )}
          {entry.notes && <p className="italic text-gray-600">“{entry.notes}”</p>}
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button onClick={() => handleEdit(entry)}>
            <PencilIcon className="h-5 w-5 text-blue-600" />
          </button>
          <button onClick={() => handleDelete(entry.id)}>
            <TrashIcon className="h-5 w-5 text-red-600" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="p-6 bg-neutral-light min-h-screen">
      <h1 className="text-3xl font-bold mb-8">History</h1>
      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-600">No entries yet.</p>
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">🏋️ Gym Workouts</h2>
            {gym.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gym.map(e => <EntryCard key={e.id} entry={e} />)}
              </div>
            ) : (
              <p className="text-gray-600">No gym workouts logged.</p>
            )}
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">🎽 Other Activities</h2>
            {other.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {other.map(e => <EntryCard key={e.id} entry={e} />)}
              </div>
            ) : (
              <p className="text-gray-600">No other activities logged.</p>
            )}
          </section>
        </div>
      )}
    </main>
  )
}