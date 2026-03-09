import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 scanline-bg">
      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #4dd8e6, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-cinzel font-bold text-4xl text-white tracking-widest mb-2" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.4)' }}>Onerios-Quests</h1>
          </Link>
          <p className="font-inter text-[10px] tracking-[0.4em] text-white/40 uppercase">Access Terminal</p>
        </div>

        <div className="glass-card-celestial relative p-8">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <h2 className="font-inter font-light text-xl text-white mb-8 text-center tracking-[0.2em] uppercase">Sign In</h2>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm font-inter">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block font-inter text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hunter@arena.io"
                className="input-celestial"
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label className="block font-inter text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-celestial"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-2"
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-inter font-light text-xs text-white/40">
              No account?{' '}
              <Link to="/register" className="text-white hover:text-white/80 transition-colors underline underline-offset-4">
                Register here
              </Link>
            </p>
          </div>

          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>
  )
}
