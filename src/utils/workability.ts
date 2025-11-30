import { Workability } from '../services/types'
import { WORKABILITY_THRESHOLDS } from './constants'

interface WorkabilityParams {
  precipitation: number
  windSpeed: number
  hasThunder: boolean
  hour: number
}

export const calculateWorkability = ({ precipitation, windSpeed, hasThunder, hour }: WorkabilityParams): Workability => {
  if (hour < 6 || hour >= 19) return 'night'
  if (hasThunder) return 'unsuitable'
  const isHighPrecipitation = precipitation >= WORKABILITY_THRESHOLDS.precipitation.caution
  const isHighWind = windSpeed >= WORKABILITY_THRESHOLDS.windSpeed.caution
  if (isHighPrecipitation || isHighWind) return 'unsuitable'
  const isModeratePrecipitation = precipitation >= WORKABILITY_THRESHOLDS.precipitation.suitable
  const isModerateWind = windSpeed >= WORKABILITY_THRESHOLDS.windSpeed.suitable
  if (isModeratePrecipitation || isModerateWind) return 'caution'
  return 'suitable'
}

export const extractWorkableTimeSlots = (
  hourlyData: { time: Date; workability: Workability }[]
): { startTime: Date; endTime: Date; durationHours: number }[] => {
  const slots: { startTime: Date; endTime: Date; durationHours: number }[] = []
  let currentSlot: { startTime: Date; endTime: Date } | null = null
  for (let i = 0; i < hourlyData.length; i++) {
    const { time, workability } = hourlyData[i]
    if (workability === 'suitable') {
      if (!currentSlot) currentSlot = { startTime: time, endTime: time }
      else currentSlot.endTime = time
    } else {
      if (currentSlot) {
        const durationMs = currentSlot.endTime.getTime() - currentSlot.startTime.getTime()
        const durationHours = Math.round(durationMs / (1000 * 60 * 60)) + 1
        slots.push({ ...currentSlot, durationHours })
        currentSlot = null
      }
    }
  }
  if (currentSlot) {
    const durationMs = currentSlot.endTime.getTime() - currentSlot.startTime.getTime()
    const durationHours = Math.round(durationMs / (1000 * 60 * 60)) + 1
    slots.push({ ...currentSlot, durationHours })
  }
  return slots
}

export const calculateTotalWorkableHours = (
  hourlyData: { workability: Workability }[]
): number => {
  return hourlyData.filter((d) => d.workability === 'suitable').length
}
