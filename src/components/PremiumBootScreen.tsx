'use client'

import { useEffect, useState, useCallback } from 'react'

interface PremiumBootScreenProps {
  userName?: string
  isAdmin?: boolean
  onComplete?: () => void
  autoHide?: boolean
}

export function PremiumBootScreen({ userName, isAdmin, onComplete, autoHide = true }: PremiumBootScreenProps) {
  const [phase, setPhase] = useState<'circle-dotted' | 'circle-full' | 'typing' | 'welcome' | 'fadeout'>('circle-dotted')
  const [circleProgress, setCircleProgress] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [wingAngle, setWingAngle] = useState(0)
  const [logoVisible, setLogoVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dotCount, setDotCount] = useState(0)

  const fullText = 'JUGNOO PHOTOS'

  // Circle animation - dotted then full
  useEffect(() => {
    if (phase === 'circle-dotted') {
      const interval = setInterval(() => {
        setCircleProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setPhase('circle-full'), 400)
            return 100
          }
          return prev + 1.5
        })
      }, 30)
      return () => clearInterval(interval)
    }
  }, [phase])

  // Full circle phase - then transition to typing
  useEffect(() => {
    if (phase === 'circle-full') {
      setLogoVisible(true)
      const timer = setTimeout(() => setPhase('typing'), 1200)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Typing effect
  useEffect(() => {
    if (phase === 'typing') {
      let charIndex = 0
      const interval = setInterval(() => {
        if (charIndex < fullText.length) {
          setTypedText(fullText.slice(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(interval)
          setTimeout(() => setPhase('welcome'), 800)
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [phase])

  // Wing flapping animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWingAngle(prev => (prev + 8) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        const increment = prev < 30 ? 1.8 : prev < 60 ? 1.2 : prev < 90 ? 0.8 : 0.4
        return Math.min(prev + increment + Math.random() * 0.8, 100)
      })
    }, 80)
    return () => clearInterval(interval)
  }, [])

  // Dot animation
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4)
    }, 400)
    return () => clearInterval(dotInterval)
  }, [])

  // Welcome -> fadeout
  useEffect(() => {
    if (phase === 'welcome' && autoHide) {
      const timer = setTimeout(() => setPhase('fadeout'), 2000)
      return () => clearTimeout(timer)
    }
  }, [phase, autoHide])

  // Fadeout -> complete
  useEffect(() => {
    if (phase === 'fadeout' && onComplete) {
      const timer = setTimeout(() => onComplete(), 700)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  // Circle path calculation
  const circleRadius = 68
  const circleCircumference = 2 * Math.PI * circleRadius
  const dashOffset = circleCircumference - (circleProgress / 100) * circleCircumference

  // Wing flap transform
  const wingFlap = Math.sin(wingAngle * Math.PI / 180) * 25

  const statusText = phase === 'circle-dotted' || phase === 'circle-full'
    ? 'Jugnoo Smart Portal load ho raha hai...'
    : phase === 'typing'
    ? 'Welcome...'
    : phase === 'welcome'
    ? `Assalam-o-Alaikum, ${userName || 'User'}!`
    : 'Ready!'

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700"
      style={{
        opacity: phase === 'fadeout' ? 0 : 1,
        background: 'linear-gradient(180deg, #0a1628 0%, #0F2A42 30%, #1A3C5E 60%, #0F2A42 100%)',
      }}
    >
      {/* Particle stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              backgroundColor: i % 3 === 0 ? '#F5A623' : 'rgba(255,255,255,0.3)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Main content area */}
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        {/* Dotted / Full circle loading */}
        <svg
          className="absolute inset-0"
          width="220"
          height="220"
          viewBox="0 0 220 220"
          style={{
            animation: phase === 'circle-dotted' || phase === 'circle-full' ? 'spinCircle 3s linear infinite' : 'spinCircle 8s linear infinite',
          }}
        >
          {/* Background circle (very subtle) */}
          <circle
            cx="110"
            cy="110"
            r={circleRadius}
            fill="none"
            stroke="rgba(245,166,35,0.08)"
            strokeWidth="2"
          />

          {/* Animated progress circle */}
          <circle
            cx="110"
            cy="110"
            r={circleRadius}
            fill="none"
            stroke={phase === 'circle-dotted' ? '#F5A623' : 'url(#circleGradient)'}
            strokeWidth={phase === 'circle-dotted' ? '2' : '3'}
            strokeDasharray={phase === 'circle-dotted'
              ? `${circleCircumference * 0.03} ${circleCircumference * 0.03}`
              : circleCircumference
            }
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            style={{
              transition: 'stroke-dashoffset 0.1s ease-out, stroke-width 0.5s ease, stroke 0.5s ease',
              filter: 'drop-shadow(0 0 6px rgba(245,166,35,0.4))',
            }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5A623" />
              <stop offset="50%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#F5A623" />
            </linearGradient>
          </defs>
        </svg>

        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)`,
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}
        />

        {/* Logo with wings */}
        <div
          className="relative"
          style={{
            opacity: logoVisible ? 1 : 0.4,
            transform: logoVisible ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Left Wing */}
          <div
            className="absolute"
            style={{
              top: '50%',
              right: '100%',
              transform: `translateY(-50%) rotate(${wingFlap - 20}deg)`,
              transformOrigin: 'right center',
              marginRight: '-4px',
              transition: 'transform 0.08s ease-out',
            }}
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              <path
                d="M38 15 C30 5, 15 2, 2 8 C8 12, 18 18, 30 20 C34 21, 37 18, 38 15Z"
                fill="url(#wingGradL)"
                opacity="0.85"
              />
              <defs>
                <linearGradient id="wingGradL" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(245,166,35,0.2)" />
                  <stop offset="100%" stopColor="#F5A623" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right Wing */}
          <div
            className="absolute"
            style={{
              top: '50%',
              left: '100%',
              transform: `translateY(-50%) rotate(${-wingFlap + 20}deg)`,
              transformOrigin: 'left center',
              marginLeft: '-4px',
              transition: 'transform 0.08s ease-out',
            }}
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              <path
                d="M2 15 C10 5, 25 2, 38 8 C32 12, 22 18, 10 20 C6 21, 3 18, 2 15Z"
                fill="url(#wingGradR)"
                opacity="0.85"
              />
              <defs>
                <linearGradient id="wingGradR" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F5A623" />
                  <stop offset="100%" stopColor="rgba(245,166,35,0.2)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Logo Image */}
          <div
            className="w-24 h-24 rounded-full overflow-hidden"
            style={{
              boxShadow: '0 0 30px rgba(245,166,35,0.3), 0 0 60px rgba(26,60,94,0.3), 0 8px 32px rgba(0,0,0,0.4)',
              animation: logoVisible ? 'floatLogo 3s ease-in-out infinite' : 'none',
            }}
          >
            <img
              src="/jugnoo-photos-logo.jpg"
              alt="Jugnoo Photos"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Reflective sweep on logo */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              animation: 'shineSweep 3s ease-in-out infinite',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Typed text - JUGNOO PHOTOS */}
      <div className="mt-6 h-10 flex items-center justify-center overflow-hidden">
        {phase === 'typing' || phase === 'welcome' || phase === 'fadeout' ? (
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #F5A623, #FFB300, #FFF3D6, #FFB300, #F5A623)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmerText 3s ease-in-out infinite',
            }}
          >
            {typedText}
            {phase === 'typing' && (
              <span
                className="inline-block w-0.5 h-6 ml-1 align-middle"
                style={{
                  backgroundColor: '#F5A623',
                  animation: 'blink 0.8s step-end infinite',
                }}
              />
            )}
          </h1>
        ) : (
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#F5A623]/30 tracking-wider"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          >
            JUGNOO
          </h1>
        )}
      </div>

      {/* Subtitle */}
      <p
        className="text-[#F5A623]/50 text-xs font-medium tracking-[0.3em] mt-1 uppercase"
        style={{
          opacity: phase === 'typing' || phase === 'welcome' ? 1 : 0.3,
          transition: 'opacity 0.5s ease',
        }}
      >
        Smart Portal
      </p>

      {/* Welcome phase user greeting */}
      {phase === 'welcome' && (
        <div className="mt-6 animate-[fadeInUp_600ms_ease-out]">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F5A623] to-[#FFB300] flex items-center justify-center text-[#1A3C5E] font-bold text-sm">
              {userName ? userName.charAt(0).toUpperCase() : 'J'}
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Assalam-o-Alaikum, {userName || 'User'}!</p>
              <p className="text-[#F5A623]/70 text-[10px]">{isAdmin ? 'Admin Panel - Full Access' : 'Customer Portal'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar at bottom */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 max-w-[80vw]">
        {/* Dots loader */}
        {(phase === 'circle-dotted' || phase === 'circle-full' || phase === 'typing') && (
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#F5A623]"
                style={{
                  animation: 'dotPulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="relative h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #1A3C5E, #F5A623, #FFB300)',
              boxShadow: '0 0 10px rgba(245,166,35,0.3)',
            }}
          />
        </div>

        {/* Status text */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] text-white/30 font-mono tracking-wide">
            {statusText}{'.'.repeat(dotCount)}
          </p>
          <p className="text-[10px] text-[#F5A623]/40 font-mono tabular-nums">{Math.round(progress)}%</p>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src="/jugnoo-photos-logo.jpg" alt="" className="w-4 h-4 rounded-full opacity-30" />
          <p className="text-[10px] text-white/20 tracking-wider font-medium">JUGNOO PHOTOSTATE &bull; CHOWK AZAM</p>
        </div>
        <p className="text-[9px] text-[#F5A623]/20">AI-Powered Business Management System v3.0</p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spinCircle {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shineSweep {
          0%, 100% { opacity: 0.3; transform: translateX(-50%); }
          50% { opacity: 0.7; transform: translateX(50%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes shimmerText {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
