import React from 'react'
import { CurrentWeather as CurrentWeatherType } from '../../services/types'
import { WEATHER_ICONS, WORKABILITY_COLORS, WORKABILITY_LABELS } from '../../utils/constants'
import { formatTemperature, formatWindSpeed, formatPrecipitation, formatTime, formatHumidity } from '../../utils/formatters'

interface Props {
  weather: CurrentWeatherType
  onRefresh: () => void
  loading: boolean
}

export const CurrentWeather: React.FC<Props> = ({ weather, onRefresh, loading }) => {
  const workabilityColor = WORKABILITY_COLORS[weather.workability]
  const workabilityLabel = WORKABILITY_LABELS[weather.workability]
  const weatherIcon = WEATHER_ICONS[weather.weatherType]

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">最終更新: {formatTime(weather.updatedAt)}</p>
        <button onClick={onRefresh} disabled={loading} className="text-blue-600 hover:text-blue-800 disabled:text-gray-400">
          {loading ? '更新中...' : '🔄'}
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl mb-2">{weatherIcon}</div>
        <div className="text-4xl font-bold">{formatTemperature(weather.temperature)}</div>
      </div>

      <div className={`${workabilityColor} rounded-lg py-4 px-6 text-center mb-6`}>
        <div className="text-2xl font-bold">{workabilityLabel}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">風速</p>
          <p className="font-semibold">{formatWindSpeed(weather.windSpeed)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">降水量</p>
          <p className="font-semibold">{formatPrecipitation(weather.precipitation)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">湿度</p>
          <p className="font-semibold">{formatHumidity(weather.humidity)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">雷</p>
          <p className="font-semibold">{weather.hasThunder ? 'あり ⚡' : 'なし'}</p>
        </div>
      </div>
    </div>
  )
}

