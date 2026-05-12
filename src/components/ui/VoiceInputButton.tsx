'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoiceInput, type UseVoiceInputOptions } from '@/hooks/use-voice-input'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceInputButtonProps {
  /** Callback when a final transcript is produced */
  onTranscript?: (transcript: string) => void
  /** Callback for interim (in-progress) transcripts */
  onInterimTranscript?: (transcript: string) => void
  /** Language for voice recognition */
  language?: string
  /** Called when language is changed internally */
  onLanguageChange?: (lang: string) => void
  /** Size variant */
  size?: 'sm' | 'md'
  /** Additional CSS classes */
  className?: string
  /** Whether the button is disabled */
  disabled?: boolean
  /** Pass through additional options to useVoiceInput */
  voiceOptions?: Omit<UseVoiceInputOptions, 'language' | 'onResult' | 'onError'>
  /** Callback for errors */
  onError?: (error: string) => void
  /** Callback when listening state changes */
  onListeningChange?: (isListening: boolean) => void
  /** Callback to report whether voice is supported */
  onSupportedChange?: (isSupported: boolean) => void
}

export function VoiceInputButton({
  onTranscript,
  onInterimTranscript,
  language = 'en-PK',
  onLanguageChange,
  size = 'md',
  className,
  disabled = false,
  voiceOptions,
  onError,
  onListeningChange,
  onSupportedChange,
}: VoiceInputButtonProps) {
  const handleResult = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (isFinal) {
        onTranscript?.(transcript)
      } else {
        onInterimTranscript?.(transcript)
      }
    },
    [onTranscript, onInterimTranscript]
  )

  const handleError = useCallback(
    (error: string) => {
      onError?.(error)
    },
    [onError]
  )

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
  } = useVoiceInput({
    language,
    onResult: handleResult,
    onError: handleError,
    continuous: voiceOptions?.continuous ?? true,
    interimResults: voiceOptions?.interimResults ?? true,
  })

  // Use refs to track previous values and only call callbacks on changes
  const prevListeningRef = useRef(false)
  const prevSupportedRef = useRef(false)

  // Notify parent about listening state changes
  useEffect(() => {
    if (isListening !== prevListeningRef.current) {
      prevListeningRef.current = isListening
      onListeningChange?.(isListening)
    }
  }, [isListening, onListeningChange])

  // Notify parent about support state changes
  useEffect(() => {
    if (isSupported !== prevSupportedRef.current) {
      prevSupportedRef.current = isSupported
      onSupportedChange?.(isSupported)
    }
  }, [isSupported, onSupportedChange])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
      resetTranscript()
    } else {
      resetTranscript()
      startListening()
    }
  }, [isListening, startListening, stopListening, resetTranscript])

  const handleLanguageChange = useCallback(
    (lang: string) => {
      setLanguage(lang)
      onLanguageChange?.(lang)
    },
    [setLanguage, onLanguageChange]
  )

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
  }

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
  }

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className={cn(
          'rounded-xl text-gray-300 cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        title="Voice input is not supported in this browser"
        aria-label="Voice input not supported"
      >
        <MicOff className={iconSizeClasses[size]} />
      </Button>
    )
  }

  return (
    <div className="relative inline-flex">
      <Button
        variant="ghost"
        onClick={toggleListening}
        disabled={disabled}
        className={cn(
          'rounded-xl transition-all duration-200 relative',
          sizeClasses[size],
          isListening
            ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600'
            : 'text-[#6B7280] hover:text-[#1A3C5E] hover:bg-[#E8F0FE]',
          className
        )}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Mic className={iconSizeClasses[size]} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Mic className={iconSizeClasses[size]} />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Pulsing ring when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 pointer-events-none"
          >
            <span className="absolute inset-0 rounded-xl animate-voice-ping bg-red-400/20" />
            <span className="absolute inset-0 rounded-xl animate-voice-ping-delay bg-red-400/15" style={{ animationDelay: '0.5s' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening indicator text */}
      <AnimatePresence>
        {isListening && size === 'md' && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-red-500 flex items-center gap-1"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Listening
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * A compact language toggle for voice input.
 * Shows EN/اردو buttons to switch recognition language.
 */
export function VoiceLanguageToggle({
  language,
  onLanguageChange,
}: {
  language: string
  onLanguageChange: (lang: string) => void
}) {
  const isUrdu = language === 'ur-PK'

  return (
    <div className="flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5">
      <button
        onClick={() => onLanguageChange('en-PK')}
        className={cn(
          'px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all',
          !isUrdu
            ? 'bg-[#F5A623] text-[#1A3C5E]'
            : 'text-white/60 hover:text-white/80'
        )}
        aria-label="Switch to English voice input"
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange('ur-PK')}
        className={cn(
          'px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all',
          isUrdu
            ? 'bg-[#F5A623] text-[#1A3C5E]'
            : 'text-white/60 hover:text-white/80'
        )}
        aria-label="Switch to Urdu voice input"
      >
        اردو
      </button>
    </div>
  )
}
