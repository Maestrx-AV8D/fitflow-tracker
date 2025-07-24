// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import Card from './components/Card'
import RequireAuth from './components/RequireAuth'

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
    <div className="flex flex-col h-screen bg-n-8 text-n-1">
      {/* Top bar */}
      <Navbar />

      {/* Main content area */}
      <div className="flex-1 overflow-auto pt-16 pb-16">
        <main className="container mx-auto px-4 md:px-6 lg:px-8">
          <Routes>
            {/* Public */}
            <Route path="/signin" element={<SignIn />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Card><Dashboard /></Card>
                </RequireAuth>
              }
            />
            <Route
              path="/log"
              element={
                <RequireAuth>
                  <Card><Log /></Card>
                </RequireAuth>
              }
            />
            <Route
              path="/history"
              element={
                <RequireAuth>
                  <Card><History /></Card>
                </RequireAuth>
              }
            />
            <Route
              path="/coach"
              element={
                <RequireAuth>
                  <Card><SmartWorkout /></Card>
                </RequireAuth>
              }
            />
            <Route
              path="/schedule"
              element={
                <RequireAuth>
                  <Card><Schedule /></Card>
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Card><Profile /></Card>
                </RequireAuth>
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={user ? '/dashboard' : '/signin'} replace />}
            />
          </Routes>
        </main>
      </div>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  )
}