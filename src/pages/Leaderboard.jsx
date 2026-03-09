import { useEffect, useState } from 'react'
import { supabase } from '../supabase/supabaseClient'

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null)
    })
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    setLoading(true)
    const { data, error } = await supabase
      .from('scoreboard')
      .select('user_id, score')
      .order('score', { ascending: false })
      .limit(50)

    if (!error && data) {
      setRows(data)
    }
    setLoading(false)
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return { color: '#FFD700', glow: 'rgba(255,215,0,0.6)', icon: '①' }
    if (rank === 2) return { color: '#C0C0C0', glow: 'rgba(192,192,192,0.4)', icon: '②' }
    if (rank === 3) return { color: '#CD7F32', glow: 'rgba(205,127,50,0.4)', icon: '③' }
    return { color: 'rgba(255,255,255,0.4)', glow: null, icon: null }
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16 scanline-bg">
      {/* Ambient */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-5"
        style={{ background: 'radial-gradient(circle, #4dd8e6, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <span className="font-orbitron text-xs tracking-[0.3em] text-white/30 uppercase block mb-2">
            Hunter Rankings
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl text-white mb-2">
            <span style={{ background: 'linear-gradient(135deg, #4dd8e6, #88f0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Leaderboard
            </span>
          </h1>
          <p className="font-cormorant text-white/40 text-lg">
            The elite hunters of the arena.
          </p>
        </div>

        {/* Podium — top 3 */}
        {!loading && rows.length >= 3 && (
          <div className="flex items-end justify-center gap-2 mb-6 animate-fade-in">
            {/* 2nd */}
            <PodiumCard rank={2} row={rows[1]} currentUserId={currentUserId} />
            {/* 1st */}
            <PodiumCard rank={1} row={rows[0]} currentUserId={currentUserId} tall />
            {/* 3rd */}
            <PodiumCard rank={3} row={rows[2]} currentUserId={currentUserId} />
          </div>
        )}

        {/* Full table */}
        <div className="glass-card-celestial relative animate-slide-up overflow-hidden">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Table header */}
          <div className="grid grid-cols-[40px_1fr_80px] gap-2 px-5 py-3 border-b border-white/10">
            <span className="font-inter text-xs font-light text-white/40 uppercase tracking-[0.2em]">#</span>
            <span className="font-inter text-xs font-light text-white/40 uppercase tracking-[0.2em]">Hunter</span>
            <span className="font-inter text-xs font-light text-white/40 uppercase tracking-[0.2em] text-right">Score</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border border-white/20" />
                <div className="absolute inset-0 rounded-full border-t border-white/80 animate-spin" />
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16">
              <span className="font-space text-4xl text-white/10 block mb-3">◈</span>
              <p className="font-inter text-white/30 font-light text-sm">No scores yet. Be the first hunter!</p>
            </div>
          ) : (
            <div>
              {rows.map((row, i) => {
                const rank = i + 1
                const { color, glow, icon } = getRankStyle(rank)
                const isMe = row.user_id === currentUserId

                return (
                  <div
                    key={row.user_id}
                    className={`grid grid-cols-[40px_1fr_80px] gap-2 items-center px-5 py-3.5 border-b border-white/5 last:border-b-0 transition-colors duration-150
                      ${isMe ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    style={isMe ? { borderLeft: '2px solid rgba(255,255,255,0.8)' } : {}}
                  >
                    {/* Rank */}
                    <span
                      className="font-space text-sm font-light"
                      style={{ color, textShadow: glow ? `0 0 10px ${glow}` : 'none' }}
                    >
                      {icon ?? rank}
                    </span>

                    {/* User */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 font-inter font-medium text-xs text-black"
                        style={{
                          background: isMe ? '#ffffff' : 'rgba(255,255,255,0.1)',
                          color: isMe ? '#000000' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {row.user_id.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-inter font-light text-sm text-white/80 truncate">
                          {row.user_id.substring(0, 8)}…
                          {isMe && (
                            <span className="ml-2 font-inter text-[10px] tracking-wider text-white/60">(YOU)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <span
                      className="font-space text-sm font-light text-right"
                      style={{
                        color: isMe ? '#ffffff' : 'rgba(255,255,255,0.7)',
                        textShadow: isMe ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
                      }}
                    >
                      {row.score}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Refresh */}
        <div className="text-center mt-6">
          <button
            onClick={fetchLeaderboard}
            className="btn-neon-cyan !px-5 !py-2"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PodiumCard({ rank, row, currentUserId, tall }) {
  const colors = {
    1: { border: '#FFD700', glow: 'rgba(255,215,0,0.3)', label: '1st', text: '#FFD700' },
    2: { border: '#C0C0C0', glow: 'rgba(192,192,192,0.2)', label: '2nd', text: '#C0C0C0' },
    3: { border: '#CD7F32', glow: 'rgba(205,127,50,0.2)', label: '3rd', text: '#CD7F32' },
  }
  const c = colors[rank]
  const isMe = row?.user_id === currentUserId

  return (
    <div
      className={`glass-card flex flex-col items-center p-3 rounded-xl transition-all ${tall ? 'py-5 scale-105' : ''}`}
      style={{
        borderColor: `${c.border}40`,
        boxShadow: `0 0 20px ${c.glow}`,
        minWidth: '90px',
        flex: 1,
        maxWidth: '150px',
      }}
    >
      <span className="font-orbitron text-xl mb-1" style={{ color: c.text, textShadow: `0 0 10px ${c.glow}` }}>
        {c.label}
      </span>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center font-orbitron text-sm mb-1"
        style={{
          background: `${c.border}15`,
          border: `1px solid ${c.border}40`,
          color: c.text,
        }}
      >
        {row?.user_id?.substring(0, 2).toUpperCase()}
      </div>
      <span className="font-orbitron text-xs text-white/30 mb-1 truncate max-w-full px-1">
        {row?.user_id?.substring(0, 6)}…{isMe && ' (you)'}
      </span>
      <span className="font-orbitron text-base font-bold" style={{ color: '#4dd8e6' }}>
        {row?.score ?? 0}
      </span>
      <span className="font-manrope text-[10px] text-white/30">pts</span>
    </div>
  )
}
