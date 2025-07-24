// src/pages/SmartWorkout.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabaseClient'

export default function SmartWorkout() {
  const navigate = useNavigate()

  // toggle between three views
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

  // — Nutrition state —
  const [mealPrompt, setMealPrompt]       = useState('')
  const [nutritionPlan, setNutritionPlan] = useState(null)
  const [mealAnswer, setMealAnswer]       = useState('')
  const [mealLoading, setMealLoading]     = useState(false)
  const [mealError, setMealError]         = useState('')

  // on mount: load profile + restore saved workout/schedule
  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('age,gender,height_cm,current_weight_kg,goals')
          .eq('user_id', user.id)
          .single()
        setProfile(p)
      }
    })()

    const savedW = localStorage.getItem('smartWorkout')
    if (savedW) setWorkout(JSON.parse(savedW))
    const savedS = localStorage.getItem('smartSchedule')
    if (savedS) setSchedule(JSON.parse(savedS))
  }, [])

  // — System prompts with profile context —
  function workoutSystem() {
    let base = `You’re a certified fitness coach. When asked for a workout routine, output JSON with keys "warmUp","mainSet","coolDown", each an array of strings.`
    if (profile) {
      base += `\nProfile: age ${profile.age}, gender ${profile.gender}, height ${profile.height_cm}cm, weight ${profile.current_weight_kg}kg.`
      if (profile.goals) {
        base += ` Goals: ${profile.goals}.`
      }
    }
    return base
  }

  function scheduleSystem() {
    let base = `
You’re a certified fitness coach. Return JSON { "plan": [ … ] }, each element:
  - date: YYYY-MM-DD
  - warmUp: [strings]
  - mainSet: [ "Exercise: sets×reps" ]
  - coolDown: [strings]
`
    if (profile) {
      base += `\nProfile: age ${profile.age}, gender ${profile.gender}, height ${profile.height_cm}cm, weight ${profile.current_weight_kg}kg.`
      if (profile.goals) {
        base += ` Goals: ${profile.goals}.`
      }
    }
    return base
  }

  function mealSystem() {
    let base = `
You’re a registered dietitian. When asked for a meal plan, output JSON with keys:
  - "breakfast": array of meal objects
  - "lunch": array of meal objects
  - "dinner": array of meal objects
  - "ingredients": array of strings (shopping list)

Each meal object should have:
  - name: string
  - protein_g: number
  - fat_g: number
  - carbs_g: number
  - notes: string (prep time, cost, etc.)

Focus on low-cost, easy prep, high protein, low fat/carbs if goals include weight loss & muscle gain.
`
    if (profile) {
      base += `\nProfile: age ${profile.age}, gender ${profile.gender}, height ${profile.height_cm}cm, weight ${profile.current_weight_kg}kg.`
      if (profile.goals) {
        base += ` Goals: ${profile.goals}.\n`
      }
    }
    base += `
If the user asks a general nutrition question, respond with JSON:
  { "answer": "<plain-text answer>" }
Otherwise respond with the full meal plan and ingredients as above.
`
    return base
  }

  //––––– handlers –––––//

  async function handleWorkoutSubmit(e) {
    e.preventDefault()
    if (!workoutPrompt.trim()) return
    setWrkLoading(true); setWrkError(''); setWorkout(null)
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${import.meta.env.VITE_OPENAI_KEY}`
        },
        body: JSON.stringify({
          model:'gpt-3.5-turbo',
          messages:[
            { role:'system', content: workoutSystem() },
            { role:'user',   content: workoutPrompt }
          ]
        })
      })
      if (!res.ok) throw new Error(res.status)
      const { choices } = await res.json()
      const txt = choices[0].message.content
      const json = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}')+1))
      setWorkout(json)
      localStorage.setItem('smartWorkout', JSON.stringify(json))
    } catch {
      setWrkError('Could not generate workout—try again.')
    } finally {
      setWrkLoading(false)
    }
  }

  async function handleScheduleSubmit(e) {
    e.preventDefault()
    if (!schedPrompt.trim()) return
    setSchLoading(true); setSchError(''); setSchedule([])
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${import.meta.env.VITE_OPENAI_KEY}`
        },
        body: JSON.stringify({
          model:'gpt-3.5-turbo',
          messages:[
            { role:'system', content: scheduleSystem() },
            { role:'user',   content: schedPrompt }
          ]
        })
      })
      if (!res.ok) throw new Error(res.status)
      const { choices } = await res.json()
      const txt = choices[0].message.content
      const obj = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}')+1))
      setSchedule(obj.plan||[])
      localStorage.setItem('smartSchedule', JSON.stringify(obj.plan||[]))
    } catch {
      setSchError('Could not generate schedule—try again.')
    } finally {
      setSchLoading(false)
    }
  }

  async function handleMealSubmit(e) {
    e.preventDefault()
    if (!mealPrompt.trim()) return
    setMealLoading(true); setMealError(''); setNutritionPlan(null); setMealAnswer('')
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${import.meta.env.VITE_OPENAI_KEY}`
        },
        body: JSON.stringify({
          model:'gpt-3.5-turbo',
          messages:[
            { role:'system', content: mealSystem() },
            { role:'user',   content: mealPrompt }
          ]
        })
      })
      if (!res.ok) throw new Error(res.status)
      const { choices } = await res.json()
      const txt = choices[0].message.content
      const obj = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}')+1))

      if (obj.breakfast || obj.lunch || obj.dinner) {
        setNutritionPlan(obj)
      } else if (obj.answer) {
        setMealAnswer(obj.answer)
      } else {
        setMealAnswer(txt.trim())
      }
    } catch {
      setMealError('Could not generate nutrition plan—try again.')
    } finally {
      setMealLoading(false)
    }
  }

  //––––– helpers –––––//

  const parseExercise = str => {
    const [name, rest=''] = str.split(':')
    const sets = rest.match(/(\d+)×/)?.[1]||''
    const reps = rest.match(/×(\d+)/)?.[1]||''
    return { name:name.trim(), sets, reps, weight:'' }
  }

  function importToLog(day, exercise=null) {
    const entry = {
      date: day.date,
      type: day.mainSet?.length ? 'Gym' : 'Run',
      notes: exercise|| day.mainSet?.join(', '),
      exercises: exercise ? [parseExercise(exercise)] : (day.mainSet||[]).map(parseExercise),
      segments: [],
    }
    navigate('/log', { state:{ entry } })
  }

  function completeDay(idx) {
    const updated = schedule.map((d,i)=>
      i===idx ? { ...d, done: !d.done } : d
    )
    setSchedule(updated)
    localStorage.setItem('smartSchedule', JSON.stringify(updated))
  }

  function viewFullSchedule() {
    navigate('/schedule')
  }

  //––––– render –––––//

  return (
    <main className="p-6 bg-neutral-light dark:bg-n-8 min-h-screen space-y-6">

      {/* Tab Toggle */}
      <div className="flex space-x-4 mb-4">
        {['workout','schedule','nutrition'].map(tab=>(
          <button key={tab}
            onClick={()=>setView(tab)}
            className={`px-4 py-2 rounded ${
              view===tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-n-6 dark:text-n-3'
            }`}
          >
            {tab==='workout'?'Quick Workout':tab==='schedule'?'Schedule Planner':'Nutrition'}
          </button>
        ))}
      </div>

      {/* Quick Workout */}
      {view==='workout' && (
        <section className="bg-n-7 text-n-2 p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-bold">🏋️ Quick Workout</h2>
          <form onSubmit={handleWorkoutSubmit} className="flex">
            <input
              type="text"
              className="flex-1 border border-n-4 bg-n-1 text-n-2 placeholder:text-n-4 rounded-l px-3 py-2
                         dark:bg-n-7 dark:border-n-6"
              placeholder="e.g. 30 min full-body"
              value={workoutPrompt}
              onChange={e=>setWorkoutPrompt(e.target.value)}
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
            <div className="space-y-4">
              {['warmUp','mainSet','coolDown'].map(section=>(
                <div key={section}>
                  <h3 className="text-xl font-semibold">
                    {section==='warmUp'?'Warm-Up':section==='mainSet'?'Main Set':'Cool-Down'}
                  </h3>
                  <ul className={section==='mainSet'?'space-y-2':'list-disc list-inside'}>
                    {(workout[section]||[]).map((s,i)=>(
                      <li key={i} className={section==='mainSet'?'flex justify-between':''}>
                        <span>{s}</span>
                        {section==='mainSet' && (
                          <button
                            className="text-purple-500 hover:underline"
                            onClick={()=>importToLog(
                              { date: format(new Date(),'yyyy-MM-dd'), mainSet: [s] }, s
                            )}
                          >
                            Import
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {section==='mainSet' && (
                    <button
                      onClick={()=>importToLog(
                        { date: format(new Date(),'yyyy-MM-dd'), mainSet: workout.mainSet }, null
                      )}
                      className="mt-2 text-sm text-purple-500 hover:underline"
                    >
                      Import All
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Schedule Planner */}
      {view==='schedule' && (
        <section className="bg-n-7 text-n-2 p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-bold">📅 Schedule Planner</h2>
          <form onSubmit={handleScheduleSubmit} className="flex">
            <input
              type="text"
              className="flex-1 border border-n-4 bg-n-1 text-n-2 placeholder:text-n-4 rounded-l px-3 py-2
                         dark:bg-n-7 dark:border-n-6"
              placeholder="e.g. 4-week muscle build"
              value={schedPrompt}
              onChange={e=>setSchedPrompt(e.target.value)}
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
          {schedule.length>0 && (
            <>
              <button
                onClick={viewFullSchedule}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                View Full Schedule
              </button>
              <div className="space-y-4">
                {schedule.map((day,i)=>(
                  <div key={i}
                    className={`p-4 rounded ${
                      day.done
                        ? 'bg-n-6 opacity-50'
                        : 'bg-n-8'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-lg">{format(parseISO(day.date),'dd/MM/yy')}</div>
                      <button
                        onClick={()=>completeDay(i)}
                        className={`font-semibold ${
                          day.done ? 'text-red-500' : 'text-green-500'
                        } hover:underline`}
                      >
                        {day.done ? 'Undo' : 'Complete'}
                      </button>
                    </div>
                    {['warmUp','mainSet','coolDown'].map(sec=>(
                      <div key={sec} className="mb-3">
                        <h4 className="font-semibold">
                          {sec==='warmUp'?'Warm-Up':sec==='mainSet'?'Main Set':'Cool-Down'}
                        </h4>
                        <ul className={sec==='mainSet'?'space-y-1':'list-disc list-inside'}>
                          {(day[sec]||[]).map((item,j)=>(
                            <li key={j} className={sec==='mainSet'?'flex justify-between':''}>
                              <span>{item}</span>
                              {sec==='mainSet' && (
                                <button
                                  className="text-purple-500 hover:underline"
                                  onClick={()=>importToLog(day,item)}
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

      {/* Nutrition Suggestions */}
      {view==='nutrition' && (
        <section className="bg-n-7 text-n-2 p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-bold">🥗 Nutrition Suggestions</h2>
          <form onSubmit={handleMealSubmit} className="flex">
            <input
              type="text"
              className="flex-1 border border-n-4 bg-n-1 text-n-2 placeholder:text-n-4 rounded-l px-3 py-2
                         dark:bg-n-7 dark:border-n-6"
              placeholder="e.g. 3-day meal plan for weight loss & muscle gain"
              value={mealPrompt}
              onChange={e=>setMealPrompt(e.target.value)}
              disabled={mealLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r disabled:opacity-50"
              disabled={mealLoading}
            >
              {mealLoading ? '…' : 'Go'}
            </button>
          </form>
          {mealError && <p className="text-red-600">{mealError}</p>}

          {/* structured meal plan */}
          {nutritionPlan && (
            <>
              {['breakfast','lunch','dinner'].map(type=>(
                <div key={type} className="space-y-2">
                  <h3 className="font-semibold capitalize">{type}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {nutritionPlan[type].map((m,i)=>(
                      <li key={i}>
                        <strong>{m.name}</strong> — Protein {m.protein_g}g, Fat {m.fat_g}g, Carbs {m.carbs_g}g
                        <p className="italic text-sm">{m.notes}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {nutritionPlan.ingredients && (
                <div className="mt-4">
                  <h3 className="font-semibold">🛒 Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {nutritionPlan.ingredients.map((ing,i)=><li key={i}>{ing}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* free-form answer */}
          {mealAnswer && (
            <div className="prose bg-n-7 p-4 rounded text-n-2">
              <p>{mealAnswer}</p>
            </div>
          )}
        </section>
      )}
    </main>
  )
}