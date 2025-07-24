// src/pages/Schedule.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function Schedule() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState([])
  const [showCompleted, setShowCompleted] = useState(true)

  // load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartSchedule')
    if (saved) setPlan(JSON.parse(saved))
  }, [])

  // persist helper
  function persist(newPlan) {
    setPlan(newPlan)
    localStorage.setItem('smartSchedule', JSON.stringify(newPlan))
  }

  // mark complete
  function completeDay(idx) {
    persist(plan.map((d, i) => (i === idx ? { ...d, done: true } : d)))
  }

  // remove a single day
  function removeDay(idx) {
    persist(plan.filter((_, i) => i !== idx))
  }

  // clear entire schedule
  function clearAll() {
    if (window.confirm('This will remove your entire schedule. Are you sure?')) {
      persist([])
    }
  }

  // import into log
  function importToLog(day, exercise = null) {
    const entry = {
      date: day.date,
      type: day.mainSet?.length ? 'Gym' : 'Run',
      notes: exercise || day.mainSet.join(', '),
      exercises: [],
      segments: [],
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

  const filteredPlan = plan.filter(d => (showCompleted ? true : !d.done))

  return (
    <main className="p-6 bg-n-8 min-h-screen">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-n-1">📅 Your Schedule</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCompleted(s => !s)}
            className="text-sm text-n-4 hover:underline"
          >
            {showCompleted ? 'Hide' : 'Show'} Completed
          </button>
          {plan.length > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
      </header>

      {plan.length === 0 ? (
        <p className="text-n-5">No schedule available. Generate one in Coach.</p>
      ) : (
        <>
          <p className="text-sm text-n-5 mb-2">
            Showing {filteredPlan.length} of {plan.length} days
          </p>
          <div className="space-y-4">
            {filteredPlan.map((day, i) => {
              const originalIdx = plan.findIndex(d => d.date === day.date)
              return (
                <div
                  key={day.date}
                  className={`p-4 bg-n-7 rounded-2xl shadow-md flex flex-col ${
                    day.done ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-n-1">
                      {format(parseISO(day.date), 'dd/MM/yy')}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!day.done && (
                        <button
                          onClick={() => completeDay(originalIdx)}
                          className="text-green-400 hover:underline text-sm"
                        >
                          Complete
                        </button>
                      )}
                      {day.mainSet?.length > 0 && (
                        <button
                          onClick={() => importToLog(day)}
                          className="text-purple-400 hover:underline text-sm"
                        >
                          Import
                        </button>
                      )}
                      <button
                        onClick={() => removeDay(originalIdx)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {['warmUp', 'mainSet', 'coolDown'].map(sec => (
                    <div key={sec} className="mb-2">
                      <h4 className="font-semibold text-n-2">
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
                            : 'list-disc list-inside text-n-3'
                        }
                      >
                        {(day[sec] || []).map((item, j) => (
                          <li
                            key={j}
                            className={sec === 'mainSet' ? 'flex justify-between' : ''}
                          >
                            <span className="text-n-1">{item}</span>
                            {sec === 'mainSet' && (
                              <button
                                onClick={() => importToLog(day, item)}
                                className="text-purple-400 hover:underline text-sm"
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
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}