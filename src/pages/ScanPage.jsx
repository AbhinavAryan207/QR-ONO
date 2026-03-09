import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { supabase } from '../supabase/supabaseClient'

export default function ScanPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('auth') // auth | ready | scanning | processing | error
  const [errorMsg, setErrorMsg] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const didScan = useRef(false)

  // ── Auth check on mount ───────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate(`/login?redirect=${encodeURIComponent('/scan')}`, { replace: true })
      } else {
        setPhase('ready') // show "Open Camera" button
      }
    })
    return stopCamera
  }, [])

  // ── Stop camera & cancel scan loop ────────────────────────────────────────
  function stopCamera() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // ── Start camera — called by button tap (user gesture) ───────────────────
  const startCamera = useCallback(async () => {
    didScan.current = false

    if (!navigator.mediaDevices?.getUserMedia) {
      const isHttp = location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1'
      setErrorMsg(
        isHttp
          ? 'Camera access requires HTTPS. You are on an HTTP address (' + location.hostname + '). Open the app via localhost, or deploy to an HTTPS URL, then try again.'
          : 'Camera access is not available. Make sure you are using Chrome or Safari and the page is on HTTPS or localhost.'
      )
      setPhase('error')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })

      streamRef.current = stream
      setPhase('scanning') // flip to scanning only AFTER stream is obtained

      const video = videoRef.current
      video.srcObject = stream

      // Wait for metadata before playing to avoid silent failure
      await new Promise(resolve => {
        if (video.readyState >= 1) { resolve(); return }
        video.onloadedmetadata = resolve
      })

      try { await video.play() } catch (_) { /* muted+playsInline allows autoplay */ }

      scanLoop()
    } catch (err) {
      const name = (err?.name || '').toLowerCase()
      const msg = String(err).toLowerCase()
      if (name === 'notallowederror' || msg.includes('permission') || msg.includes('denied')) {
        setErrorMsg(
          'Camera access was denied. Tap the camera icon in your browser address bar to allow access, then try again.'
        )
      } else if (name === 'notfounderror' || msg.includes('devicenotfound') || msg.includes('no camera')) {
        setErrorMsg('No camera found on this device.')
      } else if (name === 'notreadableerror' || msg.includes('in use')) {
        setErrorMsg('Camera is in use by another app. Close it and try again.')
      } else {
        setErrorMsg('Could not open the camera. Make sure the app is served over HTTPS or localhost.')
      }
      setPhase('error')
    }
  }, [])

  // ── Frame-by-frame QR scan loop ───────────────────────────────────────────
  function scanLoop() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    function tick() {
      if (!streamRef.current || didScan.current) return

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        if (code?.data) {
          didScan.current = true
          stopCamera()
          handleResult(code.data)
          return
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  // ── Handle decoded QR text ─────────────────────────────────────────────────
  function handleResult(text) {
    setPhase('processing')

    // Case 1: full URL with ?token=
    try {
      const url = new URL(text)
      const token = url.searchParams.get('token')
      if (token) {
        navigate(`/play?token=${encodeURIComponent(token)}`)
        return
      }
    } catch {
      // not a URL
    }

    // Case 2: bare token string
    if (text.startsWith('qrono-')) {
      navigate(`/play?token=${encodeURIComponent(text)}`)
      return
    }

    setErrorMsg(`QR code not recognized as a Onerios-Quests code.\n\nScanned text:\n"${text}"`)
    setPhase('error')
  }

  function retry() {
    stopCamera()
    didScan.current = false
    setPhase('ready')
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-neon/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-neon animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-4 pb-8 scanline-bg">
      {/* Ambient glow */}
      <div
        className="fixed top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #4dd8e6, transparent 70%)', filter: 'blur(50px)' }}
      />

      {/* Header */}
      <div className="text-center mb-6 w-full max-w-sm">
        <span className="font-orbitron text-xs tracking-[0.3em] text-white/30 uppercase block mb-1">Onerios-Quests</span>
        <h1 className="font-cinzel text-2xl text-white">Scan QR Code</h1>
        <p className="font-manrope text-sm text-white/40 mt-1">Point your camera at an event QR code</p>
      </div>

      {/* Camera viewport — always in DOM so refs work */}
      <div className="relative w-full max-w-sm">
        <div
          className="glass-card-cyan rounded-2xl overflow-hidden bg-black"
          style={{ aspectRatio: '1 / 1', position: 'relative' }}
        >
          {/* Native video element — always in DOM, overlays cover it when not scanning */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Hidden canvas for jsQR frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* "Ready" state — tap to open camera */}
          {phase === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
              <div
                className="w-16 h-16 rounded-2xl border-2 border-cyan-neon/60 flex items-center justify-center"
                style={{ boxShadow: '0 0 20px rgba(77,216,230,0.3)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4dd8e6" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <p className="font-manrope text-sm text-white/60 text-center px-4">
                Tap the button below to open your camera
              </p>
            </div>
          )}

          {/* Scanning overlay */}
          {phase === 'scanning' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-52 h-52">
                <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-neon rounded-tl-lg" />
                <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-neon rounded-tr-lg" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-neon rounded-bl-lg" />
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-neon rounded-br-lg" />
                <div
                  className="absolute left-2 right-2 h-0.5 bg-cyan-neon animate-scan-laser"
                  style={{ boxShadow: '0 0 8px #4dd8e6, 0 0 16px #4dd8e6' }}
                />
              </div>
            </div>
          )}

          {/* Processing overlay */}
          {phase === 'processing' && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-neon/20" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-cyan-neon animate-spin" />
                </div>
                <p className="font-orbitron text-xs text-cyan-neon tracking-widest">PROCESSING</p>
              </div>
            </div>
          )}
        </div>

        {phase === 'scanning' && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-orbitron text-xs text-white/50 tracking-widest uppercase">Camera active — hold steady</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-5 w-full max-w-sm flex flex-col gap-3">
        {phase === 'ready' && (
          <button
            className="btn-solid-cyan w-full"
            style={{ minHeight: '56px', fontSize: '16px' }}
            onClick={startCamera}
          >
            📷&nbsp; Open Camera
          </button>
        )}

        {phase === 'scanning' && (
          <button className="btn-neon-pink w-full" onClick={() => { stopCamera(); navigate('/') }}>
            Cancel
          </button>
        )}

        {phase === 'error' && (
          <>
            <div
              className="glass-card border-pink-neon/30 p-5 text-center rounded-2xl"
              style={{ boxShadow: '0 0 20px rgba(232,67,147,0.1)' }}
            >
              <span className="font-orbitron text-3xl text-pink-neon block mb-3" style={{ textShadow: '0 0 15px rgba(232,67,147,0.8)' }}>⚠</span>
              <p className="font-manrope text-sm text-white/70 leading-relaxed whitespace-pre-wrap break-all">{errorMsg}</p>
            </div>
            <button className="btn-neon-cyan w-full" onClick={retry}>Try Again</button>
            <button className="btn-neon-pink w-full" onClick={() => navigate('/')}>Back to Home</button>
          </>
        )}
      </div>
    </div>
  )
}
