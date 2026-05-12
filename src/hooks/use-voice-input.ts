'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface UseVoiceInputOptions {
  language?: string // 'ur-PK' for Urdu, 'en-PK' for English
  continuous?: boolean
  interimResults?: boolean
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export interface UseVoiceInputReturn {
  isListening: boolean
  transcript: string
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  language: string
  setLanguage: (lang: string) => void
}

// Types for the Web Speech API
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

// Check support once (outside of React lifecycle to avoid setState in effect)
function checkSpeechRecognitionSupport(): boolean {
  if (typeof window === 'undefined') return false
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

// Lazy-initialize the support flag
let _isSupported: boolean | null = null
function getIsSupported(): boolean {
  if (_isSupported === null) {
    _isSupported = checkSpeechRecognitionSupport()
  }
  return _isSupported
}

export function useVoiceInput(options?: UseVoiceInputOptions): UseVoiceInputReturn {
  const {
    language: initialLanguage = 'en-PK',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options || {}

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [language, setLanguageState] = useState(initialLanguage)
  // Use a stable reference for isSupported — no setState in effect needed
  const isSupported = getIsSupported()

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const isStoppingRef = useRef(false)
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Create / update recognition instance
  const createRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      isStoppingRef.current = false
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
        onResult?.(finalTranscript, true)
      } else if (interimTranscript) {
        onResult?.(interimTranscript, false)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMap: Record<string, string> = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone found. Please check your device.',
        'not-allowed': 'Microphone permission denied. Please allow access in browser settings.',
        'network': 'Network error occurred. Please check your connection.',
        'aborted': 'Voice input was cancelled.',
        'service-not-allowed': 'Speech recognition service not allowed.',
        'bad-grammar': 'Speech recognition grammar error.',
        'language-not-supported': `Language "${language}" is not supported.`,
      }

      const errorMessage = errorMap[event.error] || `Voice input error: ${event.error}`

      // Don't report "no-speech" or "aborted" as real errors
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onError?.(errorMessage)
      }

      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setIsListening(false)
        recognitionRef.current = null
      }
    }

    recognition.onend = () => {
      // Auto-restart if we haven't explicitly stopped and continuous mode
      if (continuous && !isStoppingRef.current && recognitionRef.current) {
        // Clear any pending restart
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current)
        }
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognitionRef.current?.start()
          } catch {
            // Already started, ignore
            setIsListening(false)
          }
        }, 100)
      } else {
        setIsListening(false)
      }
    }

    return recognition
  }, [continuous, interimResults, language, onResult, onError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      if (recognitionRef.current) {
        isStoppingRef.current = true
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.('Speech recognition is not supported in this browser.')
      return
    }

    // Stop existing instance first
    if (recognitionRef.current) {
      isStoppingRef.current = true
      try {
        recognitionRef.current.abort()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }

    isStoppingRef.current = false

    const recognition = createRecognition()
    if (!recognition) return

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      onError?.('Failed to start voice input. Please try again.')
      recognitionRef.current = null
    }
  }, [isSupported, createRecognition, onError])

  const stopListening = useCallback(() => {
    isStoppingRef.current = true
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  const setLanguage = useCallback((lang: string) => {
    const wasListening = isListening
    if (wasListening) {
      stopListening()
    }
    setLanguageState(lang)
    if (wasListening) {
      // Restart with new language after a brief delay
      setTimeout(() => {
        const recognition = createRecognition()
        if (recognition) {
          recognition.lang = lang
          recognitionRef.current = recognition
          try {
            recognition.start()
          } catch {
            // ignore
          }
        }
      }, 200)
    }
  }, [isListening, stopListening, createRecognition])

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    language,
    setLanguage,
  }
}
