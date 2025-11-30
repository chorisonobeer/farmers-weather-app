import React from 'react'
import { WeatherAlert } from '../../services/types'

interface Props {
  alerts: WeatherAlert[]
}

export const AlertBanner: React.FC<Props> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-800 dark:text-green-200">⚠️ 注意報・警報: なし</p>
      </div>
    )
  }
  return (
    <div className="space-y-2 mb-4">
      {alerts.map((alert) => {
        const bgColor = alert.type === 'warning' ? 'bg-red-100 dark:bg-red-900/20 border-red-500 dark:border-red-600' : 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-600'
        const textColor = alert.type === 'warning' ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
        return (
          <div key={alert.id} className={`${bgColor} border-l-4 rounded-lg p-3`}>
            <div className="flex items-start">
              <span className="text-2xl mr-2">{alert.type === 'warning' ? '🚨' : '⚠️'}</span>
              <div className="flex-1">
                <h3 className={`font-bold ${textColor}`}>{alert.title}</h3>
                <p className={`text-sm ${textColor} mt-1`}>{alert.description}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

