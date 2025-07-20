import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Onboarding() {
  const nav = useNavigate()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Welcome to FitFlow!</h1>
      <p>Start by logging your first activity.</p>
      <button onClick={() => nav('/dashboard')} className="btn">
        Go to Dashboard
      </button>
    </div>
  )
}