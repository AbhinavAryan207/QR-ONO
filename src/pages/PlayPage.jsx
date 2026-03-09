import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { updateScore } from '../utils/scoreUtils'
import QuestionCard from '../components/QuestionCard'
import AnswerButton from '../components/AnswerButton'

const POINTS_CORRECT = 10
const POINTS_WRONG = -5
const OPTION_LABELS = ['A', 'B', 'C', 'D']

// ─── Hardcoded question bank ──────────────────────────────────────────────────
// Each question is shown based on a deterministic hash of the QR token,
// so the same token always yields the same question.
const QUESTIONS = [
  { question: "What do most people check immediately after waking up?", options: ["Phone notifications", "Weather", "Homework", "TV"], correct: 0 },
  { question: "What usually drains your phone battery the fastest?", options: ["Instagram/Reels", "Calculator", "Notes app", "Clock"], correct: 0 },
  { question: "What is the most common excuse for being late?", options: ["Traffic", "Overslept", "Phone died", "Forgot"], correct: 1 },
  { question: "What do most people do when WiFi stops working?", options: ["Restart router", "Blame the provider", "Turn WiFi off/on", "All of these"], correct: 3 },
  { question: "What is the most used app by students daily?", options: ["Instagram", "WhatsApp", "YouTube", "All of these"], correct: 3 },
  { question: "What do people usually say when they drop their phone?", options: ["Oh no!", "It's fine", "Please don't break", "All of these"], correct: 3 },
  { question: "What is the hardest thing to wake up for?", options: ["Morning class", "Gym", "Meeting", "Alarm"], correct: 0 },
  { question: "What do people usually do while watching Netflix?", options: ["Scroll phone", "Eat snacks", "Pause a lot", "All of these"], correct: 3 },
  { question: "What do students fear the most?", options: ["Surprise test", "Assignment deadline", "Attendance shortage", "All of these"], correct: 3 },
  { question: "What do people usually forget to bring?", options: ["Phone charger", "Wallet", "Keys", "All of these"], correct: 3 },
  { question: "What do people usually do when bored in class?", options: ["Scroll phone", "Talk to friends", "Zone out", "All of these"], correct: 3 },
  { question: "What do most people do first when they reach home?", options: ["Lie down", "Eat something", "Check phone", "All of these"], correct: 3 },
  { question: "What happens when someone says 'one last episode'?", options: ["Sleep", "Watch 5 more", "Stop immediately", "Turn TV off"], correct: 1 },
  { question: "What do people do when their phone storage is full?", options: ["Delete photos", "Delete apps", "Ignore it", "Complain"], correct: 0 },
  { question: "What is the most common midnight snack?", options: ["Maggi", "Chips", "Cookies", "All of these"], correct: 3 },
  { question: "What do most people do while waiting for food?", options: ["Use phone", "Talk", "Stare at food", "All of these"], correct: 0 },
  { question: "What is the most used feature on a phone?", options: ["Camera", "Internet", "Messages", "Flashlight"], correct: 1 },
  { question: "What happens when someone says 'I'll sleep early today'?", options: ["They sleep early", "They scroll till 3AM", "They study", "They exercise"], correct: 1 },
  { question: "What do most people do when their alarm rings?", options: ["Wake up", "Snooze", "Turn it off", "Throw phone"], correct: 1 },
  { question: "What do people usually do in a long lecture?", options: ["Take notes", "Use phone", "Sleep", "All of these"], correct: 3 },
  { question: "What is the most common group chat name?", options: ["Boys", "Squad", "No one studies", "Random"], correct: 1 },
  { question: "What do people check most on their phone?", options: ["Notifications", "Battery", "Time", "Weather"], correct: 0 },
  { question: "What happens when someone says 'I'll start studying tomorrow'?", options: ["They study", "They delay again", "They sleep", "They give up"], correct: 1 },
  { question: "What is the most common reason for low battery?", options: ["Instagram", "YouTube", "Games", "All of these"], correct: 3 },
  { question: "What do people usually do when food arrives?", options: ["Take photo", "Start eating", "Share", "Check smell"], correct: 0 },
  { question: "What happens when WiFi is slow?", options: ["Frustration", "Refresh page", "Complain", "All of these"], correct: 3 },
  { question: "What is the most common reaction to exam results?", options: ["Check marks", "Check friends' marks", "Panic", "All of these"], correct: 3 },
  { question: "What do most people do during a boring meeting?", options: ["Look busy", "Check phone", "Daydream", "All of these"], correct: 3 },
  { question: "What is the most common laptop problem?", options: ["Low battery", "Slow speed", "Too many tabs", "All of these"], correct: 3 },
  { question: "What happens when someone says 'free food'?", options: ["People appear instantly", "People ignore it", "No one comes", "Food disappears"], correct: 0 },
  { question: "What do people usually do while charging phone?", options: ["Use it", "Leave it", "Forget it", "All of these"], correct: 0 },
  { question: "What is the most common phrase during exams?", options: ["Did you study?", "What's coming?", "I'm dead", "All of these"], correct: 3 },
  { question: "What happens when phone falls on the floor?", options: ["Panic", "Check screen", "Say something loudly", "All of these"], correct: 3 },
  { question: "What do people do when bored online?", options: ["Scroll reels", "Watch YouTube", "Check memes", "All of these"], correct: 3 },
  { question: "What is the most common thing people lose?", options: ["Charger", "Earphones", "Keys", "All of these"], correct: 3 },
  { question: "What happens when someone says 'last game'?", options: ["They stop", "They play 5 more", "They sleep", "They quit"], correct: 1 },
  { question: "What is the most common student diet?", options: ["Maggi", "Pizza", "Chips", "All of these"], correct: 3 },
  { question: "What happens when group project starts?", options: ["One person works", "Everyone works", "No one works", "Confusion"], correct: 0 },
  { question: "What is the most common phrase in coding?", options: ["Why isn't this working?", "It worked yesterday", "Just one bug", "All of these"], correct: 3 },
  { question: "What happens when laptop freezes?", options: ["Panic", "Restart", "Hit keyboard", "All of these"], correct: 3 },
  { question: "What do people usually do before sleeping?", options: ["Scroll phone", "Watch video", "Set alarm", "All of these"], correct: 3 },
  { question: "What is the most common phone notification?", options: ["Instagram", "WhatsApp", "YouTube", "All of these"], correct: 3 },
  { question: "What happens when someone says 'just 5 minutes'?", options: ["5 minutes", "30 minutes", "1 hour", "Never happens"], correct: 1 },
  { question: "What do people do when internet works again?", options: ["Celebrate", "Reload everything", "Download stuff", "All of these"], correct: 3 },
  { question: "What is the most common thing people Google?", options: ["How to fix something", "Movie info", "Random questions", "All of these"], correct: 3 },
  { question: "What happens when someone says 'I'll start gym tomorrow'?", options: ["They go", "They delay", "They forget", "Never happens"], correct: 1 },
  { question: "What is the most common late night activity?", options: ["Watching reels", "Gaming", "Chatting", "All of these"], correct: 3 },
  { question: "What happens when someone sends a meme?", options: ["Ignore", "Laugh", "Send another meme", "All of these"], correct: 3 },
  { question: "What is the most common phrase before exams?", options: ["I'm not ready", "It's easy", "I studied everything", "I'm doomed"], correct: 0 },
  { question: "What happens when food delivery says 'arriving soon'?", options: ["Wait at door", "Track order", "Refresh app", "All of these"], correct: 3 },
]

