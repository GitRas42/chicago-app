import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      navigate('/')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 bg-surface rounded-card p-8"
        style={{ boxShadow: 'var(--shadow-raised)' }}
      >
        <h1 className="text-2xl font-semibold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Chicago
        </h1>

        {error && (
          <p role="alert" className="text-red-700 text-sm bg-red-50 border border-red-200 rounded p-2">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-text">
          E-post
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="border border-border rounded px-3 py-2 bg-cream focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text">
          Lösenord
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
            className="border border-border rounded px-3 py-2 bg-cream focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-hover text-cream font-medium rounded px-4 py-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Skapar konto…' : 'Skapa konto'}
        </button>

        <p className="text-sm text-center text-text-muted">
          Har du redan ett konto?{' '}
          <Link to="/login" className="text-primary underline">
            Logga in
          </Link>
        </p>
      </form>
    </main>
  )
}
