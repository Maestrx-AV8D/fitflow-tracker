import React from 'react'
import {
  BellIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  PlusCircleIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

const featuredWorkouts = [
  { title: 'Full Body Blast', subtitle: '45 min • High Intensity', image: '/images/fullbody.jpg' },
  { title: 'Morning Yoga',    subtitle: '30 min • Low Intensity',  image: '/images/yoga.jpg'     },
]

const recentActivities = [
  { title: 'Gym Session',   subtitle: 'Strength • 60 min', duration: '60 min', image: '/images/gym.jpg' },
  { title: 'Evening Run',   subtitle: 'Cardio • 30 min',   duration: '30 min', image: '/images/run.jpg' },
]

export default function HomeMobile() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 1. Status Bar spacer */}
      <div className="h-6 bg-white" />

      {/* 2. Header */}
      <header className="py-2 bg-white shadow flex justify-center">
        <h1 className="text-lg font-medium text-purple-600">FitFlow</h1>
      </header>

      {/* 3. Date & Search */}
      <div className="p-4 bg-white">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Today</span>
          <BellIcon className="h-6 w-6 text-gray-600" />
        </div>
        <div className="mt-3 relative">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Search workouts or activities..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* 4. Featured Carousel */}
      <section className="py-4">
        <h2 className="px-4 text-sm font-semibold text-gray-700">Featured Workouts</h2>
        <div className="mt-3 flex space-x-4 overflow-x-auto px-4">
          {featuredWorkouts.map(w => (
            <div key={w.title} className="min-w-[200px] bg-white rounded-xl shadow p-4">
              <img
                src={w.image}
                alt={w.title}
                className="h-28 w-full object-cover rounded-md"
              />
              <h3 className="mt-2 text-sm font-medium text-gray-800">{w.title}</h3>
              <p className="text-xs text-gray-500">{w.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Filters */}
      <div className="px-4 flex space-x-2">
        <select className="flex-1 bg-white rounded-lg px-3 py-2 text-sm shadow">
          <option>Under 30 min</option>
          <option>Under 15 min</option>
        </select>
        <select className="flex-1 bg-white rounded-lg px-3 py-2 text-sm shadow">
          <option>All Types</option>
          <option>Strength</option>
          <option>Cardio</option>
        </select>
        <select className="flex-1 bg-white rounded-lg px-3 py-2 text-sm shadow">
          <option>4+ Intensity</option>
          <option>3+ Intensity</option>
        </select>
      </div>

      {/* 6. Recent Activities */}
      <section className="mt-4 px-4 flex-1 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-700">Recent Activities</h2>
        <div className="mt-3 space-y-3">
          {recentActivities.map(act => (
            <div
              key={act.title}
              className="bg-white rounded-lg shadow p-3 flex items-center"
            >
              <img
                src={act.image}
                alt={act.title}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-800">{act.title}</h3>
                <p className="text-xs text-gray-500">{act.subtitle}</p>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <ClockIcon className="h-4 w-4 mr-1" /> {act.duration}
                </div>
              </div>
              <span className="text-purple-600 text-sm">›</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Bottom Nav */}
      <nav className="h-16 bg-white border-t flex justify-around items-center">
        <HomeIcon className="h-6 w-6 text-purple-600" />
        <PlusCircleIcon className="h-7 w-7 text-gray-600" />
        <ClockIcon className="h-6 w-6 text-gray-600" />
        <UserIcon className="h-6 w-6 text-gray-600" />
      </nav>
    </div>
  )
}