// src/components/Sidebar.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function Sidebar({ isOpen, onClose, className = '' }) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 w-64 bg-n-7 text-n-2 p-6
        transform transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-auto
        z-30
        ${className}
      `}
    >
      {/* Mobile header */}
      <div className="flex items-center justify-between mb-8 md:hidden">
        <h2 className="h4 text-n-2">FitFlow</h2>
        <button onClick={onClose} aria-label="Close menu">
          <XMarkIcon className="h-6 w-6 text-n-2" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="space-y-4">
        {[
          { to: '/dashboard', Icon: HomeIcon,                 label: 'Dashboard' },
          { to: '/log',       Icon: ClipboardDocumentCheckIcon,label: 'Log'       },
          { to: '/history',   Icon: ClockIcon,                label: 'History'   },
          { to: '/coach',     Icon: SparklesIcon,             label: 'Coach'     },
          { to: '/schedule',  Icon: ClipboardDocumentListIcon, label: 'Schedule' },
          { to: '/profile',   Icon: UserCircleIcon,           label: 'Profile'   },
        ].map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center space-x-3 hover:text-n-1"
            onClick={onClose}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}