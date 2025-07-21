import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // not signed in → redirect to sign-in, preserving where they were headed
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}