import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(2,3,10,0.85)', backdropFilter: 'blur(20px)' }}
    >
      <div className="px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-7 h-7 border border-cyan-neon/60 rounded flex items-center justify-center"
            style={{ boxShadow: '0 0 8px rgba(77,216,230,0.3)' }}
          >
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="#4dd8e6" strokeWidth="1.5"/>
              <rect x="11" y="1" width="6" height="6" rx="1" stroke="#4dd8e6" strokeWidth="1.5"/>
              <rect x="1" y="11" width="6" height="6" rx="1" stroke="#4dd8e6" strokeWidth="1.5"/>
              <rect x="3" y="3" width="2" height="2" fill="#4dd8e6"/>
              <rect x="13" y="3" width="2" height="2" fill="#4dd8e6"/>
              <rect x="3" y="13" width="2" height="2" fill="#4dd8e6"/>
              <rect x="11" y="11" width="2" height="2" fill="#e84393"/>
              <rect x="15" y="11" width="2" height="2" fill="#e84393"/>
              <rect x="11" y="15" width="2" height="2" fill="#e84393"/>
              <rect x="15" y="15" width="2" height="2" fill="#e84393"/>
            </svg>
          </div>
          <span className="font-orbitron font-bold text-base tracking-widest text-neon-cyan">Onerios-Quests</span>
        </Link>

        {/* Right side — only shown when logged in */}
        {user && (
          <div className="flex items-center gap-4">
            <span className="font-manrope text-sm font-medium text-white/80 hidden sm:inline-block">
              {user.user_metadata?.name || 'Hunter'}
            </span>
            <button
              onClick={handleLogout}
              className="font-manrope text-xs text-white/40 hover:text-pink-neon transition-colors tracking-wide"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
