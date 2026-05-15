'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabase-client'
import { showLocalNotification } from '@/lib/push-notifications'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Web Audio API notification sound - pleasant two-tone ding
function playNotificationSound() {
  try {
    if (typeof window === 'undefined') return
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

    // Create a pleasant two-tone notification sound
    const playTone = (frequency: number, startTime: number, duration: number, volume: number) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    const now = audioContext.currentTime

    // First tone - higher pitch (ding)
    playTone(880, now, 0.2, 0.3)
    // Second tone - lower pitch (dong)
    playTone(660, now + 0.15, 0.25, 0.25)
    // Third tone - resolve (ding)
    playTone(1100, now + 0.35, 0.15, 0.2)
  } catch {
    // Audio not available, silently ignore
  }
}

export function useRealtimeNotifications() {
  const addNotification = useAppStore((s) => s.addNotification)
  const subscriptionsRef = useRef<RealtimeChannel[]>([])
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

      subscriptionsRef.current.push(channel)

      // Also subscribe to new service applications (new customer orders)
      const appChannel = supabase
        .channel('service-applications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'service_applications',
          },
          (payload) => {
            const newApp = payload.new as Record<string, unknown>
            if (!newApp) return

            const applicantName = (newApp.applicant_name as string) || 'Customer'
            const serviceName = (newApp.service_name as string) || 'Service'

            // Add to Zustand store (in-app notification)
            addNotification({
              title: 'New Order Received!',
              message: `${applicantName} placed an order for ${serviceName}`,
              type: 'status',
              link: '/orders',
            })

            // Play sound
            playNotificationSound()

            // Show push notification
            showLocalNotification('New Order - Jugnoo', `${applicantName} ordered ${serviceName}`, {
              url: '/orders',
              type: 'status',
              tag: `jugnoo-order-${Date.now()}`,
            })
          }
        )
        .subscribe()

      subscriptionsRef.current.push(appChannel)
    } catch {
      // Supabase client not available or not configured
      console.log('Supabase Realtime not available for notifications')
    }

    return () => {
      // Cleanup all subscriptions
      for (const sub of subscriptionsRef.current) {
        try {
          const supabase = getSupabaseClient()
          supabase.removeChannel(sub)
        } catch {
          // Cleanup failed
        }
      }
      subscriptionsRef.current = []
    }
  }, [handleNewNotification, addNotification])

  return {
    // Expose no-op requestNotificationPermission — permission is now managed
    // through the PushNotificationSettings component and push-notifications.ts
    requestNotificationPermission: async () => {},
  }
}
