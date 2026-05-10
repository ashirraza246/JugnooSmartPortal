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

  useEffect(() => {
    const current = statusTexts.reduce((acc, item) => progress >= item.at ? item : acc, statusTexts[0])
    setStatusText(current.text)
  }, [progress])

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4)
    }, 400)
    return () => clearInterval(dotInterval)
  }, [])

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
        background: 'linear-gradient(180deg, #E8F4FD 0%, #F0E6F6 50%, #E8F0FE 100%)',
      }}
    >
      {/* Subtle geometric pattern - blue dots */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,51,102,0.5) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Subtle top accent - blue gradient */}
      <div className="absolute top-0 left-0 right-0 h-40 opacity-[0.06]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,51,102,0.15) 0%, transparent 100%)'
        }}
      />

      {/* Animated rings - blue */}
      {showRings && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-blue-900/8" style={{ animation: 'spinRing 8s linear infinite' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-blue-900/[0.04]" style={{ animation: 'spinRing 14s linear infinite reverse' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full border border-blue-900/[0.02]" style={{ animation: 'spinRing 22s linear infinite' }} />
        </>
      )}

      {/* Ambient glow behind logo - blue */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full transition-all duration-[2000ms]"
        style={{
          background: `radial-gradient(circle, rgba(0,51,102,${0.06 * glowIntensity}) 0%, rgba(26,82,118,${0.02 * glowIntensity}) 40%, transparent 70%)`,
        }}
      />

      {/* Logo with 3D effect */}
      <div
        className="relative transition-all duration-[1500ms] ease-out"
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        {/* Logo glow shadow - blue */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl transition-opacity duration-[2000ms]"
          style={{
            opacity: glowIntensity * 0.3,
            background: 'linear-gradient(135deg, #003366, #1a5276, #2980b9)',
          }}
        />

        {/* Logo container with 3D perspective */}
        <div
          className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-blue-900/10"
          style={{
            boxShadow: `0 0 40px rgba(0,51,102,${0.15 * glowIntensity}), 0 20px 40px rgba(0,0,0,0.1)`,
            animation: 'logo3d 4s ease-in-out infinite, float 3s ease-in-out infinite',
            transform: 'perspective(1000px)',
          }}
        >
          <img
            src="/jugnoo-logo.png"
            alt="Jugnoo"
            className="w-full h-full object-cover"
          />
          {/* Reflective overlay sweep */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-3xl"
            style={{
              animation: 'shineSweep 3s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Brand text - BLUE on white */}
      <div
        className="mt-8 text-center transition-all duration-1000"
        style={{ opacity: logoOpacity }}
      >
        <h1 className="text-4xl font-bold text-[#003366] tracking-tight">
          JUGNOO
        </h1>
        <p className="text-[#1a5276]/60 text-xs font-medium tracking-[0.3em] mt-1.5 uppercase">
          Smart Portal
        </p>
      </div>

      {/* Welcome phase */}
      {phase === 'welcome' && (
        <div className="mt-6 text-center animate-[fadeInUp_600ms_ease-out]">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#003366] to-[#2980b9] flex items-center justify-center text-white font-bold text-sm">
              {userName ? userName.charAt(0).toUpperCase() : 'J'}
            </div>
            <div className="text-left">
              <p className="text-[#003366] text-sm font-medium">Assalam-o-Alaikum, {userName || 'User'}!</p>
              <p className="text-[#1a5276]/50 text-[10px]">{isAdmin ? 'Admin Panel - Full Access' : 'Customer Portal'}</p>
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
                className="w-1.5 h-1.5 rounded-full bg-[#003366]"
                style={{
                  animation: 'dotPulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Progress bar - blue on white */}
        <div className="relative h-[2px] bg-[#003366]/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #003366, #1a5276, #2980b9)',
              boxShadow: '0 0 10px rgba(0,51,102,0.3)',
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
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#2980b9]/40 blur-sm"
              style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
            />
          )}
        </div>

        {/* Status text - blue on white */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px] text-[#003366]/40 font-mono tracking-wide">
            {statusText}{'.'.repeat(dotCount)}
          </p>
          <p className="text-[11px] text-[#003366]/30 font-mono tabular-nums">{Math.round(progress)}%</p>
        </div>
      </div>

      {/* Bottom branding - blue */}
      <div className="absolute bottom-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src="/jugnoo-logo.png" alt="" className="w-4 h-4 opacity-30" />
          <p className="text-[10px] text-[#003366]/25 tracking-wider font-medium">JUGNOO PHOTOSTATE &bull; CHOWK AZAM</p>
        </div>
        <p className="text-[9px] text-[#003366]/15">AI-Powered Business Management System v3.0</p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes logo3d {
          0%, 100% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg); }
          25% { transform: perspective(1000px) rotateX(2deg) rotateY(4deg); }
          50% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg); }
          75% { transform: perspective(1000px) rotateX(-1deg) rotateY(-3deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes spinRing {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes shineSweep {
          0%, 100% { opacity: 0.5; transform: translateX(-50%); }
          50% { opacity: 0.8; transform: translateX(50%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
