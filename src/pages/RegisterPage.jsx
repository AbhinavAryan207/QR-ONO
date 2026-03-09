import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (name.trim().length === 0) {
      setError('Name is required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name.trim()
        }
      }
    })
    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card-celestial p-10 max-w-md w-full text-center animate-slide-up">
          <div className="text-5xl mb-6 text-white" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>✓</div>
          <h2 className="font-inter font-light tracking-[0.2em] uppercase text-xl text-white mb-4">Account Created</h2>
          <p className="font-inter font-light text-white/50 text-sm mb-8 leading-relaxed">
            Check your email to confirm your account, then come back and sign in.
          </p>
          <Link to="/login">
            <button className="w-full bg-white text-black font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">GO TO LOGIN</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 scanline-bg">
      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #e84393, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-cinzel font-bold text-4xl text-white tracking-widest mb-2" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.4)' }}>Onerios-Quests</h1>
          </Link>
          <p className="font-inter text-[10px] tracking-[0.4em] text-white/40 uppercase">Create Hunter Profile</p>
        </div>

        <div className="glass-card-celestial relative p-8">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <h2 className="font-inter font-light text-xl text-white mb-8 text-center tracking-[0.2em] uppercase">Register</h2>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm font-inter">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div>
              <label className="block font-inter text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Hunter Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Neo / Trinity"
                className="input-celestial"
                autoComplete="name"
              />
            </div>

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

            <div>
              <label className="block font-inter text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="input-celestial"
                autoComplete="new-password"
              />
            </div>

            <div className="mb-2">
              <label className="block font-inter text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className="input-celestial"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-2"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-inter font-light text-xs text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-white/80 transition-colors underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>

          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>
  )
}
