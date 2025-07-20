import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage(error.message);
    else setMessage(`Check your email for the magic link!`);
  };

  return (
    <main className="h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4"
      >
        <h1 className="text-xl font-semibold">Sign In / Sign Up</h1>
        <input
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button className="w-full bg-orange-500 text-white py-2 rounded">
          Send Magic Link to Sign In / Sign Up
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </main>
  );
}