'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff, CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  initializePushNotifications,
  unsubscribeFromPush,
  getNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/push-notifications'

export function PushNotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const [preferences, setPreferences] = useState<NotificationPreferences>(getNotificationPreferences())
  const [isLoading, setIsLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  // Load current permission state on mount
  useEffect(() => {
    setPermission(getNotificationPermission())
  }, [])

  const handleEnableNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await initializePushNotifications()
      setPermission(result.permission)
      if (result.permission === 'granted') {
        const newPrefs = { ...preferences, enabled: true }
        setPreferences(newPrefs)
        saveNotificationPreferences(newPrefs)
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [preferences])

  const handleDisableNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      await unsubscribeFromPush()
      const newPrefs = { ...preferences, enabled: false }
      setPreferences(newPrefs)
      saveNotificationPreferences(newPrefs)
    } catch (error) {
      console.error('Failed to disable notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [preferences])

  const handleToggleEnabled = useCallback(async (checked: boolean) => {
    setIsToggling(true)
    try {
      if (checked) {
        const currentPermission = getNotificationPermission()
        if (currentPermission !== 'granted') {
          const result = await initializePushNotifications()
          setPermission(result.permission)
          if (result.permission !== 'granted') {
            setIsToggling(false)
            return
          }
        }
        const newPrefs = { ...preferences, enabled: true }
        setPreferences(newPrefs)
        saveNotificationPreferences(newPrefs)
      } else {
        await unsubscribeFromPush()
        const newPrefs = { ...preferences, enabled: false }
        setPreferences(newPrefs)
        saveNotificationPreferences(newPrefs)
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
    } finally {
      setIsToggling(false)
    }
  }, [preferences])

  const handleTogglePreference = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    saveNotificationPreferences(newPrefs)
  }, [preferences])

  const handleRefreshPermission = useCallback(() => {
    setPermission(getNotificationPermission())
  }, [])

  // Permission status badge
  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Allowed
          </Badge>
        )
      case 'denied':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Blocked
          </Badge>
        )
      case 'default':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
            <AlertCircle className="w-3 h-3" />
            Not Asked
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="w-3 h-3" />
            Unsupported
          </Badge>
        )
    }
  }

  const isSupported = isNotificationSupported()
  const isGranted = permission === 'granted'
  const isDenied = permission === 'denied'

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            {isGranted ? (
              <Bell className="w-5 h-5 text-amber-500" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            Push Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            {getPermissionBadge()}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRefreshPermission}
              title="Refresh status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Get notified about order updates, payments, and deadlines — even when the app is closed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          /* Unsupported browser message */
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Push notifications not supported</p>
              <p className="text-xs text-gray-500">Your browser does not support push notifications. In-app notifications will still work.</p>
            </div>
          </div>
        ) : isDenied ? (
          /* Denied permission message */
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">Notifications blocked</p>
              <p className="text-xs text-red-600">
                You have blocked notifications. To re-enable, go to your browser settings → Site Settings → Notifications → Allow.
              </p>
            </div>
          </div>
        ) : !isGranted ? (
          /* Request permission */
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700">Enable push notifications</p>
                <p className="text-xs text-amber-600">
                  Allow notifications to receive real-time updates about your orders, payments, and deadlines.
                </p>
              </div>
            </div>
            <Button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              Enable Push Notifications
            </Button>
          </div>
        ) : (
          /* Notification preferences */
          <div className="space-y-4">
            {/* Main toggle */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700">Push notifications enabled</p>
                  <p className="text-xs text-green-600">You will receive notifications even when the app is closed.</p>
                </div>
              </div>
              <Switch
                checked={preferences.enabled}
                onCheckedChange={(checked) => handleToggleEnabled(checked)}
                disabled={isToggling}
              />
            </div>

            <Separator />

            {/* Notification type toggles */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#003366]">Notification Types / اطلاعاتی اقسام</p>
              <p className="text-xs text-muted-foreground">Choose which types of notifications you want to receive.</p>

              {/* Status changes */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] flex items-center justify-center">
                    <span className="text-sm">📋</span>
                  </div>
                  <div>
                    <Label htmlFor="pref-status" className="text-sm font-medium cursor-pointer">Status Changes</Label>
                    <p className="text-xs text-muted-foreground">Order & application status updates</p>
                  </div>
                </div>
                <Switch
                  id="pref-status"
                  checked={preferences.statusChanges}
                  onCheckedChange={(checked) => handleTogglePreference('statusChanges', checked)}
                  disabled={!preferences.enabled}
                />
              </div>

              {/* Payments */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
                    <span className="text-sm">💰</span>
                  </div>
                  <div>
                    <Label htmlFor="pref-payment" className="text-sm font-medium cursor-pointer">Payments</Label>
                    <p className="text-xs text-muted-foreground">Payment confirmations & reminders</p>
                  </div>
                </div>
                <Switch
                  id="pref-payment"
                  checked={preferences.payments}
                  onCheckedChange={(checked) => handleTogglePreference('payments', checked)}
                  disabled={!preferences.enabled}
                />
              </div>

              {/* Deadlines */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF3D6] flex items-center justify-center">
                    <span className="text-sm">⏰</span>
                  </div>
                  <div>
                    <Label htmlFor="pref-deadline" className="text-sm font-medium cursor-pointer">Deadlines</Label>
                    <p className="text-xs text-muted-foreground">Application & document deadline alerts</p>
                  </div>
                </div>
                <Switch
                  id="pref-deadline"
                  checked={preferences.deadlines}
                  onCheckedChange={(checked) => handleTogglePreference('deadlines', checked)}
                  disabled={!preferences.enabled}
                />
              </div>

              {/* Info */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F3E5F5] flex items-center justify-center">
                    <span className="text-sm">📢</span>
                  </div>
                  <div>
                    <Label htmlFor="pref-info" className="text-sm font-medium cursor-pointer">General Info</Label>
                    <p className="text-xs text-muted-foreground">Announcements & general updates</p>
                  </div>
                </div>
                <Switch
                  id="pref-info"
                  checked={preferences.info}
                  onCheckedChange={(checked) => handleTogglePreference('info', checked)}
                  disabled={!preferences.enabled}
                />
              </div>
            </div>

            <Separator />

            {/* Disable button */}
            <Button
              variant="outline"
              onClick={handleDisableNotifications}
              disabled={isLoading}
              className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
              Disable Push Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
