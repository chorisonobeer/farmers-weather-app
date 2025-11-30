import React from 'react'
import { CurrentWeather, HourlyWeather } from '../../services/types'

interface Props {
  currentWeather: CurrentWeather
  hourlyWeather: HourlyWeather[]
}

export const Diagnostics: React.FC<Props> = ({ currentWeather, hourlyWeather }) => {
  return (
    <div className="card" role="status" aria-live="polite">
      <div className="flex items-center justify-between">
        <span className="font-semibold">データ取得OK</span>
        <span className="text-sm text-gray-600 dark:text-gray-300">hourly: {hourlyWeather.length}</span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">temp: {Math.round(currentWeather.temperature)}℃</div>
    </div>
  )
}

