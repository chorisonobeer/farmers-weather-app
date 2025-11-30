import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export const isPushConfigured = !!VAPID_PUBLIC_KEY && !!supabase

export const registerSW = async () => {
  if (!('serviceWorker' in navigator)) return null
  const reg = await navigator.serviceWorker.register('/sw.js')
  return reg
}

export const subscribePush = async (userId: string) => {
  if (!isPushConfigured) throw new Error('Push未設定')

  // Ensure Notification permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('通知許可が必要です')
  }

  // Register SW and wait until it becomes active
  await registerSW()
  const ready = await navigator.serviceWorker.ready

  const sub = await ready.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!)
  })
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
  await supabase!
    .from('push_subscriptions')
    .insert({ user_id: userId, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth })
  return sub
}

export const unsubscribePush = async () => {
  await registerSW()
  const ready = await navigator.serviceWorker.ready
  const sub = await ready.pushManager.getSubscription()
  await sub?.unsubscribe()
}

export const sendTestNotification = async (sub: PushSubscription, payload?: { title?: string; body?: string }) => {
  if (!supabase) throw new Error('Supabase未設定')
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
  const { data, error } = await supabase.functions.invoke('push', {
    body: { endpoint: json.endpoint, keys: json.keys, payload }
  })
  if (error) throw error
  return data
}
