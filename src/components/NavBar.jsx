import React from 'react'
import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <header className="bg-white border-b py-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-xl font-bold">FitFlow</Link>
        <nav className="space-x-4">
          <Link to="/">Home</Link>
          <Link to="/log">Log</Link>
          <Link to="/history">History</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </div>
    </header>
  )
}