// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase }   from '../lib/supabaseClient'
import { useAuth }    from '../hooks/useAuth'
import { PlusIcon }   from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function Dashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [fullName, setFullName]           = useState('')
  const [entryCount, setEntryCount]       = useState(0)
  const [recentEntries, setRecentEntries] = useState([])
  const [chartData, setChartData]         = useState([])
  const [loading, setLoading]             = useState(true)

  // Wait for `user` to resolve
  useEffect(() => {
    if (user === undefined) return        // still checking auth
    if (user === null) {
      navigate('/signin', { replace: true })
      return
    }
    fetchData()
  }, [user, navigate])

  async function fetchData() {
    setLoading(true)
    // 1) Load profile name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()
    setFullName(profile?.full_name || user.email)

    // 2) Count entries
    const { count } = await supabase
      .from('entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setEntryCount(count || 0)

    // 3) Load recent 5 entries
    const { data: entries } = await supabase
      .from('entries')
      .select('id,date,type,exercises,segments')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5)
    setRecentEntries(entries || [])

    // 4) Build last-7-days chart data
    const weekArr = []
    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const d = new Date()
      d.setDate(d.getDate() - daysAgo)
      weekArr.push({
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        count: 0,
      })
    }
    ;(entries || []).forEach(e => {
      const label = new Date(e.date).toLocaleDateString('en-GB', {
        weekday: 'short',
      })
      const slot = weekArr.find(w => w.day === label)
      if (slot) slot.count += 1
    })
    setChartData(weekArr)

    setLoading(false)
  }

  if (loading || user === undefined) {
    return (
      <main className="p-6 bg-neutral-light min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  return (
    <main className="p-6 bg-neutral-light min-h-screen">
      {/* Branding */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-purple-600">FitFlow</h1>
      </div>

      {/* Welcome */}
      <h2 className="text-3xl font-bold mb-6">Welcome, {fullName}!</h2>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Workouts Logged"
          value={entryCount}
          bg="from-purple-500 to-indigo-500"
        />
        <StatCard
          title="Exercises Completed"
          value={
            recentEntries.reduce(
              (sum, e) => sum + (e.exercises?.length || 0),
              0
            )
          }
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

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 shadow mb-8">
        <h3 className="text-lg font-medium mb-4">Workouts This Week</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#7F00FF"
                strokeWidth={2}
              />
            </LineChart>
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
    <div
      className={`bg-gradient-to-r ${bg} text-white p-6 rounded-lg shadow-md`}
    >
      <h4 className="text-sm uppercase tracking-wide">{title}</h4>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  )
}