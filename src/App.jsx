import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Header      from './components/Header'
import RequireAuth from './components/RequireAuth'
import BottomNav   from './components/BottomNav'

import SignIn       from './pages/SignIn'
import Dashboard    from './pages/Dashboard'
import Log          from './pages/Log'
import History      from './pages/History'
import Profile      from './pages/Profile'
import SmartWorkout from './pages/SmartWorkout'
import Schedule     from './pages/Schedule'

export default function App() {
  const { user } = useAuth()

  return (
    <div className="pb-16 bg-neutral-light min-h-screen">
      <Header />

      <Routes>
        {/* public */}
        <Route path="/signin" element={<SignIn />} />

        {/* protected */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/log"
          element={
            <RequireAuth>
              <Log />
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <History />
            </RequireAuth>
          }
        />
        <Route
          path="/coach"
          element={
            <RequireAuth>
              <SmartWorkout />
            </RequireAuth>
          }
        />
        <Route
          path="/schedule"
          element={
            <RequireAuth>
              <Schedule />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        {/* catch-all → redirect based on auth */}
        <Route
          path="*"
          element={
            <Navigate to={user ? '/dashboard' : '/signin'} replace />
          }
        />
      </Routes>

      {/* only show bottom nav once signed in */}
      {user && <BottomNav />}
    </div>
  )
}