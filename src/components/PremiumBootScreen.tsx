'use client'

import { useEffect, useState } from 'react'

interface PremiumBootScreenProps {
  userName?: string
  isAdmin?: boolean
  onComplete?: () => void
  autoHide?: boolean
}

export function PremiumBootScreen({ userName, isAdmin, onComplete, autoHide = true }: PremiumBootScreenProps) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing...')
  const [phase, setPhase] = useState<'loading' | 'welcome' | 'fadeout'>('loading')
  const [logoScale, setLogoScale] = useState(0.3)
  const [logoOpacity, setLogoOpacity] = useState(0)
  const [showRings, setShowRings] = useState(false)
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [dotCount, setDotCount] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [typingDone, setTypingDone] = useState(false)

  const fullText = 'JUGNOO PHOTOS'

  const statusTexts = [
    { at: 0, text: 'Initializing Jugnoo Smart Portal...' },
    { at: 8, text: 'Loading core modules...' },
    { at: 18, text: 'Connecting to secure servers...' },
    { at: 28, text: 'Authenticating credentials...' },
    { at: 38, text: 'Syncing business data...' },
    { at: 48, text: 'Preparing dashboard...' },
    { at: 58, text: 'Loading service modules...' },
    { at: 68, text: 'Setting up communication...' },
    { at: 78, text: 'Configuring workspace...' },
    { at: 88, text: 'Almost ready...' },
    { at: 95, text: 'Welcome to Jugnoo!' },
  ]

  // Logo + ring animations
  useEffect(() => {
    const timer1 = setTimeout(() => setLogoOpacity(1), 150)
    const timer2 = setTimeout(() => setLogoScale(1), 300)
    const timer3 = setTimeout(() => setShowRings(true), 700)
    const timer4 = setTimeout(() => setGlowIntensity(1), 900)

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        const increment = prev < 30 ? 2.5 : prev < 60 ? 1.8 : prev < 90 ? 1.2 : 0.6
        return Math.min(prev + increment + Math.random() * 1.2, 100)
      })
    }, 70)

    return () => {
      clearInterval(interval)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  // Status text updates
  useEffect(() => {
    const current = statusTexts.reduce((acc, item) => progress >= item.at ? item : acc, statusTexts[0])
    setStatusText(current.text)
  }, [progress])

  // Dot animation
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4)
    }, 400)
    return () => clearInterval(dotInterval)
  }, [])

  // Typing effect for "JUGNOO PHOTOS" below logo
  useEffect(() => {
    if (logoOpacity >= 1 && !typingDone) {
      let charIndex = 0
      const typeInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          setTypedText(fullText.slice(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(typeInterval)
          setTypingDone(true)
        }
      }, 90)
      return () => clearInterval(typeInterval)
    }
  }, [logoOpacity])

  // Phase transitions
  useEffect(() => {
    if (progress >= 100 && phase === 'loading') {
      const timer = setTimeout(() => setPhase('welcome'), 600)
      return () => clearTimeout(timer)
    }
  }, [progress, phase])

  useEffect(() => {
    if (phase === 'welcome' && autoHide) {
      const timer = setTimeout(() => setPhase('fadeout'), 1800)
      return () => clearTimeout(timer)
    }
  }, [phase, autoHide])

  useEffect(() => {
    if (phase === 'fadeout' && onComplete) {
      const timer = setTimeout(() => onComplete(), 800)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700"
      style={{
        opacity: phase === 'fadeout' ? 0 : 1,
        background: 'linear-gradient(180deg, #E8F0FE 0%, #F5F7FA 50%, #FFF3D6 100%)',
      }}
    >
      {/* Subtle geometric pattern - navy dots */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(26,60,94,0.5) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Subtle top accent - navy gradient */}
      <div className="absolute top-0 left-0 right-0 h-40 opacity-[0.06]"
        style={{
          background: 'linear-gradient(180deg, rgba(26,60,94,0.15) 0%, transparent 100%)'
        }}
      />



      {/* Ambient glow behind logo - navy with gold */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full transition-all duration-[2000ms]"
        style={{
          background: `radial-gradient(circle, rgba(26,60,94,${0.06 * glowIntensity}) 0%, rgba(0,62,107,${0.02 * glowIntensity}) 40%, transparent 70%)`,
        }}
      />

      {/* Logo with 3D effect + Spring border */}
      <div
        className="relative transition-all duration-[1500ms] ease-out"
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        {/* Logo glow shadow - navy with gold accent */}
        <div
          className="absolute inset-0 rounded-2xl blur-2xl transition-opacity duration-[2000ms]"
          style={{
            opacity: glowIntensity * 0.3,
            background: 'linear-gradient(135deg, #1A3C5E, #003E6B, #F5A623)',
          }}
        />

        {/* Spring hanging from top */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[60px] flex flex-col items-center" style={{ animation: 'float 3s ease-in-out infinite' }}>
          {/* Hook / nail at the very top */}
          <div className="w-3 h-3 rounded-full bg-[#1A3C5E] shadow-sm" />
          {/* Spring coils */}
          <svg width="24" height="50" viewBox="0 0 24 50" className="overflow-visible">
            <path
              d="M12 0 C18 6, 6 10, 12 16 C18 22, 6 26, 12 32 C18 38, 6 42, 12 48"
              fill="none"
              stroke="#1A3C5E"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Second spring line for 3D depth */}
            <path
              d="M14 0 C20 6, 8 10, 14 16 C20 22, 8 26, 14 32 C20 38, 8 42, 14 48"
              fill="none"
              stroke="#F5A623"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Logo container with 3D perspective - SQUARE with spring border effect */}
        <div
          className="relative w-44 h-44 rounded-2xl overflow-hidden bg-white"
          style={{
            boxShadow: `0 0 50px rgba(26,60,94,${0.2 * glowIntensity}), 0 0 30px rgba(245,166,35,${0.12 * glowIntensity}), 0 20px 40px rgba(0,0,0,0.12)`,
            animation: 'float 3s ease-in-out infinite',
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, #1A3C5E, #F5A623, #1A3C5E) 1',
          }}
        >
          <img
            src="/jugnoo-photos-logo.jpg"
            alt="Jugnoo Photos"
            className="w-full h-full object-contain"
          />

        </div>
      </div>

      {/* JUGNOO PHOTOS typing effect text below logo */}
      <div
        className="mt-6 text-center transition-all duration-1000 min-h-[36px]"
        style={{ opacity: logoOpacity }}
      >
        <h1 className="text-3xl font-bold text-[#1A3C5E] tracking-tight flex items-center justify-center">
          {typedText}
          {!typingDone && (
            <span
              className="inline-block w-0.5 h-7 ml-0.5 bg-[#F5A623] align-middle"
              style={{ animation: 'blink 0.8s step-end infinite' }}
            />
          )}
        </h1>
        <p className="text-[#F5A623] text-xs font-medium tracking-[0.3em] mt-1.5 uppercase">
          Smart Portal
        </p>
      </div>

      {/* Welcome phase */}
      {phase === 'welcome' && (
        <div className="mt-6 text-center animate-[fadeInUp_600ms_ease-out]">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#1A3C5E]/10 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A3C5E] to-[#003E6B] flex items-center justify-center text-white font-bold text-sm">
              {userName ? userName.charAt(0).toUpperCase() : 'J'}
            </div>
            <div className="text-left">
              <p className="text-[#1A3C5E] text-sm font-medium">Assalam-o-Alaikum, {userName || 'User'}!</p>
              <p className="text-[#6B7280] text-[10px]">{isAdmin ? 'Admin Panel - Full Access' : 'Customer Portal'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress section */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-96 max-w-[85vw]">
        {/* Dots loader */}
        {phase === 'loading' && (
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#1A3C5E]"
                style={{
                  animation: 'dotPulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Progress bar - navy with gold accent */}
        <div className="relative h-[2px] bg-[#1A3C5E]/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #1A3C5E, #003E6B, #F5A623)',
              boxShadow: '0 0 10px rgba(245,166,35,0.3)',
            }}
          />
          {/* Shimmer effect */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'shimmer 2s infinite',
            }}
          />
          {/* Leading edge glow */}
          {progress > 0 && progress < 100 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#F5A623]/40 blur-sm"
              style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
            />
          )}
        </div>

        {/* Status text */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px] text-[#1A3C5E]/40 font-mono tracking-wide">
            {statusText}{'.'.repeat(dotCount)}
          </p>
          <p className="text-[11px] text-[#F5A623]/50 font-mono tabular-nums">{Math.round(progress)}%</p>
        </div>
      </div>

      {/* Bottom branding - navy with gold */}
      <div className="absolute bottom-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src="/jugnoo-photos-logo.jpg" alt="" className="w-5 h-5 rounded opacity-30" />
          <p className="text-[10px] text-[#1A3C5E]/25 tracking-wider font-medium">JUGNOO PHOTOSTATE &bull; CHOWK AZAM</p>
        </div>
        <p className="text-[9px] text-[#F5A623]/30">AI-Powered Business Management System v3.0</p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
