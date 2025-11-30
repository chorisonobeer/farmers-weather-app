export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'
export type Workability = 'suitable' | 'caution' | 'unsuitable' | 'night'

export interface CurrentWeather {
  temperature: number
  weatherType: WeatherType
  workability: Workability
  windSpeed: number
  windDirection: string
  precipitation: number
  humidity: number
  hasThunder: boolean
  visibility: number
  updatedAt: Date
}

export interface HourlyWeather {
  time: Date
  temperature: number
  weatherType: WeatherType
  workability: Workability
  precipitation: number
  windSpeed: number
  humidity: number
}

export interface WorkableTimeSlot {
  startTime: Date
  endTime: Date
  durationHours: number
}

export interface WeatherAlert {
  id: string
  type: 'warning' | 'advisory'
  category: string
  title: string
  description: string
  issuedAt: Date
  severity: 'high' | 'medium' | 'low'
}

export interface DailyForecast {
  date: Date
  maxTemperature: number
  minTemperature: number
  weatherType: WeatherType
  precipitationProbability: number
  workability: Workability
}

export interface Location {
  latitude: number
  longitude: number
  address?: string
}

export type JMAResponse = Record<string, unknown>

export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation: number[]
    wind_speed_10m: number[]
    relative_humidity_2m: number[]
    weather_code: number[]
  }
  current: {
    temperature_2m: number
    precipitation: number
    wind_speed_10m: number
    relative_humidity_2m: number
    weather_code: number
  }
}
