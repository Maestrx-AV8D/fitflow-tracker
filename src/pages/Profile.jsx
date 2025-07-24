// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Profile() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    full_name: '',
    age:       '',
    gender:    '',
    height:    '',
    weight:    ''
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name,age,gender,height_cm,current_weight_kg')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setFormData({
        full_name: data.full_name || '',
        age:       data.age?.toString() || '',
        gender:    data.gender || '',
        height:    data.height_cm?.toString() || '',
        weight:    data.current_weight_kg?.toString() || ''
      })
      setEditing(false)
    } else {
      setEditing(true)
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const updates = {
      user_id: user.id,
      full_name: formData.full_name,
      age: Number(formData.age),
      gender: formData.gender,
      height_cm: Number(formData.height),
      current_weight_kg: Number(formData.weight)
    }
    const { error } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'user_id' })
    if (!error) setEditing(false)
    setLoading(false)
  }

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <main className="p-6 bg-n-8 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg bg-n-7 rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-n-1">Your Profile</h1>

        {loading ? (
          <p className="text-center text-n-5">Loading…</p>
        ) : editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block mb-1 font-medium text-n-2">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full bg-n-6 border border-n-5 text-n-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block mb-1 font-medium text-n-2">
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-n-6 border border-n-5 text-n-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="gender" className="block mb-1 font-medium text-n-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-n-6 border border-n-5 text-n-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="height" className="block mb-1 font-medium text-n-2">
                  Height (cm)
                </label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full bg-n-6 border border-n-5 text-n-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="weight" className="block mb-1 font-medium text-n-2">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full bg-n-6 border border-n-5 text-n-1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-lg ${
                loading ? 'bg-n-5' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-n-1">{formData.full_name}</h2>
            <div className="grid grid-cols-2 gap-4 text-n-3">
              <div><strong>Age:</strong> {formData.age}</div>
              <div><strong>Gender:</strong> {formData.gender}</div>
              <div><strong>Height:</strong> {formData.height} cm</div>
              <div><strong>Weight:</strong> {formData.weight} kg</div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}