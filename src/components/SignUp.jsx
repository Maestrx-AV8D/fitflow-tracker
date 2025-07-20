import React, { useState } from 'react'
import { supabase } from '../supabaseClient.js'

export default function SignUp() {
  const [email,setEmail]=useState(''),[msg,setMsg]=useState('')
  const handle = async e => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email })
    setMsg(error?error.message:'Check your email to verify account!')
  }
  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl">Sign Up</h1>
      <form onSubmit={handle} className="space-y-2">
        <input
          type="email"
          className="w-full p-2 border rounded"
          placeholder="you@example.com"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />
        <button className="w-full py-2 bg-green-500 text-white rounded">
          Create Account
        </button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  )
}