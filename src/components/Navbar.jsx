// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react'
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')

  // Fetch the user’s full name
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setFullName(data?.full_name || user.email.split('@')[0])
      })
  }, [user])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <header className="flex items-center justify-between px-6 bg-n-8 text-n-1 h-16 fixed inset-x-0 top-0 z-20">
      {/* Logo */}
      <h1 className="text-xl font-semibold">FitFlow</h1>

      {/* (center left intentionally empty now) */}
      <div />

      {/* Profile & Sign out */}
      <div className="flex items-center space-x-4">
        {/* Date */}
        <span className="hidden md:inline text-sm text-n-4">{today}</span>

        {/* Profile link */}
        <NavLink
          to="/profile"
          className="flex items-center space-x-1 text-n-4 hover:text-n-2"
        >
          <UserIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{fullName}</span>
        </NavLink>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="flex items-center space-x-1 text-n-4 hover:text-n-2"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}