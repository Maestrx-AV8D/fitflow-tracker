// src/pages/SignIn.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function SignIn() {
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const navigate              = useNavigate();

  // Auto‐consume magic link token if present in URL
  useEffect(() => {
    async function handleAuthFromUrl() {
      const hasHelper = typeof supabase.auth.getSessionFromUrl === 'function';
      const { data, error } = hasHelper
        ? await supabase.auth.getSessionFromUrl({ storeSession: true })
        : await supabase.auth.getSession();

      if (error) {
        console.error('Auth URL error:', error.message);
      } else if (data?.session) {
        navigate('/dashboard', { replace: true });
      }
    }
    handleAuthFromUrl();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) setMessage(error.message);
    else       setMessage('✅ Check your email for the magic link!');
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-n-8 p-4">
      <div className="w-full max-w-sm bg-n-7 rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-n-1 text-center">
          Sign In / Sign Up
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-n-3">
            Email address
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-n-8 border border-n-6 rounded-lg px-4 py-2 text-n-1 placeholder:text-n-5 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            Send Magic Link
          </button>
        </form>
        {message && (
          <p className="text-center text-sm text-n-3">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}