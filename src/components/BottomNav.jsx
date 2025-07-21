import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  HomeIcon, PlusCircleIcon, ClockIcon,
  SparklesIcon, CalendarDaysIcon, UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabaseClient'

export default function BottomNav() {
  const navigate = useNavigate()
  const tabs = [
    { to:'/dashboard', Icon:HomeIcon,       label:'Home'    },
    { to:'/log',       Icon:PlusCircleIcon, label:'Log'     },
    { to:'/history',   Icon:ClockIcon,      label:'History' },
    { to:'/coach',     Icon:SparklesIcon,   label:'Coach'   },
    { to:'/schedule',  Icon:CalendarDaysIcon,label:'Schedule'},
    { to:'/profile',   Icon:UserIcon,       label:'Profile' },
  ]

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/signin',{replace:true})
  }

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t">
      <ul className="flex justify-around py-2">
        {tabs.map(({to,Icon,label})=>(
          <li key={to}>
            <NavLink to={to}
              className={({isActive})=>
                'flex flex-col items-center text-sm '+' ' +
                (isActive?'text-orange-500':'text-gray-500')}>
              <Icon className="h-6 w-6"/>
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <button onClick={handleSignOut}
            className="flex flex-col items-center text-sm text-gray-500 hover:text-red-600">
            <ArrowRightOnRectangleIcon className="h-6 w-6"/>
            Sign Out
          </button>
        </li>
      </ul>
    </nav>
  )
}