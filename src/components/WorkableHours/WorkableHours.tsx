import React from 'react'
import { HourlyWeather } from '../../services/types'
import { extractWorkableTimeSlots, calculateTotalWorkableHours } from '../../utils/workability'
import { formatTime } from '../../utils/formatters'

interface Props {
  hourlyData: HourlyWeather[]
  startHour?: number
  endHour?: number
}

export const WorkableHours: React.FC<Props> = ({ hourlyData, startHour = 5, endHour = 19 }) => {
  const today = new Date()
  const todayData = hourlyData.filter((h) => {
    const hour = h.time.getHours()
    return h.time.getDate() === today.getDate() && hour >= startHour && hour < endHour
  })
  const timeSlots = extractWorkableTimeSlots(todayData)
  const totalHours = calculateTotalWorkableHours(todayData)
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">💧 本日の作業可能時間</h2>
      {totalHours === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">本日は作業に適した時間帯がありません</div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              作業可能時間: <span className="font-bold text-workable">合計 {totalHours}時間</span>
            </p>
          </div>
          <div className="space-y-3">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between bg-workable/10 border-l-4 border-workable rounded-lg p-3">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">🟢 {formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{slot.durationHours}時間</div>
              </div>
            ))}
          </div>
          {timeSlots.length > 0 && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              ⚠️ 天気は急変する可能性があります。作業中も空模様に注意してください。
            </div>
          )}
        </>
      )}
    </div>
  )
}
