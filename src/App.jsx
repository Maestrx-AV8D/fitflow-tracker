// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import RequireAuth from './components/RequireAuth'
import BottomNav from './components/BottomNav'

import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import Log from './pages/Log'
import History from './pages/History'
import Profile from './pages/Profile'

/**
 * Redirects to /dashboard if logged in, otherwise to /signin.
 */
function HomeRedirect() {
  const user = useAuth()
  return <Navigate to={user ? '/dashboard' : '/signin'} replace />
}

export default function App() {
  const location = useLocation()
  const user = useAuth()

  return (
    <div className="pb-16">
      <Routes>
        {/* root and unknown paths */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />

        {/* public auth page */}
        <Route path="/signin" element={<SignIn />} />

        {/* protected application routes */}
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
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
      </Routes>

      {/* show bottom nav only when authenticated */}
      {user && <BottomNav />}
    </div>
  )
}