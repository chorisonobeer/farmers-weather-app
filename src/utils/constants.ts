export const WORKABILITY_THRESHOLDS = {
  precipitation: { suitable: 1, caution: 3 },
  windSpeed: { suitable: 10, caution: 15 },
} as const

export const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'sunny',
  1: 'sunny',
  2: 'cloudy',
  3: 'cloudy',
  45: 'cloudy',
  48: 'cloudy',
  51: 'rainy',
  53: 'rainy',
  55: 'rainy',
  61: 'rainy',
  63: 'rainy',
  65: 'rainy',
  71: 'snowy',
  73: 'snowy',
  75: 'snowy',
  80: 'rainy',
  81: 'rainy',
  82: 'rainy',
  85: 'snowy',
  86: 'snowy',
  95: 'stormy',
  96: 'stormy',
  99: 'stormy',
}

export const WEATHER_ICONS: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
}

export const WORKABILITY_COLORS = {
  suitable: 'bg-workable text-white',
  caution: 'bg-caution text-white',
  unsuitable: 'bg-unsuitable text-white',
  night: 'bg-night text-white',
} as const

export const WORKABILITY_LABELS = {
  suitable: '作業適',
  caution: '要注意',
  unsuitable: '作業不適',
  night: '夜間',
} as const

export const UPDATE_INTERVALS = {
  current: 10 * 60 * 1000,
  forecast: 60 * 60 * 1000,
  radar: 5 * 60 * 1000,
} as const

export const DEFAULT_LOCATION = {
  latitude: 38.0183,
  longitude: 138.3683,
  address: '新潟県佐渡市',
} as const
