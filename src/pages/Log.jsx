// src/pages/Log.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Log() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const entryToEdit = state?.entry

  // Helpers for date formatting
  const formatDisplay = (iso) =>
    new Date(iso).toLocaleDateString('en-GB')
  const formatISO = (display) => {
    const [d, m, y] = display.split('/')
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // --- form state ---
  const [displayDate, setDisplayDate] = useState(
    formatDisplay(new Date().toISOString().slice(0, 10))
  )
  const [activityType, setActivityType] = useState('Run')

  // Gym-specific: start blank
  const [exercises, setExercises] = useState([
    { name: '', sets: '', reps: '', weight: '' },
  ])

  // names for dropdown
  const [exerciseNames, setExerciseNames] = useState([])

  // Run/Cycle-specific
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  // Swim-specific
  const [laps, setLaps] = useState('')
  const [time, setTime] = useState('')

  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Load past exercise names once
  useEffect(() => {
    async function loadNames() {
      const { data: { user } = {}, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) return
      const { data: past, error } = await supabase
        .from('entries')
        .select('exercises')
        .eq('user_id', user.id)
        .eq('type', 'Gym')
      if (error) {
        console.error('Error loading exercise names:', error)
        return
      }
      const names = new Set()
      ;(past || []).forEach((entry) =>
        entry.exercises.forEach((e) => {
          if (e.name) names.add(e.name)
        })
      )
      setExerciseNames([...names])
    }
    loadNames()
  }, [])

  // If editing, preload form values
  useEffect(() => {
    if (!entryToEdit) return

    setDisplayDate(formatDisplay(entryToEdit.date))
    setActivityType(entryToEdit.type)
    setNotes(entryToEdit.notes || '')

    if (entryToEdit.type === 'Gym') {
      setExercises(
        entryToEdit.exercises.map((e) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight ?? '',
        }))
      )
      setDistance('')
      setDuration('')
      setLaps('')
      setTime('')
    } else {
      const seg = entryToEdit.segments?.[0] || {}
      if (entryToEdit.type === 'Swim') {
        setLaps(seg.laps || '')
        setTime(seg.time || '')
      } else {
        setDistance(seg.distance || '')
        setDuration(seg.duration || '')
      }
      setExercises([{ name: '', sets: '', reps: '', weight: '' }])
    }
  }, [entryToEdit])

  // Update one field in the exercises array
  const handleExerciseChange = (idx, field, value) => {
    const arr = exercises.slice()
    arr[idx] = { ...arr[idx], [field]: value }
    setExercises(arr)
  }

  // Add a new blank exercise row
  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: '', sets: '', reps: '', weight: '' },
    ])
  }

  // Remove an exercise row
  const removeExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx))
  }

  // When the user leaves the name field, look up their last sets/reps/weight
  const handleNameBlur = async (idx) => {
    const exName = exercises[idx].name.trim()
    if (!exName) return

    const { data: { user } = {} } = await supabase.auth.getUser()
    if (!user) return

    const { data: entries } = await supabase
      .from('entries')
      .select('exercises')
      .eq('user_id', user.id)
      .eq('type', 'Gym')
      .order('date', { ascending: false })
      .limit(20)

    for (const entry of entries || []) {
      const match = entry.exercises.find((e) => e.name === exName)
      if (match) {
        const updated = exercises.slice()
        updated[idx] = {
          name: exName,
          sets: match.sets,
          reps: match.reps,
          weight: match.weight ?? '',
        }
        setExercises(updated)
        break
      }
    }
  }

  // Save or update the entry
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } = {} } = await supabase.auth.getUser()
    if (!user) {
      alert('You must be signed in to save logs.')
      setLoading(false)
      return
    }

    const isoDate = formatISO(displayDate)
    const payload = {
      user_id: user.id,
      date: isoDate,
      type: activityType,
      notes,
    }

    if (activityType === 'Gym') {
      payload.exercises = exercises
      payload.segments = []
    } else {
      payload.exercises = []
      payload.segments =
        activityType === 'Swim'
          ? [{ laps, time }]
          : [{ distance, duration }]
    }

    const res = entryToEdit
      ? await supabase.from('entries').update(payload).eq('id', entryToEdit.id)
      : await supabase.from('entries').insert([payload])

    setLoading(false)
    if (res.error) {
      alert(
        `${entryToEdit ? 'Could not update' : 'Could not save'} entry:\n${
          res.error.message
        }`
      )
    } else {
      navigate('/history', { replace: true })
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {entryToEdit ? 'Edit' : 'Log'} Activity
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block font-medium">Date</label>
          <input
            type="text"
            value={displayDate}
            onChange={(e) => setDisplayDate(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2 bg-gray-100"
            required
          />
        </div>

        {/* Activity selector */}
        <div>
          <label className="block font-medium">Activity</label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          >
            <option value="Run">🏃 Run</option>
            <option value="Gym">🏋️ Gym</option>
            <option value="Swim">🏊 Swim</option>
            <option value="Cycle">🚴 Cycle</option>
          </select>
        </div>

        {/* Gym form */}
        {activityType === 'Gym' && (
          <>
            {exercises.map((ex, idx) => (
              <div key={idx} className="border rounded p-4 space-y-2 relative">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(idx)}
                    className="absolute top-2 right-2 text-red-500"
                    aria-label="Remove exercise"
                  >
                    ✕
                  </button>
                )}
                <h2 className="font-medium">Exercise #{idx + 1}</h2>

                {/* Name + dropdown */}
                <div>
                  <label className="block">Name</label>
                  <input
                    type="text"
                    list="exercise-names"
                    value={ex.name}
                    onBlur={() => handleNameBlur(idx)}
                    onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    required
                  />
                  <datalist id="exercise-names">
                    {exerciseNames.map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                </div>

                {/* Sets / Reps / Weight */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block">Sets</label>
                    <input
                      type="number"
                      value={ex.sets}
                      onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                      className="mt-1 w-full border rounded px-3 py-2"
                      min="1"
                      placeholder="e.g. 3"
                    />
                  </div>
                  <div>
                    <label className="block">Reps</label>
                    <input
                      type="number"
                      value={ex.reps}
                      onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                      className="mt-1 w-full border rounded px-3 py-2"
                      min="1"
                      placeholder="e.g. 8"
                    />
                  </div>
                  <div>
                    <label className="block">Weight (kg)</label>
                    <input
                      type="number"
                      value={ex.weight}
                      onChange={(e) => handleExerciseChange(idx, 'weight', e.target.value)}
                      className="mt-1 w-full border rounded px-3 py-2"
                      min="0"
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addExercise} className="text-blue-600 hover:underline">
              + Add Exercise
            </button>
          </>
        )}

        {/* Run/Cycle form */}
        {activityType !== 'Gym' && activityType !== 'Swim' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Distance</label>
              <input
                type="text"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
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
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="e.g. 30 min"
                required
              />
            </div>
          </div>
        )}

        {/* Swim form */}
        {activityType === 'Swim' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Laps</label>
              <input
                type="number"
                value={laps}
                onChange={(e) => setLaps(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="e.g. 20"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
            onChange={(e) => setNotes(e.target.value)}
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