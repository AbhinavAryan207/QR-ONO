export default function QuestionCard({ question, children }) {
  return (
    <div className="glass-card-celestial relative p-6 sm:p-10 animate-slide-up">
      {/* Top accent line */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Question label */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        <span className="font-inter font-light text-[9px] tracking-[0.3em] text-white/50 uppercase">Current Parameter</span>
      </div>

      {/* Question text */}
      <p className="font-space font-light text-xl sm:text-2xl text-white leading-relaxed mb-8">
        {question}
      </p>

      {/* Answer options slot */}
      <div className="flex flex-col gap-4">
        {children}
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}
