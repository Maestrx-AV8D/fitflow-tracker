// src/pages/History.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function History() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // load all entries for the signed-in user
  const fetchEntries = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      alert(`Error loading history:\n${error.message}`)
    } else {
      setEntries(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  // delete a single entry and refresh list
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry forever?')) return
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)

    if (error) {
      alert(`Could not delete entry:\n${error.message}`)
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id))
    }
  }

  // edit → navigate to /log with entry in location state
  const handleEdit = (entry) => {
    navigate('/log', { state: { entry } })
  }

  // split into Gym vs Other
  const gymEntries = entries.filter((e) => e.type === 'Gym')
  const otherEntries = entries.filter((e) => e.type !== 'Gym')

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">History</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-600">No entries yet.</p>
      ) : (
        <div className="space-y-12">
          {/* Gym Workouts */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">🏋️ Gym Workouts</h2>
            {gymEntries.length === 0 ? (
              <p className="text-gray-600">No gym workouts logged.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gymEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Other Activities */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">🎽 Other Activities</h2>
            {otherEntries.length === 0 ? (
              <p className="text-gray-600">No other activities logged.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

// reusable card component
function EntryCard({ entry, onDelete, onEdit }) {
  // badge color based on type
  const badgeColor =
    entry.type === 'Gym'
      ? 'bg-purple-100 text-purple-800'
      : entry.type === 'Run'
      ? 'bg-green-100 text-green-800'
      : entry.type === 'Swim'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-yellow-100 text-yellow-800'

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold">
            {new Date(entry.date).toLocaleDateString('en-GB')}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}
          >
            {entry.type}
          </span>
        </div>
        {entry.exercises?.length > 0 && (
          <ul className="list-disc ml-5 space-y-1 mb-3 text-gray-700">
            {entry.exercises.map((ex, i) => (
              <li key={i}>
                <span className="font-medium">{ex.name}</span>: {ex.sets}×{ex.reps}{' '}
                {ex.weight && <span>@ {ex.weight}kg</span>}
              </li>
            ))}
          </ul>
        )}
        {entry.segments?.length > 0 && (
          <p className="mb-3 text-gray-700">
            Details:{' '}
            {entry.segments[0].detail ||
              entry.segments[0].distance ||
              entry.segments[0].duration ||
              entry.segments[0].laps ||
              entry.segments[0].time}
          </p>
        )}
        {entry.notes && (
          <p className="mb-3 text-gray-600 italic">“{entry.notes}”</p>
        )}
      </div>
      <div className="mt-4 flex justify-end space-x-4">
        <button
          onClick={() => onEdit(entry)}
          className="text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  )
}