import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Auth() {
  const { user, signUp, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback(null)
    const action = isSignup ? signUp : signIn
    const { error } = await action(email, password)
    if (error) setFeedback(error.message)
  }

  if (user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Welcome, {user.email}</h2>
          <button className="auth-button" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-title">
          {isSignup ? 'Create Account' : 'Sign In'}
        </h2>

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-button" type="submit">
          {isSignup ? 'Sign Up' : 'Sign In'}
        </button>

        {feedback && (
          <p style={{ color: 'red', marginTop: '.5rem' }}>{feedback}</p>
        )}

        <p className="auth-toggle">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            className="auth-toggle-button"
            onClick={() => setIsSignup((s) => !s)}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </div>
  )
}