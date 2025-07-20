// src/pages/SignIn.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  // 1) On mount, check URL for magic‐link tokens and auto‐sign in
  useEffect(() => {
    supabase.auth.getSessionFromUrl()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error retrieving session from URL:', error.message)
        } else if (session) {
          // Got a session! Send them to the dashboard
          navigate('/dashboard', { replace: true })
        }
      })
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // send magic link that returns to this exact origin
        emailRedirectTo: window.location.origin
      }
    })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the magic link!')
    }
  }

  return (
    <main className="h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4"
      >
        <h1 className="text-xl font-semibold">Sign In / Sign Up</h1>
        <input
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button className="w-full bg-orange-500 text-white py-2 rounded">
          Send Magic Link to Sign In / Sign Up
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </main>
  )
}