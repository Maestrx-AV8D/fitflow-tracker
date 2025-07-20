import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  PlusCircleIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function BottomNav() {
  const tabs = [
    { to: '/dashboard', Icon: HomeIcon, label: 'Home' },
    { to: '/log', Icon: PlusCircleIcon, label: 'Log' },
    { to: '/history', Icon: ClockIcon, label: 'History' },
    { to: '/profile', Icon: UserIcon, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t">
      <ul className="flex justify-around py-2">
        {tabs.map(({ to, Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                'flex flex-col items-center text-sm ' +
                (isActive ? 'text-orange-500' : 'text-gray-500')
              }
            >
              <Icon className="h-6 w-6" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}