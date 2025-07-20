// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import BottomNav from './components/BottomNav'

import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import Log from './pages/Log'
import History from './pages/History'
import Profile from './pages/Profile'

export default function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/signin'

  return (
    <div className="pb-16">
      <Routes>
        {/* Public */}
        <Route path="/signin" element={<SignIn />} />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected */}
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

        {/* Catch-all: redirect unknowns */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Only show bottom nav when signed in (not on /signin) */}
      {!isAuthPage && (
        <RequireAuth>
          <BottomNav />
        </RequireAuth>
      )}
    </div>
  )
}