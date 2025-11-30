import { useState, useEffect } from 'react'
import { CurrentWeather, HourlyWeather, Location } from '../services/types'
import { fetchOpenMeteoData, parseCurrentWeather, parseHourlyWeather } from '../services/openMeteoApi'
import { UPDATE_INTERVALS } from '../utils/constants'
import { supabase } from '../lib/supabase'

export const useWeatherData = (location: Location | null, userId?: string | null) => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null)
  const [hourlyWeather, setHourlyWeather] = useState<HourlyWeather[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [snapshotDate, setSnapshotDate] = useState<string | null>(null)

  const fetchWeatherData = async () => {
    if (!location) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOpenMeteoData(location)
      const current = parseCurrentWeather(data)
      const hourly = parseHourlyWeather(data)
      setCurrentWeather(current)
      setHourlyWeather(hourly)
      setLastUpdated(new Date())

      // Save daily snapshot when user is logged in
      if (supabase && userId) {
        const today = new Date().toISOString().slice(0, 10)
        if (snapshotDate !== today) {
          const payload = {
            current: {
              temperature: current.temperature,
              precipitation: current.precipitation,
              windSpeed: current.windSpeed,
              workability: current.workability,
            },
            hourly: hourly.slice(0, 24).map((h) => ({
              time: h.time.toISOString(),
              temperature: h.temperature,
              precipitation: h.precipitation,
              windSpeed: h.windSpeed,
              workability: h.workability,
            })),
          }
          await supabase
            .from('weather_snapshots')
            .insert({
              user_id: userId,
              latitude: location.latitude,
              longitude: location.longitude,
              snapshot_at: new Date().toISOString(),
              data: payload,
            })
          // Retention: keep last 30 days
          const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          await supabase
            .from('weather_snapshots')
            .delete()
            .lt('snapshot_at', cutoff)
            .eq('user_id', userId)
          setSnapshotDate(today)
        }
      }
    } catch (err) {
      setError('天気データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
  }, [location])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeatherData()
    }, UPDATE_INTERVALS.current)
    return () => clearInterval(interval)
  }, [location])

  const refresh = () => {
    fetchWeatherData()
  }

  return { currentWeather, hourlyWeather, loading, error, lastUpdated, refresh }
}
