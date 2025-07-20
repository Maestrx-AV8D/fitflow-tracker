// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [entryCount, setEntryCount] = useState(0)
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    // get current user
    const {
      data: { user: currentUser },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !currentUser) {
      console.error('Not signed in', userError)
      setLoading(false)
      return
    }

    const userId = currentUser.id

    // — fetch profile to get full_name —
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.warn('No profile found:', profileError.message)
      setFullName(currentUser.email)
    } else {
      setFullName(profileData.full_name || currentUser.email)
    }

    // — fetch total workout count —
    const { count, error: countError } = await supabase
      .from('entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      console.error('Error counting entries:', countError)
    } else {
      setEntryCount(count)
    }

    // — fetch 5 most recent entries —
    const { data: entriesData, error: entriesError } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5)

    if (entriesError) {
      console.error('Error loading recent entries:', entriesError)
    } else {
      setRecentEntries(entriesData || [])
    }

    setLoading(false)
  }

  return (
    <main className="p-6">
      {/* ——— Branding ——— */}
      <div className="mb-6 flex items-center">
        <div className="text-4xl font-extrabold text-purple-600">
          FitFlow
        </div>
      </div>

      {/* ——— Welcome ——— */}
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {fullName}!
      </h1>

      {loading ? (
        <p>Loading your dashboard…</p>
      ) : (
        <>
          {/* ——— Stats Cards ——— */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <StatCard
              title="Workouts Logged"
              value={entryCount}
              bg="from-purple-500 to-indigo-500"
            />
            <StatCard
              title="Exercises Completed"
              value={recentEntries.reduce(
                (sum, e) => sum + (e.exercises?.length || 0),
                0
              )}
              bg="from-green-500 to-teal-500"
            />
            <StatCard
              title="Latest Workout"
              value={
                recentEntries[0]
                  ? new Date(
                      recentEntries[0].date
                    ).toLocaleDateString('en-GB')
                  : '—'
              }
              bg="from-yellow-500 to-orange-500"
            />
          </div>

          {/* ——— Recent Entries List ——— */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Recent Workouts
            </h2>
            {recentEntries.length === 0 ? (
              <p className="text-gray-600">
                You haven’t logged any workouts yet.
                <br />
                Head over to Log to get started!
              </p>
            ) : (
              <ul className="space-y-4">
                {recentEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">
                        {new Date(
                          entry.date
                        ).toLocaleDateString('en-GB')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {entry.type}
                      </span>
                    </div>
                    <ul className="list-disc ml-5">
                      {entry.exercises.map((ex, i) => (
                        <li key={i}>
                          <span className="font-medium">
                            {ex.name}
                          </span>
                          {`: ${ex.sets}×${ex.reps}`}
                          {ex.weight
                            ? ` @ ${ex.weight}kg`
                            : ''}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  )
}

// ——— Simple StatCard Component ———
function StatCard({ title, value, bg }) {
  return (
    <div
      className={`bg-gradient-to-r ${bg} text-white p-6 rounded-lg shadow-md`}
    >
      <h3 className="text-sm uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  )
}