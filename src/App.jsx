import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom'
import { useAuth } from './hooks/useAuth.jsx'

import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Log from './pages/Log.jsx'
import History from './pages/History.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  const { user, signOut } = useAuth()

  return (
    <Router>
      <header className="app-header">
        <h1>Fitness Tracker</h1>
        <nav className="nav-links">
          {user ? (
            <>
              <Link to="/">Dashboard</Link>
              <Link to="/log">Log</Link>
              <Link to="/history">History</Link>
              <Link to="/profile">Profile</Link>
              <button onClick={signOut}>Sign Out</button>
            </>
          ) : (
            <Link to="/auth">Sign In</Link>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/log"
            element={user ? <Log /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/history"
            element={user ? <History /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/auth" replace />}
          />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </Router>
  )
}