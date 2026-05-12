'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase-client'

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

// Request browser notification permission
async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false

  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Show browser notification
function showBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  try {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'jugnoo-notification',
    })
  } catch {
    // Notification API not available
  }
}

export function useRealtimeNotifications() {
  const addNotification = useAppStore((s) => s.addNotification)
  const subscriptionRef = useRef<ReturnType<typeof getSupabaseClient>['channel'] | null>(null)
  const hasSetup = useRef(false)

  const handleNewNotification = useCallback((payload: { new: Record<string, unknown> }) => {
    const newNotif = payload.new
    if (!newNotif) return

    // Add to Zustand store
    addNotification({
      title: (newNotif.title as string) || 'New Notification',
      message: (newNotif.message as string) || '',
      type: (newNotif.type as 'status' | 'payment' | 'deadline' | 'info') || 'info',
      link: (newNotif.link as string) || undefined,
    })

    // Play sound
    playNotificationSound()

    // Show browser notification
    showBrowserNotification(
      (newNotif.title as string) || 'Jugnoo Smart Portal',
      (newNotif.message as string) || 'You have a new notification'
    )
  }, [addNotification])

  useEffect(() => {
    if (hasSetup.current) return
    hasSetup.current = true

    // Request browser notification permission
    requestNotificationPermission()

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
    requestNotificationPermission,
  }
}
