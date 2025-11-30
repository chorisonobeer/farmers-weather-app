import React from 'react'
import { HourlyWeather } from '../../services/types'
import { WEATHER_ICONS, WORKABILITY_COLORS } from '../../utils/constants'
import { formatTime, formatTemperature } from '../../utils/formatters'

interface Props {
  hourlyData: HourlyWeather[]
}

export const Timeline: React.FC<Props> = ({ hourlyData }) => {
  const displayData = hourlyData.slice(0, 24)
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">📊 今日のタイムライン</h2>
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {displayData.map((hour, index) => {
            const workabilityColor = WORKABILITY_COLORS[hour.workability].replace('text-white', '')
            const weatherIcon = WEATHER_ICONS[hour.weatherType]
            return (
              <div key={index} className={`flex-shrink-0 w-16 text-center ${workabilityColor} rounded-lg p-2`}>
                <div className="text-xs text-white font-semibold mb-1">{formatTime(hour.time)}</div>
                <div className="text-2xl mb-1">{weatherIcon}</div>
                <div className="text-sm text-white font-bold">{formatTemperature(hour.temperature)}</div>
                <div className="text-xs text-white mt-1">{hour.precipitation > 0 ? `${hour.precipitation.toFixed(1)}mm` : ''}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">気温推移</h3>
        <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
          <svg width="100%" height="100%" className="text-blue-600 dark:text-blue-400">
            {displayData.map((hour, index) => {
              if (index === 0) return null
              const prevHour = displayData[index - 1]
              const x1 = ((index - 1) / displayData.length) * 100
              const x2 = (index / displayData.length) * 100
              const y1 = 100 - ((prevHour.temperature + 10) / 40) * 100
              const y2 = 100 - ((hour.temperature + 10) / 40) * 100
              return (
                <line key={index} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="currentColor" strokeWidth="2" />
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}

