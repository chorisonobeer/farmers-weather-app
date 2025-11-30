import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type PrefRecord = {
  id: string
  user_id: string
  theme: 'light' | 'dark'
  notifications: boolean
  time_window: string
}

const DEFAULT_TIME_WINDOW = '05:00-19:00'

const parseWindow = (win: string) => {
  const m = win.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/)
  if (!m) return { start: 5, end: 19 }
  const start = parseInt(m[1], 10)
  const end = parseInt(m[3], 10)
  return { start, end }
}

export const usePreferences = (userId: string | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [record, setRecord] = useState<PrefRecord | null>(null)

  const timeWindow = useMemo(() => parseWindow(record?.time_window ?? DEFAULT_TIME_WINDOW), [record])

  useEffect(() => {
    const init = async () => {
      if (!supabase || !userId) return
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle()
      if (error) {
        setError(error.message)
      } else if (!data) {
        const { data: created, error: insertError } = await supabase
          .from('preferences')
          .insert({ user_id: userId, theme: 'light', notifications: true, time_window: DEFAULT_TIME_WINDOW })
          .select('*')
          .single()
        if (insertError) setError(insertError.message)
        else setRecord(created as PrefRecord)
      } else {
        setRecord(data as PrefRecord)
      }
      setLoading(false)
    }
    init()
  }, [userId])

  const setNotifications = async (enabled: boolean) => {
    if (!supabase || !userId) return
    setRecord((prev) => (prev ? { ...prev, notifications: enabled } : prev))
    await supabase.from('preferences').update({ notifications: enabled }).eq('user_id', userId)
  }

  const setTimeWindow = async (startHour: number, endHour: number) => {
    if (!supabase || !userId) return
    const win = `${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`
    setRecord((prev) => (prev ? { ...prev, time_window: win } : prev))
    await supabase.from('preferences').update({ time_window: win }).eq('user_id', userId)
  }

  return {
    loading,
    error,
    notificationsEnabled: record?.notifications ?? true,
    timeWindowStart: timeWindow.start,
    timeWindowEnd: timeWindow.end,
    setNotifications,
    setTimeWindow,
  }
}

