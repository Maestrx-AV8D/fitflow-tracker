// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import RequireAuth from './components/RequireAuth'
import BottomNav from './components/BottomNav'

import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import Log from './pages/Log'
import History from './pages/History'
import Profile from './pages/Profile'

export default function App() {
  const user = useAuth()

  return (
    <div className="pb-16">
      <Routes>
        {/* Always send root or unknown paths to SignIn */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />

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