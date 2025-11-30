import { OpenMeteoResponse, HourlyWeather, CurrentWeather, WeatherType, Location } from './types'
import { WEATHER_CODE_MAP } from '../utils/constants'
import { calculateWorkability } from '../utils/workability'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export const fetchOpenMeteoData = async (location: Location): Promise<OpenMeteoResponse> => {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    hourly: 'temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code',
    current: 'temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code',
    timezone: 'Asia/Tokyo',
    forecast_days: '3',
  })
  const response = await fetch(`${BASE_URL}?${params}`)
  if (!response.ok) throw new Error(`Open-Meteo API error: ${response.status}`)
  return response.json()
}

const convertWeatherCode = (code: number): WeatherType => {
  return (WEATHER_CODE_MAP[code] as WeatherType) || 'cloudy'
}

export const parseCurrentWeather = (data: OpenMeteoResponse): CurrentWeather => {
  const current = data.current
  const weatherType = convertWeatherCode(current.weather_code)
  const now = new Date()
  const hour = now.getHours()
  const hasThunder = current.weather_code >= 95
  const workability = calculateWorkability({
    precipitation: current.precipitation,
    windSpeed: current.wind_speed_10m,
    hasThunder,
    hour,
  })
  return {
    temperature: current.temperature_2m,
    weatherType,
    workability,
    windSpeed: current.wind_speed_10m,
    windDirection: '北',
    precipitation: current.precipitation,
    humidity: current.relative_humidity_2m,
    hasThunder,
    visibility: 10,
    updatedAt: now,
  }
}

export const parseHourlyWeather = (data: OpenMeteoResponse): HourlyWeather[] => {
  const hourly = data.hourly
  const result: HourlyWeather[] = []
  for (let i = 0; i < hourly.time.length; i++) {
    const time = new Date(hourly.time[i])
    const hour = time.getHours()
    const weatherType = convertWeatherCode(hourly.weather_code[i])
    const hasThunder = hourly.weather_code[i] >= 95
    const workability = calculateWorkability({
      precipitation: hourly.precipitation[i],
      windSpeed: hourly.wind_speed_10m[i],
      hasThunder,
      hour,
    })
    result.push({
      time,
      temperature: hourly.temperature_2m[i],
      weatherType,
      workability,
      precipitation: hourly.precipitation[i],
      windSpeed: hourly.wind_speed_10m[i],
      humidity: hourly.relative_humidity_2m[i],
    })
  }
  return result
}
