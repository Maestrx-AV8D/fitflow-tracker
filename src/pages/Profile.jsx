// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Profile() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
  })
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(true)

  // on mount, load the current user’s profile
  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    setLoading(true)
    // get the logged-in user
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser()
    if (getUserError || !user) {
      console.error('Not signed in', getUserError)
      setLoading(false)
      return
    }

    // query by user_id
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading profile:', error)
    } else if (data) {
      setFormData({
        full_name: data.full_name || '',
        age:       data.age != null   ? String(data.age)               : '',
        gender:    data.gender || '',
        height:    data.height_cm != null   ? String(data.height_cm)   : '',
        weight:    data.current_weight_kg != null ? String(data.current_weight_kg) : '',
      })
      setEditing(false) // start in view mode if profile exists
    }

    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser()
    if (getUserError || !user) {
      console.error('Not signed in', getUserError)
      setLoading(false)
      return
    }

    const updates = {
      user_id:           user.id,
      full_name:         formData.full_name,
      age:               Number(formData.age),
      gender:            formData.gender,
      height_cm:         Number(formData.height),
      current_weight_kg: Number(formData.weight),
      updated_at:        new Date(),
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'user_id' })

    if (error) {
      console.error('Error saving profile:', error)
    } else {
      setEditing(false)
    }

    setLoading(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // NEW: log out handler
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Profile</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : editing ? (
        // ——— EDIT FORM CARD ———
        <div className="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block mb-1 font-medium">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Two-column grid for the rest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label htmlFor="age" className="block mb-1 font-medium">
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block mb-1 font-medium">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Height */}
              <div>
                <label htmlFor="height" className="block mb-1 font-medium">
                  Height (cm)
                </label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  required
                />
              </div>

              {/* Weight */}
              <div>
                <label htmlFor="weight" className="block mb-1 font-medium">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded ${
                loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      ) : (
        // ——— VIEW MODE CARD ———
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {formData.full_name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 mb-6">
            <div><strong>Age:</strong> {formData.age}</div>
            <div><strong>Gender:</strong> {formData.gender}</div>
            <div><strong>Height:</strong> {formData.height} cm</div>
            <div><strong>Weight:</strong> {formData.weight} kg</div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
            {/* NEW: Log Out */}
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </main>
  )
}