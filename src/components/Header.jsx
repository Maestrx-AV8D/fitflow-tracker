import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header">
      <Link to="/dashboard" className="logo">
        <span>Fit</span>Flow
      </Link>
    </header>
  )
}