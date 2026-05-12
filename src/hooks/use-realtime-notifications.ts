'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase-client'
import { showLocalNotification } from '@/lib/push-notifications'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Web Audio API notification sound
function playNotificationSound() {
  try {
    if (typeof window === 'undefined') return
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

    // Create a subtle "ding" sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch {
    // Audio not available, silently ignore
  }
}

export function useRealtimeNotifications() {
  const addNotification = useAppStore((s) => s.addNotification)
  const subscriptionRef = useRef<RealtimeChannel | null>(null)
  const hasSetup = useRef(false)

  const handleNewNotification = useCallback((payload: { new: Record<string, unknown> }) => {
    const newNotif = payload.new
    if (!newNotif) return

    const title = (newNotif.title as string) || 'New Notification'
    const message = (newNotif.message as string) || ''
    const type = (newNotif.type as 'status' | 'payment' | 'deadline' | 'info') || 'info'
    const link = (newNotif.link as string) || undefined

    // Add to Zustand store (in-app notification)
    addNotification({
      title,
      message,
      type,
      link,
    })

    // Play sound
    playNotificationSound()

    // Show push notification via service worker (works even when app is in background)
    // This checks notification preferences internally
    showLocalNotification(title, message, {
      url: link || '/',
      type,
      tag: `jugnoo-${Date.now()}`,
    })
  }, [addNotification])

  useEffect(() => {
    if (hasSetup.current) return
    hasSetup.current = true

    // Try to set up Supabase Realtime subscription
    try {
      const supabase = getSupabaseClient()

      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            handleNewNotification(payload as unknown as { new: Record<string, unknown> })
          }
        )
        .subscribe()

      subscriptionRef.current = channel
    } catch {
      // Supabase client not available or not configured
      console.log('Supabase Realtime not available for notifications')
    }

    return () => {
      if (subscriptionRef.current) {
        try {
          const supabase = getSupabaseClient()
          supabase.removeChannel(subscriptionRef.current)
        } catch {
          // Cleanup failed
        }
        subscriptionRef.current = null
      }
    }
  }, [handleNewNotification])

  return {
    // Expose no-op requestNotificationPermission — permission is now managed
    // through the PushNotificationSettings component and push-notifications.ts
    requestNotificationPermission: async () => {},
  }
}
