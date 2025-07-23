// src/pages/SmartWorkout.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabaseClient'

export default function SmartWorkout() {
  const navigate = useNavigate()

  // toggle between quick workout vs schedule
  const [view, setView] = useState('workout')

  // — Profile state —
  const [profile, setProfile] = useState(null)

  // — Workout state —
  const [workoutPrompt, setWorkoutPrompt] = useState('')
  const [workout, setWorkout]             = useState(null)
  const [wrkLoading, setWrkLoading]       = useState(false)
  const [wrkError, setWrkError]           = useState('')

  // — Schedule state —
  const [schedPrompt, setSchedPrompt] = useState('')
  const [schedule, setSchedule]       = useState([])
  const [schLoading, setSchLoading]   = useState(false)
  const [schError, setSchError]       = useState('')

  // on mount: load profile, restore any saved workout/schedule
  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('age,gender,height_cm,current_weight_kg')
          .eq('user_id', user.id)
          .single()
        setProfile(profileData)
      }
    })()

    const savedW = localStorage.getItem('smartWorkout')
    if (savedW) setWorkout(JSON.parse(savedW))

    const savedS = localStorage.getItem('smartSchedule')
    if (savedS) setSchedule(JSON.parse(savedS))
  }, [])

  // core system prompts now include serialized profile if available
  function workoutSystem() {
    const base = `You’re a certified fitness coach. When asked for a workout routine, output JSON with three keys: "warmUp", "mainSet", "coolDown". Each is an array of strings.`
    if (profile) {
      return (
        base +
        `\nUser profile — age: ${profile.age}, gender: ${profile.gender}, height_cm: ${profile.height_cm}, weight_kg: ${profile.current_weight_kg}. Tailor the workout appropriately.`
      )
    }
    return base
  }

  function scheduleSystem() {
    const base = `
You’re a certified fitness coach. When asked for a schedule, output JSON with a top-level "plan" array.
Each element in "plan" must be an object with:
  - "date" in YYYY-MM-DD format (starting today),
  - "warmUp": an array of strings,
  - "mainSet": an array of strings like "Exercise Name: sets×reps",
  - "coolDown": an array of strings.
`
    if (profile) {
      return (
        base +
        `\nUser profile — age: ${profile.age}, gender: ${profile.gender}, height_cm: ${profile.height_cm}, weight_kg: ${profile.current_weight_kg}. Tailor each day’s session appropriately.`
      )
    }
    return base
  }

  // persist workout
  function saveWorkout(json) {
    setWorkout(json)
    localStorage.setItem('smartWorkout', JSON.stringify(json))
  }

  // generate one-off workout
  async function handleWorkoutSubmit(e) {
    e.preventDefault()
    if (!workoutPrompt.trim()) return
    setWrkLoading(true)
    setWrkError('')
    setWorkout(null)

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: workoutSystem() },
            { role: 'user', content: workoutPrompt },
          ],
        }),
      })
      if (!res.ok) throw new Error(res.status)
      const { choices } = await res.json()
      const txt = choices[0].message.content
      const json = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1))
      saveWorkout(json)
    } catch (err) {
      console.error(err)
      setWrkError('Could not generate workout—try again.')
    } finally {
      setWrkLoading(false)
    }
  }

  // generate schedule
  async function handleScheduleSubmit(e) {
    e.preventDefault()
    if (!schedPrompt.trim()) return
    setSchLoading(true)
    setSchError('')
    setSchedule([])

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: scheduleSystem() },
            { role: 'user', content: schedPrompt },
          ],
        }),
      })
      if (!res.ok) throw new Error(res.status)
      const { choices } = await res.json()
      const txt = choices[0].message.content
      const obj = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1))
      const plan = obj.plan || []
      setSchedule(plan)
      localStorage.setItem('smartSchedule', JSON.stringify(plan))
    } catch (err) {
      console.error(err)
      setSchError('Could not generate schedule—try again.')
    } finally {
      setSchLoading(false)
    }
  }

  // mark day complete
  function completeDay(idx) {
    const updated = schedule.map((d, i) => (i === idx ? { ...d, done: true } : d))
    setSchedule(updated)
    localStorage.setItem('smartSchedule', JSON.stringify(updated))
  }

  // safe parser to avoid undefined
  const parseExercise = (str) => {
    const [name, rest = ''] = str.split(':')
    const sets = rest.match(/(\d+)×/)?.[1] || ''
    const reps = rest.match(/×(\d+)/)?.[1] || ''
    return { name: name.trim(), sets, reps, weight: '' }
  }

  // import helpers
  function importToLog(day, exercise = null) {
    const entry = {
      date: day.date,
      type: day.mainSet && day.mainSet.length ? 'Gym' : 'Run',
      notes: exercise || (day.mainSet || []).join(', '),
      exercises: [],
      segments: [],
    }

    if (exercise) {
      entry.exercises = [parseExercise(exercise)]
    } else {
      entry.exercises = (day.mainSet || []).map(parseExercise)
    }

    navigate('/log', { state: { entry } })
  }

  function viewFullSchedule() {
    navigate('/schedule')
  }

  return (
    <main className="p-6 bg-neutral-light min-h-screen space-y-6">
      {/* Tab Toggle */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setView('workout')}
          className={`px-4 py-2 rounded ${
            view === 'workout' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Quick Workout
        </button>
        <button
          onClick={() => setView('schedule')}
          className={`px-4 py-2 rounded ${
            view === 'schedule' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Schedule Planner
        </button>
      </div>

      {view === 'workout' ? (
        /* — Quick Workout — */
        <section className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-bold">🏋️ Quick Workout</h2>
          <form onSubmit={handleWorkoutSubmit} className="flex">
            <input
              type="text"
              className="flex-1 border rounded-l px-3 py-2"
              placeholder="E.g. 30 min full-body"
              value={workoutPrompt}
              onChange={(e) => setWorkoutPrompt(e.target.value)}
              disabled={wrkLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r disabled:opacity-50"
              disabled={wrkLoading}
            >
              {wrkLoading ? '…' : 'Go'}
            </button>
          </form>
          {wrkError && <p className="text-red-600">{wrkError}</p>}
          {workout && (
            <div className="space-y-6">
              {['warmUp', 'mainSet', 'coolDown'].map((section) => (
                <div key={section}>
                  <h3 className="text-xl font-semibold mb-1">
                    {section === 'warmUp'
                      ? 'Warm-Up'
                      : section === 'mainSet'
                      ? 'Main Set'
                      : 'Cool-Down'}
                  </h3>
                  <ul
                    className={
                      section === 'mainSet'
                        ? 'space-y-2'
                        : 'list-disc list-inside'
                    }
                  >
                    {(workout[section] || []).map((s, i) => (
                      <li
                        key={i}
                        className={
                          section === 'mainSet' ? 'flex justify-between' : ''
                        }
                      >
                        <span>{s}</span>
                        {section === 'mainSet' && (
                          <button
                            className="text-purple-600 hover:underline"
                            onClick={() =>
                              importToLog(
                                { date: format(new Date(), 'yyyy-MM-dd'), mainSet: [s] },
                                s
                              )
                            }
                          >
                            Import
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {section === 'mainSet' && (
                    <button
                      onClick={() =>
                        importToLog(
                          { date: format(new Date(), 'yyyy-MM-dd'), mainSet: workout.mainSet },
                          null
                        )
                      }
                      className="mt-2 text-sm text-purple-600 hover:underline"
                    >
                      Import All
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* — Schedule Planner — */
        <section className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-bold">📅 Schedule Planner</h2>
          <form onSubmit={handleScheduleSubmit} className="flex">
            <input
              type="text"
              className="flex-1 border rounded-l px-3 py-2"
              placeholder="E.g. Monthly strength program to build muscle"
              value={schedPrompt}
              onChange={(e) => setSchedPrompt(e.target.value)}
              disabled={schLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r disabled:opacity-50"
              disabled={schLoading}
            >
              {schLoading ? '…' : 'Generate'}
            </button>
          </form>
          {schError && <p className="text-red-600">{schError}</p>}
          {schedule.length > 0 && (
            <>
              <div className="flex space-x-2">
                <button
                  onClick={viewFullSchedule}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  View Full Schedule
                </button>
                <button
                  onClick={() => schedule.forEach((d) => importToLog(d))}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Import All Days
                </button>
              </div>
              <div className="space-y-4">
                {schedule.map((day, i) => (
                  <div
                    key={i}
                    className={`p-4 bg-gray-50 rounded ${day.done ? 'opacity-50' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-lg">
                        {format(parseISO(day.date), 'dd/MM/yy')}
                      </div>
                      {!day.done && (
                        <button
                          onClick={() => completeDay(i)}
                          className="text-green-600 hover:underline"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                    {['warmUp', 'mainSet', 'coolDown'].map((sec) => (
                      <div key={sec} className="mb-3">
                        <h4 className="font-semibold">
                          {sec === 'warmUp'
                            ? 'Warm-Up'
                            : sec === 'mainSet'
                            ? 'Main Set'
                            : 'Cool-Down'}
                        </h4>
                        <ul
                          className={
                            sec === 'mainSet'
                              ? 'space-y-1'
                              : 'list-disc list-inside'
                          }
                        >
                          {(day[sec] || []).map((item, j) => (
                            <li
                              key={j}
                              className={
                                sec === 'mainSet' ? 'flex justify-between' : ''
                              }
                            >
                              <span>{item}</span>
                              {sec === 'mainSet' && (
                                <button
                                  className="text-purple-600 hover:underline"
                                  onClick={() => importToLog(day, item)}
                                >
                                  Import
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  )
}