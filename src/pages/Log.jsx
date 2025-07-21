// src/pages/Log.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tab } from '@headlessui/react'
import { supabase } from '../lib/supabaseClient'

const categories = ['Run', 'Gym', 'Swim', 'Cycle', 'Other']

export default function Log() {
  const navigate      = useNavigate()
  const { state }     = useLocation()
  const entryToEdit   = state?.entry

  // Common form state
  const [displayDate, setDisplayDate] = useState(
    new Date().toLocaleDateString('en-GB')
  )
  const [activityType, setActivityType] = useState(entryToEdit?.type || 'Run')
  const [notes, setNotes] = useState(entryToEdit?.notes || '')
  const [loading, setLoading] = useState(false)

  // Gym-specific
  const [exercises, setExercises] = useState(
    entryToEdit?.exercises?.map(e => ({
      name: e.name, sets: e.sets, reps: e.reps, weight: e.weight || ''
    })) || [{ name:'', sets:'', reps:'', weight:'' }]
  )
  const [exerciseNames, setExerciseNames] = useState([])

  // Segment-specific
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [laps, setLaps] = useState('')
  const [time, setTime] = useState('')

  // Load known exercise names
  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: past } = await supabase
        .from('entries')
        .select('exercises')
        .eq('user_id', user.id)
        .eq('type', 'Gym')
      const names = new Set()
      past?.forEach(e => e.exercises.forEach(x => x.name && names.add(x.name)))
      setExerciseNames([...names])
    })()
  }, [])

  // Handle name blur to autofill
  async function handleNameBlur(idx) {
    const name = exercises[idx].name.trim()
    if (!name) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data: past } = await supabase
      .from('entries')
      .select('exercises')
      .eq('user_id', user.id)
      .eq('type', 'Gym')
      .order('date', { ascending: false })
      .limit(20)
    for (const entry of past || []) {
      const match = entry.exercises.find(e => e.name === name)
      if (match) {
        const copy = [...exercises]
        copy[idx] = { ...match }
        setExercises(copy)
        break
      }
    }
  }

  // Add/remove exercise rows
  const addExercise = () => setExercises([...exercises, {name:'',sets:'',reps:'',weight:''}])
  const removeExercise = idx => setExercises(exercises.filter((_,i)=>i!==idx))

  // Save
  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in')
      setLoading(false)
      return
    }

    const dateISO = displayDate.split('/').reverse().join('-')
    const payload = {
      user_id: user.id,
      date: dateISO,
      type: activityType,
      notes
    }
    if (activityType === 'Gym') {
      payload.exercises = exercises
      payload.segments = []
    } else {
      payload.exercises = []
      payload.segments = activityType === 'Swim'
        ? [{ laps, time }]
        : [{ distance, duration }]
    }

    const res = entryToEdit
      ? await supabase.from('entries').update(payload).eq('id', entryToEdit.id)
      : await supabase.from('entries').insert([payload])

    setLoading(false)
    if (res.error) {
      alert(`Error: ${res.error.message}`)
    } else {
      navigate('/history', { replace: true })
    }
  }

  return (
    <main className="p-6 bg-neutral-light min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        {entryToEdit ? 'Edit Activity' : 'Log Activity'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-md">
        {/* Date */}
        <div>
          <label className="block font-medium">Date</label>
          <input
            type="text"
            value={displayDate}
            onChange={e => setDisplayDate(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Activity */}
        <div>
          <label className="block font-medium">Activity</label>
          <select
            value={activityType}
            onChange={e => setActivityType(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Conditional Forms */}
        {activityType === 'Gym' && (
          <>
            {exercises.map((ex, idx) => (
              <div key={idx} className="border rounded p-4 space-y-2 relative">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(idx)}
                    className="absolute top-2 right-2 text-red-500"
                  >✕</button>
                )}
                <h2 className="font-medium">Exercise #{idx + 1}</h2>
                <input
                  type="text"
                  list="exercise-names"
                  value={ex.name}
                  onChange={e => {
                    const copy = [...exercises]; copy[idx].name = e.target.value; setExercises(copy)
                  }}
                  onBlur={() => handleNameBlur(idx)}
                  placeholder="Name"
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <datalist id="exercise-names">
                  {exerciseNames.map(n => <option key={n} value={n} />)}
                </datalist>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number" placeholder="Sets"
                    value={ex.sets}
                    onChange={e => {
                      const copy = [...exercises]; copy[idx].sets = e.target.value; setExercises(copy)
                    }}
                    className="border rounded px-2 py-1"
                  />
                  <input
                    type="number" placeholder="Reps"
                    value={ex.reps}
                    onChange={e => {
                      const copy = [...exercises]; copy[idx].reps = e.target.value; setExercises(copy)
                    }}
                    className="border rounded px-2 py-1"
                  />
                  <input
                    type="number" placeholder="Weight kg"
                    value={ex.weight}
                    onChange={e => {
                      const copy = [...exercises]; copy[idx].weight = e.target.value; setExercises(copy)
                    }}
                    className="border rounded px-2 py-1"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addExercise}
              className="text-blue-600 hover:underline"
            >+ Add Exercise</button>
          </>
        )}

        {activityType !== 'Gym' && activityType !== 'Swim' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Distance</label>
              <input
                type="text"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="e.g. 5 km"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="e.g. 30 min"
                required
              />
            </div>
          </div>
        )}

        {activityType === 'Swim' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Laps</label>
              <input
                type="number"
                value={laps}
                onChange={e => setLaps(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="e.g. 20"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Time</label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="e.g. 45 min"
                required
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2 h-24"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-white rounded ${
            loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Saving…' : entryToEdit ? 'Update Entry' : 'Save Log'}
        </button>
      </form>
    </main>
  )
}