/**
 * A single MCQ answer button.
 *
 * Props:
 *   label       - "A" | "B" | "C" | "D"
 *   text        - option text
 *   selected    - bool (this option is currently selected)
 *   result      - null | "correct" | "wrong"  (after submission)
 *   disabled    - bool
 *   onClick     - handler
 */
export default function AnswerButton({ label, text, selected, result, disabled, onClick }) {
  const baseClass =
    'w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left font-inter font-light text-sm transition-all duration-300 cursor-pointer backdrop-blur-sm'

  let stateClass = ''

  if (result === 'correct') {
    stateClass = 'border-white/40 bg-white/20 text-white'
  } else if (result === 'wrong') {
    stateClass = 'border-red-400/40 bg-red-500/10 text-red-200'
  } else if (selected) {
    stateClass = 'border-white/60 bg-white/10 text-white'
  } else {
    stateClass = 'border-white/10 bg-black/20 text-white/60 hover:border-white/30 hover:bg-white/5 hover:text-white'
  }

  const disabledClass = disabled ? 'pointer-events-none' : ''

  const resultIcon =
    result === 'correct' ? '✓' :
    result === 'wrong'   ? '✗' :
    null

  return (
    <button
      className={`${baseClass} ${stateClass} ${disabledClass}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        touchAction: 'manipulation',
        minHeight: '56px',
        ...(result === 'correct'
          ? { boxShadow: '0 0 20px rgba(255,255,255,0.1)' }
          : result === 'wrong' && selected
          ? { boxShadow: '0 0 20px rgba(255,0,0,0.1)' }
          : selected
          ? { boxShadow: '0 0 20px rgba(255,255,255,0.1)' }
          : {}),
      }}
    >
      {/* Label badge */}
      <span
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-inter text-[10px] uppercase font-bold border transition-colors duration-300"
        style={
          result === 'correct'
            ? { borderColor: 'rgba(255,255,255,0.8)', color: '#ffffff', background: 'rgba(255,255,255,0.2)' }
            : result === 'wrong' && selected
            ? { borderColor: 'rgba(255,100,100,0.6)', color: '#ff8888', background: 'rgba(255,0,0,0.1)' }
            : selected
            ? { borderColor: 'rgba(255,255,255,0.8)', color: '#ffffff', background: 'rgba(255,255,255,0.1)' }
            : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'transparent' }
        }
      >
        {resultIcon ?? label}
      </span>

      {/* Option text */}
      <span className="flex-1">{text}</span>
    </button>
  )
}
