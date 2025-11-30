export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })
}

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}℃`
}

export const formatWindSpeed = (speed: number): string => {
  return `${speed.toFixed(1)}m/s`
}

export const formatPrecipitation = (precip: number): string => {
  if (precip === 0) return 'なし'
  return `${precip.toFixed(1)}mm/h`
}

export const formatHumidity = (humidity: number): string => {
  return `${Math.round(humidity)}%`
}

export const formatWindDirection = (degrees: number): string => {
  const directions = ['北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東', '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export const formatPrecipitationProbability = (prob: number): string => {
  return `${Math.round(prob)}%`
}
