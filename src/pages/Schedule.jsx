// src/pages/Schedule.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

export default function Schedule() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState([])

  // load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartSchedule')
    if (saved) setPlan(JSON.parse(saved))
  }, [])

  function completeDay(idx) {
    const updated = plan.map((d,i) => i===idx ? { ...d, done: true } : d)
    setPlan(updated)
    localStorage.setItem('smartSchedule', JSON.stringify(updated))
  }

  function importToLog(day, exercise = null) {
    const entry = {
      date: day.date,
      type: day.mainSet && day.mainSet.length ? 'Gym' : 'Run',
      notes: exercise || day.mainSet.join(', '),
      exercises: [],
      segments: []
    }
    if (exercise) {
      const [name, rest] = exercise.split(':')
      const sets = rest.match(/(\d+)×/)?.[1] || ''
      const reps = rest.match(/×(\d+)/)?.[1] || ''
      entry.exercises = [{ name: name.trim(), sets, reps, weight: '' }]
    } else {
      entry.exercises = (day.mainSet || []).map(s => {
        const [name, rest] = s.split(':')
        const sets = rest.match(/(\d+)×/)?.[1] || ''
        const reps = rest.match(/×(\d+)/)?.[1] || ''
        return { name: name.trim(), sets, reps, weight: '' }
      })
    }
    navigate('/log', { state: { entry } })
  }

  return (
    <main className="p-6 bg-neutral-light min-h-screen">
      <h1 className="text-2xl font-bold mb-4">📅 Your Schedule</h1>
      {plan.length === 0 ? (
        <p className="text-gray-600">No schedule available. Generate one in Coach.</p>
      ) : (
        <div className="space-y-4">
          {plan.map((day, i) => (
            <div
              key={i}
              className={`p-4 bg-white rounded shadow ${day.done ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{format(parseISO(day.date), 'dd/MM/yy')}</div>
                <div className="space-x-2">
                  {!day.done && (
                    <button
                      onClick={() => completeDay(i)}
                      className="text-green-600 hover:underline"
                    >
                      Complete
                    </button>
                  )}
                  {/* Import All for this day */}
                  {day.mainSet && day.mainSet.length > 0 && (
                    <button
                      onClick={() => importToLog(day)}
                      className="text-purple-600 hover:underline"
                    >
                      Import All
                    </button>
                  )}
                </div>
              </div>

              {['warmUp', 'mainSet', 'coolDown'].map(sec => (
                <div key={sec} className="mb-2">
                  <h4 className="font-semibold">
                    {sec === 'warmUp' ? 'Warm-Up' : sec === 'mainSet' ? 'Main Set' : 'Cool-Down'}
                  </h4>
                  <ul className={sec === 'mainSet' ? 'space-y-1' : 'list-disc list-inside'}>
                    {(day[sec] || []).map((item, j) => (
                      <li
                        key={j}
                        className={sec === 'mainSet' ? 'flex justify-between' : ''}
                      >
                        <span>{item}</span>
                        {sec === 'mainSet' && (
                          <button
                            onClick={() => importToLog(day, item)}
                            className="text-purple-600 hover:underline"
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
      )}
    </main>
  )
}