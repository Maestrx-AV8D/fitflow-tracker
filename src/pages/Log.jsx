// src/pages/Log.jsx

import React, { useState } from 'react'
import { useEntries } from '../hooks/useEntries.jsx'

// Activity options
const ACTIVITY_TYPES = [
  'Run',
  'Cycling',
  'Swimming',
  'Gym',
  'Strength Training',
  'Yoga',
  'Hike',
  'Walk',
  'Rowing'
]

// Select‐field options
const SWIM_STROKES  = ['Freestyle','Backstroke','Breaststroke','Butterfly','Other']
const POOL_TYPES    = ['Pool','Open Water']
const YOGA_STYLES   = ['Hatha','Vinyasa','Ashtanga','Yin','Bikram','Other']
const DIFFICULTIES  = ['Beginner','Intermediate','Advanced']

export default function Log() {
  const { entries, loading, addEntry } = useEntries()

  // master form state
  const [form, setForm] = useState({
    date:       new Date().toISOString().slice(0,10),
    activity:   '',
    duration:   '',
    distance:   '',
    notes:      '',
    pace:       '',
    route:      '',
    elevation:  '',
    avgSpeed:   '',
    stroke:     '',
    poolType:   '',
    style:      '',
    difficulty: '',
    steps:      '',
    strokeRate: '',
    trail:      ''
  })

  // gym/strength entries
  const [gymExercises, setGymExercises] = useState([
    { name:'', sets:'', reps:'', weight:'', notes:'' }
  ])

  // generic field handler
  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // gym exercise handlers
  const handleExerciseChange = (idx, field, value) => {
    setGymExercises(exs =>
      exs.map((ex,i) =>
        i===idx ? { ...ex, [field]: value } : ex
      )
    )
  }
  const addExercise = () => {
    setGymExercises(exs => [
      ...exs,
      { name:'', sets:'', reps:'', weight:'', notes:'' }
    ])
  }

  // submit handler
  const handleSubmit = async e => {
    e.preventDefault()

    // base payload
    let payload = { date: form.date, activity: form.activity }

    if (form.activity === 'Gym' || form.activity === 'Strength Training') {
      payload.exercises = gymExercises
    } else {
      payload = {
        ...payload,
        duration:   form.duration,
        distance:   form.distance,
        notes:      form.notes,
        pace:       form.pace,
        route:      form.route,
        elevation:  form.elevation,
        avgSpeed:   form.avgSpeed,
        stroke:     form.stroke,
        poolType:   form.poolType,
        style:      form.style,
        difficulty: form.difficulty,
        steps:      form.steps,
        strokeRate: form.strokeRate,
        trail:      form.trail
      }
    }

    try {
      await addEntry(JSON.stringify(payload))
      // reset form & exercises
      setForm({
        date:       new Date().toISOString().slice(0,10),
        activity:   '', duration:'', distance:'', notes:'',
        pace:'', route:'', elevation:'', avgSpeed:'',
        stroke:'', poolType:'', style:'', difficulty:'',
        steps:'', strokeRate:'', trail:''
      })
      setGymExercises([{ name:'', sets:'', reps:'', weight:'', notes:'' }])
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Log a New Activity</h2>
        <form className="activity-form" onSubmit={handleSubmit}>
          {/* Date + Activity */}
          <label>
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Activity
            <select
              name="activity"
              value={form.activity}
              onChange={handleChange}
              required
            >
              <option value="">– Choose –</option>
              {ACTIVITY_TYPES.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          {/* Gym / Strength Training */}
          {(form.activity === 'Gym' || form.activity === 'Strength Training') && (
            <>
              <h3>Exercises</h3>
              {gymExercises.map((ex, idx) => (
                <div key={idx} className="gym-exercise">
                  <input
                    type="text"
                    name={`gym-name-${idx}`}
                    placeholder="Exercise Name"
                    value={ex.name}
                    onChange={e => handleExerciseChange(idx, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    name={`gym-sets-${idx}`}
                    placeholder="Sets"
                    value={ex.sets}
                    step="1"
                    onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                  />
                  <input
                    type="number"
                    name={`gym-reps-${idx}`}
                    placeholder="Reps"
                    value={ex.reps}
                    step="1"
                    onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                  />
                  <input
                    type="number"
                    name={`gym-weight-${idx}`}
                    placeholder="Weight"
                    value={ex.weight}
                    step="any"
                    onChange={e => handleExerciseChange(idx, 'weight', e.target.value)}
                  />
                  <input
                    type="text"
                    name={`gym-notes-${idx}`}
                    placeholder="Notes"
                    value={ex.notes}
                    onChange={e => handleExerciseChange(idx, 'notes', e.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addExercise}
                className="auth-button"
              >
                Add Exercise
              </button>
            </>
          )}

          {/* Run */}
          {form.activity === 'Run' && (
            <>
              <label>
                Duration (HH:MM)
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 00:45"
                  value={form.duration}
                  onChange={handleChange}
                />
              </label>
              <label>
                Distance
                <input
                  type="number"
                  name="distance"
                  placeholder="km/miles"
                  value={form.distance}
                  step="any"
                  onChange={handleChange}
                />
              </label>
              <label>
                Pace
                <input
                  type="text"
                  name="pace"
                  placeholder="5:00/mi"
                  value={form.pace}
                  onChange={handleChange}
                />
              </label>
              <label>
                Route
                <input
                  type="text"
                  name="route"
                  placeholder="Trail, park, etc."
                  value={form.route}
                  onChange={handleChange}
                />
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  placeholder="Additional details..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

          {/* Cycling */}
          {form.activity === 'Cycling' && (
            <>
              <label>
                Duration (HH:MM)
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 01:30"
                  value={form.duration}
                  onChange={handleChange}
                />
              </label>
              <label>
                Distance
                <input
                  type="number"
                  name="distance"
                  placeholder="km/miles"
                  value={form.distance}
                  step="any"
                  onChange={handleChange}
                />
              </label>
              <label>
                Avg Speed
                <input
                  type="number"
                  name="avgSpeed"
                  placeholder="e.g. 20"
                  value={form.avgSpeed}
                  step="any"
                  onChange={handleChange}
                />
              </label>
              <label>
                Elevation Gain
                <input
                  type="number"
                  name="elevation"
                  placeholder="meters/feet"
                  value={form.elevation}
                  step="any"
                  onChange={handleChange}
                />
              </label>
              <label>
                Route
                <input
                  type="text"
                  name="route"
                  placeholder="Road/trail name"
                  value={form.route}
                  onChange={handleChange}
                />
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  placeholder="Additional details..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

          {/* Swimming */}
          {form.activity === 'Swimming' && (
            <>
              <label>
                Duration (HH:MM)
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 00:30"
                  value={form.duration}
                  onChange={handleChange}
                />
              </label>
              <label>
                Distance
                <input
                  type="number"
                  name="distance"
                  placeholder="yards/meters"
                  value={form.distance}
                  step="any"
                  onChange={handleChange}
                />
              </label>
              <label>
                Stroke
                <select
                  name="stroke"
                  value={form.stroke}
                  onChange={handleChange}
                >
                  <option value="">— select —</option>
                  {SWIM_STROKES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                In
                <select
                  name="poolType"
                  value={form.poolType}
                  onChange={handleChange}
                >
                  <option value="">— pool/open —</option>
                  {POOL_TYPES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  placeholder="Additional details..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

          {/* Yoga */}
          {form.activity === 'Yoga' && (
            <>
              <label>
                Duration (HH:MM)
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 01:00"
                  value={form.duration}
                  onChange={handleChange}
                />
              </label>
              <label>
                Style
                <select
                  name="style"
                  value={form.style}
                  onChange={handleChange}
                >
                  <option value="">— select —</option>
                  {YOGA_STYLES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Difficulty
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                >
                  <option value="">— select —</option>
                  {DIFFICULTIES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  placeholder="Additional details..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

          {/* Hike */}
          {form.activity === 'Hike' && (
            <>
              <label>
                Duration (HH:MM)
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 03:00"
                  value={form.duration}
                  onChange={handleChange}
                />
              </label>
              <label>
                Distance
                <input
                  type="number"
                  name="distance"
                  placeholder="km/miles"
                  value={form.distance}
                  step="any"
                  onChange={handleChange}
                />
              </label>
              <label>
                Elevation Gain
                <input
                  type="number"
                  name="elevation"
                  placeholder="meters/feet"
                  value={form.elevation}
                  step="any"
                  onChange={handleChange}
                />
              </label>
              <label>
                Trail
                <input
                  type="text"
                  name="trail"
                  placeholder="Trail name"
                  value={form.trail}
                  onChange={handleChange}
                />
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  placeholder="Additional details..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

          {/* Walk */}
          {form.activity === 'Walk' && (
            <>
              <label>
                Duration (HH:MM)
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 00:45"
                  value={form.duration}
                  onChange={handleChange}
                />
              </label>
              <label>
                Distance
                <input
                  type="number"
                  name="distance"
                  placeholder="km/miles"
                  value={form.distance}
                  step="any"
                  onChange={handleChange}
                />
              </label>
              <label>
                Steps
                <input
                  type="number"
                  name="steps"
                  placeholder="e.g. 5000"
                  value={form.steps}
                  onChange={handleChange}
                />
              </label>
              <label>
                Route
                <input
                  type="text"
                  name="route"
                  placeholder="Neighborhood, park..."
                  value={form.route}
                  onChange={handleChange}
                />
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  placeholder="Additional details..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

          {/* Rowing */}
          {form.activity === 'Rowing' && (
            <>
              <label>
                Duration (HH:MM)
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 00:30"
                  value={form.duration}
                  onChange={handleChange}
                />
              </label>
              <label>
                Distance (meters)
                <input
                  type="number"
                  name="distance"
                  placeholder="e.g. 2000"
                  value={form.distance}
                  step="any"
                  onChange={handleChange}
                />
              </label>
              <label>
                Stroke Rate (spm)
                <input
                  type="number"
                  name="strokeRate"
                  placeholder="e.g. 26"
                  value={form.strokeRate}
                  onChange={handleChange}
                />
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  placeholder="Additional details..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </label>
            </>
          )}

          <button type="submit" className="auth-button">
            Add Activity
          </button>
        </form>
      </div>

      {/* Recent entries preview */}
      <div className="page-card">
        <h3>Your Recent Entries</h3>
        {loading ? (
          <p>Loading…</p>
        ) : entries.length ? (
          <ul className="entry-list">
            {entries.map(e => {
              const data = e.segments || {}
              return (
                <li key={e.id} className="entry-item">
                  <div className="entry-head">
                    <time>{data.date}</time>
                    <strong> {data.activity}</strong>
                  </div>
                  <pre style={{ whiteSpace:'pre-wrap',padding:'0.5rem' }}>
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </li>
              )
            })}
          </ul>
        ) : (
          <p>No entries yet!</p>
        )}
      </div>
    </div>
)
}