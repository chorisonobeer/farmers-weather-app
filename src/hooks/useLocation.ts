import { useState, useEffect } from 'react'
import { Location } from '../services/types'
import { DEFAULT_LOCATION } from '../utils/constants'

const STORAGE_KEY = 'sado-weather-location'

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setLocation(JSON.parse(saved))
      setLoading(false)
    } else {
      getCurrentLocation()
    }
  }, [])

  const getCurrentLocation = () => {
    setLoading(true)
    setError(null)
    if (!navigator.geolocation) {
      setLocation(DEFAULT_LOCATION)
      setError(null)
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setLocation(newLocation)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation))
        setLoading(false)
      },
      () => {
        setLocation(DEFAULT_LOCATION)
        setError(null)
        setLoading(false)
      }
    )
  }

  const setManualLocation = (lat: number, lon: number) => {
    const newLocation: Location = { latitude: lat, longitude: lon }
    setLocation(newLocation)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation))
  }

  return { location, loading, error, getCurrentLocation, setManualLocation }
}
