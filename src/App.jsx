// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import RequireAuth from './components/RequireAuth'
import BottomNav   from './components/BottomNav'

import SignIn   from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import Log       from './pages/Log'
import History   from './pages/History'
import Profile   from './pages/Profile'

export default function App() {
  const user = useAuth()

  return (
    <div className="pb-16 bg-neutral-light min-h-screen">
      <Routes>
        {/* Catch-all: let React Router handle redirect logic */}
        <Route path="*" element={<Navigate to="/signin" replace />} />

        {/* Public */}
        <Route path="/signin" element={<SignIn />} />

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
      </Routes>

      {/* Bottom nav only for signed-in users */}
      {user && <BottomNav />}
    </div>
  )
}