// Deterministic hash: same token → same question index every time
function tokenToQuestionIndex(token) {
  let hash = 5381
  for (let i = 0; i < token.length; i++) {
    hash = Math.imul(hash, 33) ^ token.charCodeAt(i)
  }
  return Math.abs(hash) % QUESTIONS.length
}

export default function PlayPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [phase, setPhase] = useState('loading') // loading | auth | already-scanned | question | result | error
  const [user, setUser] = useState(null)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)   // 0 | 1 | 2 | 3
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [scoreChange, setScoreChange] = useState(null)
  const [newScore, setNewScore] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing QR token.')
      setPhase('error')
      return
    }
    initPlay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function initPlay() {
    // 1. Check auth
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setPhase('auth')
      return
    }
    const currentUser = session.user
    setUser(currentUser)

    // 2. Check if this token was already scanned by this user
    const { data: existingScan, error: scanCheckError } = await supabase
      .from('scans')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('qr_token', token)
      .maybeSingle()

    if (scanCheckError) {
      setMessage(`Error checking scan history: ${scanCheckError.message} (code: ${scanCheckError.code})`)
      setPhase('error')
      return
    }

    if (existingScan) {
      setPhase('already-scanned')
      return
    }

    // 3. Pick question deterministically from hardcoded bank
    //    Same token always shows the same question — fair across all players
    setQuestion(QUESTIONS[tokenToQuestionIndex(token)])
    setPhase('question')
  }

  async function handleSubmit() {
    if (selected === null || submitted) return
    setSubmitted(true)

    const correct = selected === question.correct
    setIsCorrect(correct)
    const delta = correct ? POINTS_CORRECT : POINTS_WRONG
    setScoreChange(delta)

    // 4. Record the scan — prevents rescanning this token
    await supabase.from('scans').insert({
      user_id: user.id,
      qr_token: token,
      is_correct: correct,
    })

    // 5. Update cumulative score
    const updatedScore = await updateScore(user.id, delta)
    setNewScore(updatedScore)
    setPhase('result')
  }

  // ── Render phases ─────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return <LoadingScreen text="Scanning QR..." />
  }

  if (phase === 'auth') {
    return (
      <CenteredCard>
        <div className="text-center">
          <span className="font-space text-5xl text-white/50 block mb-6">◈</span>
          <h2 className="font-inter font-light tracking-[0.2em] uppercase text-xl text-white mb-4">Authentication Required</h2>
          <p className="font-inter font-light text-white/50 text-sm mb-8 leading-relaxed">
            You need to be logged in to scan QR codes and earn points.
          </p>
          <div className="flex flex-col gap-4">
            <button
              className="w-full bg-white text-black font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.href)}`)}
            >
              LOGIN
            </button>
            <button
              className="w-full glass-card-celestial text-white font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => navigate(`/register?redirect=${encodeURIComponent(window.location.href)}`)}
            >
              REGISTER
            </button>
          </div>
        </div>
      </CenteredCard>
    )
  }

  if (phase === 'already-scanned') {
    return (
      <CenteredCard>
        <div className="text-center">
          <span
            className="font-space text-5xl text-white/50 block mb-6"
          >⊗</span>
          <h2 className="font-inter font-light tracking-[0.2em] uppercase text-xl text-white mb-4">Already Scanned</h2>
          <p className="font-inter font-light text-white/50 text-sm mb-8 leading-relaxed">
            You already scanned this QR code. Each code can only be used once per hunter.
          </p>
          <div className="flex flex-col gap-4">
            <button className="w-full bg-white text-black font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]" onClick={() => navigate('/leaderboard')}>
              VIEW LEADERBOARD
            </button>
            <button className="w-full glass-card-celestial text-white font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/10 transition-colors" onClick={() => navigate('/')}>
              RETURN HOME
            </button>
          </div>
        </div>
      </CenteredCard>
    )
  }

  if (phase === 'error') {
    return (
      <CenteredCard>
        <div className="text-center">
          <span className="font-space text-5xl text-red-500/50 block mb-6">⚠</span>
          <h2 className="font-inter font-light tracking-[0.2em] uppercase text-xl text-white mb-4">Error</h2>
          <p className="font-inter font-light text-white/50 text-sm mb-8 leading-relaxed">{message}</p>
          <button className="w-full bg-white text-black font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]" onClick={() => navigate('/')}>
            RETURN HOME
          </button>
        </div>
      </CenteredCard>
    )
  }

  if (phase === 'result') {
    return (
      <div className="min-h-screen px-4 pt-4 pb-10 scanline-bg">
        <div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: isCorrect
              ? 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)'
              : 'radial-gradient(circle, rgba(255,100,100,0.1), transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="relative w-full max-w-md mx-auto animate-slide-up mt-8">
          <div
            className={`glass-card-celestial relative p-8 text-center ${isCorrect ? 'border-white/20' : 'border-red-500/30'}`}
          >
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Result icon */}
            <div
              className={`text-6xl mb-6 font-space ${isCorrect ? 'text-white' : 'text-red-400'}`}
              style={isCorrect ? { textShadow: '0 0 30px rgba(255,255,255,0.5)' } : { textShadow: '0 0 30px rgba(255,0,0,0.4)' }}
            >
              {isCorrect ? '✓' : '✗'}
            </div>

            <h2 className="font-inter font-light tracking-[0.2em] uppercase text-2xl text-white mb-2">
              {isCorrect ? 'Verified' : 'Incorrect'}
            </h2>

            {/* Score delta */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span
                className={`font-space text-4xl font-light ${isCorrect ? 'text-white' : 'text-red-400'}`}
              >
                {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
              </span>
              <span className="font-inter font-light text-[10px] tracking-[0.3em] uppercase text-white/40">points</span>
            </div>

            {/* Reveal correct answer when wrong */}
            {!isCorrect && question && (
              <div className="mb-8 px-4 py-4 rounded-xl border border-white/10 bg-white/5 text-left">
                <p className="font-inter font-light text-[10px] text-white/40 mb-2 uppercase tracking-[0.2em]">Correct Alignment</p>
                <p className="font-inter font-light text-sm text-white/80">
                  {OPTION_LABELS[question.correct]}. {question.options[question.correct]}
                </p>
              </div>
            )}

            {/* Total score */}
            {newScore !== null && (
              <div className="mb-8 px-4 py-4 rounded-xl border border-white/20 bg-white/10">
                <p className="font-inter font-light text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">New Rating</p>
                <p className="font-space font-light text-3xl text-white">
                  {newScore} <span className="text-sm">pts</span>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button className="w-full bg-white text-black font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]" onClick={() => navigate('/leaderboard')}>
                VIEW LEADERBOARD
              </button>
              <button className="w-full glass-card-celestial text-white font-inter text-sm tracking-[0.2em] font-medium py-4 rounded-xl hover:bg-white/10 transition-colors" onClick={() => navigate('/')}>
                RETURN HOME
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // phase === 'question'
  return (
    <div className="min-h-screen px-4 pt-4 pb-10 scanline-bg">
      <div
        className="fixed top-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #4dd8e6, transparent 70%)', filter: 'blur(50px)' }}
      />
      <div className="w-full max-w-lg mx-auto">
        {/* Token status badges */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="glass-card-celestial px-4 py-2 inline-flex items-center gap-3 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <span className="font-inter font-light text-[9px] tracking-[0.2em] text-white/60 uppercase">Node Linked</span>
          </div>
          <div className="glass-card-celestial px-4 py-2 inline-flex items-center gap-2 rounded-full border border-white/5 opacity-50">
            <span className="font-inter font-light text-[9px] tracking-[0.2em] text-white/40 truncate max-w-[100px] uppercase">
              {token?.substring(0, 8)}…
            </span>
          </div>
        </div>

        {question && (
          <QuestionCard question={question.question}>
            {question.options.map((optionText, idx) => {
              let result = null
              if (submitted) {
                if (idx === question.correct) result = 'correct'
                else if (idx === selected) result = 'wrong'
              }
              return (
                <AnswerButton
                  key={idx}
                  label={OPTION_LABELS[idx]}
                  text={optionText}
                  selected={selected === idx}
                  result={result}
                  disabled={submitted}
                  onClick={() => !submitted && setSelected(idx)}
                />
              )
            })}

            <div className="mt-6">
              <button
                className="btn-solid-cyan w-full"
                style={{ minHeight: '56px', fontSize: '15px', letterSpacing: '0.12em' }}
                disabled={selected === null || submitted}
                onClick={handleSubmit}
              >
                {submitted ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </QuestionCard>
        )}
      </div>
    </div>
  )
}

function LoadingScreen({ text }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div
            className="absolute inset-0 rounded-full border-t border-white/80 animate-spin"
            style={{ animationDuration: '1s' }}
          />
        </div>
        <p className="font-inter font-light text-[10px] text-white tracking-[0.4em] uppercase">{text}</p>
      </div>
    </div>
  )
}

function CenteredCard({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 scanline-bg">
      <div className="glass-card-celestial relative p-8 max-w-md w-full animate-slide-up">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {children}
        <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  )
}
