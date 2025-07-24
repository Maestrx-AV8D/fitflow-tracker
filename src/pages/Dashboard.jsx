// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { PlusIcon } from '@heroicons/react/24/outline'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName]           = useState('')
  const [entryCount, setEntryCount]       = useState(0)
  const [recentEntries, setRecentEntries] = useState([])
  const [chartData, setChartData]         = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (user === undefined) return
    if (user === null) {
      navigate('/signin', { replace: true })
      return
    }
    fetchData()
  }, [user, navigate])

  async function fetchData() {
    setLoading(true)
    // Load user name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()
    setFullName(profile?.full_name || user.email)

    // Total workouts
    const { count } = await supabase
      .from('entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setEntryCount(count || 0)

    // Recent entries
    const { data: entries } = await supabase
      .from('entries')
      .select('id,date,type,exercises,segments')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5)
    setRecentEntries(entries || [])

    // Build stacked data for last 7 days
    const weekArr = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      weekArr.push({ day: d.toLocaleDateString('en-GB',{weekday:'short'}), Gym:0, Cycle:0, Other:0 })
    }
    ;(entries || []).forEach(e => {
      const label = new Date(e.date).toLocaleDateString('en-GB',{weekday:'short'})
      const slot = weekArr.find(w => w.day === label)
      if (slot) {
        if (e.type === 'Gym') slot.Gym++
        else if (e.type === 'Cycle') slot.Cycle++
        else slot.Other++
      }
    })
    setChartData(weekArr)
    setLoading(false)
  }

  if (loading || user === undefined) {
    return (
      <main className="p-6 bg-n-8 min-h-screen flex items-center justify-center">
        <p className="text-n-4">Loading...</p>
      </main>
    )
  }

  return (
    <main className="p-6 bg-n-8 min-h-screen">
      {/* Branding */}
      <div className="mb-6">
        <h1 className="h1 text-purple-500">FitFlow</h1>
      </div>

      {/* Welcome */}
      <h2 className="h2 mb-6 text-n-2">Welcome, {fullName}!</h2>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard title="Workouts Logged" value={entryCount} bg="from-purple-500 to-indigo-500" />
        <StatCard
          title="Exercises Completed"
          value={recentEntries.reduce((sum,e) => sum + (e.exercises?.length||0),0)}
          bg="from-green-500 to-teal-500"
        />
        <StatCard
          title="Latest Workout"
          value={
            recentEntries[0]
              ? new Date(recentEntries[0].date).toLocaleDateString('en-GB')
              : '—'
          }
          bg="from-yellow-500 to-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <NavLink
          to="/log"
          className="flex-1 bg-n-6 hover:bg-n-5 text-n-1 p-4 rounded-xl text-center shadow"
        >
          Log a Workout
        </NavLink>
        <NavLink
          to="/coach"
          className="flex-1 bg-n-6 hover:bg-n-5 text-n-1 p-4 rounded-xl text-center shadow"
        >
          Generate Workout Plan
        </NavLink>
      </div>

      {/* Stacked Bar Chart */}
      <div className="bg-n-7 rounded-3xl p-6 shadow-lg mb-8">
        <h3 className="h3 mb-4 text-n-2">Workouts This Week</h3>
        <div className="h-48">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#AAA" />
              <YAxis allowDecimals={false} stroke="#AAA" />
              <Tooltip
                wrapperStyle={{ backgroundColor: '#1B1B2E', borderRadius: 4 }}
                contentStyle={{ color: '#EEE' }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={v => <span className="text-n-2">{v}</span>}
              />
              {/* Smaller 4px radius on each corner */}
              <Bar dataKey="Gym" stackId="a" fill="#7F00FF" radius={[4,4,4,4]} />
              <Bar dataKey="Cycle" stackId="a" fill="#00BFA6" radius={[4,4,4,4]} />
              <Bar dataKey="Other" stackId="a" fill="#FFB300" radius={[4,4,4,4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Floating Log Button */}
      <button
        aria-label="Log Workout"
        onClick={() => navigate('/log')}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-teal-400 to-blue-500 text-white p-4 rounded-full shadow-lg hover:scale-105 transition"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
    </main>
  )
}

function StatCard({ title, value, bg }) {
  return (
    <div className={`bg-gradient-to-r ${bg} text-white p-6 rounded-xl shadow-md`}>
      <h4 className="caption uppercase mb-2">{title}</h4>
      <p className="h2">{value}</p>
    </div>
  )
}