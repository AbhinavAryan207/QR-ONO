import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { getUserScore } from '../utils/scoreUtils'

const QRLogo = () => (
  <div
    className="w-20 h-20 border-2 border-cyan-neon/60 rounded-2xl flex items-center justify-center animate-float mx-auto mb-5"
    style={{ boxShadow: '0 0 30px rgba(77,216,230,0.4), inset 0 0 20px rgba(77,216,230,0.05)' }}
  >
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect x="2" y="2" width="16" height="16" rx="2" stroke="#4dd8e6" strokeWidth="2" />
      <rect x="26" y="2" width="16" height="16" rx="2" stroke="#4dd8e6" strokeWidth="2" />
      <rect x="2" y="26" width="16" height="16" rx="2" stroke="#4dd8e6" strokeWidth="2" />
      <rect x="6" y="6" width="8" height="8" rx="1" fill="#4dd8e6" />
      <rect x="30" y="6" width="8" height="8" rx="1" fill="#4dd8e6" />
      <rect x="6" y="30" width="8" height="8" rx="1" fill="#4dd8e6" />
      <rect x="26" y="26" width="5" height="5" fill="#e84393" />
      <rect x="33" y="26" width="5" height="5" fill="#e84393" />
      <rect x="26" y="33" width="5" height="5" fill="#e84393" />
      <rect x="33" y="33" width="5" height="5" fill="#4dd8e6" />
      <rect x="39" y="26" width="3" height="3" fill="#4dd8e6" />
      <rect x="26" y="39" width="3" height="3" fill="#4dd8e6" />
    </svg>
  </div>
)

export default function HomePage() {
  const [user, setUser] = useState(undefined)
  const [score, setScore] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) getUserScore(session.user.id).then(s => setScore(s ?? 0))
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) getUserScore(session.user.id).then(s => setScore(s ?? 0))
      else setScore(0)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute inset-0 rounded-full border-t border-white/80 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center px-8 md:px-24 overflow-hidden pt-20">

      {/* Top Left Small Header */}
      <div className="absolute top-24 left-8 md:left-24 text-[9px] tracking-[0.4em] text-white/40 uppercase font-inter flex items-center gap-2">
        <span>ORIGINS' MMXXIV</span>
      </div>

      {/* Main Content Area - Centered */}
      <div className="relative z-10 w-full max-w-sm mx-auto text-center flex flex-col items-center animate-fade-in-slow">

        <h1 className="font-cinzel text-5xl md:text-6xl tracking-[0.1em] mb-2 font-bold"
          style={{ color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.4)' }}>
          Onerios-Quests
        </h1>
        <p className="font-inter text-[10px] tracking-[0.4em] text-white/40 uppercase mb-12">
          Scan. Answer. Conquer.
        </p>

        {user ? (
          /* LOGGED IN VIEW */
          <div className="flex flex-col items-center gap-5 w-full">
            {/* Score badge */}
            <div className="glass-card-celestial px-8 py-5 rounded-2xl w-full">
              <p className="font-inter text-[10px] tracking-[0.3em] text-white/40 uppercase mb-1">Your Points</p>
              <p className="font-space font-light text-5xl text-white">{score}</p>
            </div>

            <Link to="/scan" className="w-full">
              <button className="w-full bg-white text-black font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                OPEN SCANNER
              </button>
            </Link>

            <Link to="/leaderboard" className="w-full">
              <div className="glass-card-celestial px-8 py-4 rounded-2xl w-full hover:bg-white/5 transition-colors flex items-center justify-center">
                <span className="text-xs tracking-[0.2em] uppercase text-white hover:text-white transition-colors">
                  Access Leaderboard
                </span>
              </div>
            </Link>
          </div>
        ) : (
          /* LOGGED OUT VIEW */
          <div className="flex flex-col gap-4 w-full">
            <Link to="/register" className="w-full">
              <button className="w-full bg-white text-black font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                REGISTER
              </button>
            </Link>

            <Link to="/login" className="w-full">
              <button className="w-full glass-card-celestial text-white font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/10 transition-colors">
                LOGIN
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Grid Overlay */}
      <div className="absolute bottom-12 left-8 md:left-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-4xl opacity-80 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>

        {/* Stat 1 */}
        <div className="flex flex-col gap-2 border-l border-white/10 pl-4 py-1">
          <div className="text-white/30 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          {user ? (
            <span className="font-space font-light text-3xl">{score}</span>
          ) : (
            <span className="font-space font-light text-3xl">10,000</span>
          )}
          <span className="font-inter text-[8px] tracking-[0.3em] uppercase text-white/40">
            {user ? 'YOUR POINTS' : 'ENTITIES TRACKED'}
          </span>
        </div>

        {/* Stat 2 */}
        <div className="flex flex-col gap-2 border-l border-white/10 pl-4 py-1">
          <div className="text-white/30 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 12h18M12 3v18" />
            </svg>
          </div>
          <span className="font-space font-light text-3xl">50+</span>
          <span className="font-inter text-[8px] tracking-[0.3em] uppercase text-white/40">
            PULSES RECORDED
          </span>
        </div>

        {/* Stat 3 */}
        <div className="flex flex-col gap-2 border-l border-white/10 pl-4 py-1">
          <div className="text-white/30 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="font-space font-light text-3xl">15</span>
          <span className="font-inter text-[8px] tracking-[0.3em] uppercase text-white/40">
            NODES CONNECTED
          </span>
        </div>

        {/* Stat 4 */}
        <div className="flex flex-col gap-2 border-l border-white/10 pl-4 py-1">
          <div className="text-white/30 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span className="font-space font-light text-3xl">24h</span>
          <span className="font-inter text-[8px] tracking-[0.3em] uppercase text-white/40">
            CONSTANT FLOW
          </span>
        </div>

      </div>

      {/* Bottom Footer Text */}
      <div className="absolute bottom-6 left-8 md:left-24 text-[8px] tracking-[0.3em] text-white/20 uppercase font-inter hidden md:block">
        © MMXXIV ONERIOS FLOW. QUIETUDE IN CHAOS.
      </div>

    </div>
  )
}
