# 佐渡農作業天気アプリ - 実装ガイド

このドキュメントは、Cursorで段階的にアプリを実装するためのガイドです。各STEPを順番に実行してください。

---

## 前提条件

### 開発環境
- Node.js: v18以上（Bun推奨）
- エディタ: Cursor
- Git: インストール済み

### 必要な知識
- React + TypeScript
- Tailwind CSS
- REST API

---

## プロジェクト構造

```
sado-weather-app/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── CurrentWeather/  # 現在天気コンポーネント
│   │   ├── Timeline/        # タイムライン表示
│   │   ├── WorkableHours/   # 作業可能時間帯
│   │   ├── RainRadar/       # 雨雲レーダー
│   │   ├── DetailedData/    # 詳細データグラフ
│   │   ├── WeeklyForecast/  # 週間予報
│   │   └── AlertBanner/     # 警報・注意報バナー
│   ├── hooks/               # カスタムフック
│   │   ├── useWeatherData.ts
│   │   ├── useLocation.ts
│   │   └── useNotification.ts
│   ├── services/            # API通信層
│   │   ├── jmaApi.ts        # 気象庁API
│   │   ├── openMeteoApi.ts  # Open-Meteo API
│   │   └── types.ts         # 型定義
│   ├── utils/               # ユーティリティ関数
│   │   ├── workability.ts   # 作業適性判定
│   │   ├── formatters.ts    # データフォーマット
│   │   └── constants.ts     # 定数
│   ├── App.tsx              # メインアプリ
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── public/
│   ├── manifest.json        # PWA設定
│   └── sw.js                # Service Worker
├── docs/                    # ドキュメント
├── .cursorrules             # Cursor設定
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 実装の流れ

### フェーズ1: 基本セットアップ（STEP 1-5）
- プロジェクト初期化
- 基本UIの実装
- API連携の基礎

### フェーズ2: コア機能実装（STEP 6-12）
- 天気表示機能
- タイムライン機能
- 作業適性判定

### フェーズ3: 高度な機能（STEP 13-18）
- 雨雲レーダー
- 通知機能
- PWA対応

---

## STEP 1: プロジェクト初期化

### 目的
Bunを使ってReact + TypeScript + Viteプロジェクトを作成する。

### 実行コマンド
```bash
# Bunのインストール（未インストールの場合）
curl -fsSL https://bun.sh/install | bash

# プロジェクト作成
bun create vite sado-weather-app --template react-ts
cd sado-weather-app

# 依存関係のインストール
bun install

# 追加ライブラリのインストール
bun add tailwindcss postcss autoprefixer
bun add -d @types/node

# Tailwind CSSの初期化
bunx tailwindcss init -p
```

### ファイル作成・編集

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        workable: '#10b981',      // 作業適（緑）
        caution: '#f59e0b',       // 要注意（黄）
        unsuitable: '#ef4444',    // 作業不適（赤）
        night: '#6b7280',         // 夜間（灰）
      },
    },
  },
  plugins: [],
}
```

#### `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
    @apply font-sans antialiased;
  }
}

@layer components {
  .card {
    @apply bg-white rounded-lg shadow-md p-4;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition;
  }
}
```

### 確認
```bash
bun run dev
```
ブラウザで http://localhost:5173 が開けることを確認。

---

## STEP 2: 型定義の作成

### 目的
API レスポンスとアプリ内で使用するデータ型を定義する。

### ファイル作成: `src/services/types.ts`

```typescript
// 天気の種類
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';

// 作業適性
export type Workability = 'suitable' | 'caution' | 'unsuitable' | 'night';

// 現在の天気データ
export interface CurrentWeather {
  temperature: number;        // 気温（℃）
  weatherType: WeatherType;   // 天気
  workability: Workability;   // 作業適性
  windSpeed: number;          // 風速（m/s）
  windDirection: string;      // 風向
  precipitation: number;      // 降水量（mm/h）
  humidity: number;           // 湿度（%）
  hasThunder: boolean;        // 雷の有無
  visibility: number;         // 視界（km）
  updatedAt: Date;            // 更新日時
}

// 時間別天気データ
export interface HourlyWeather {
  time: Date;                 // 時刻
  temperature: number;        // 気温
  weatherType: WeatherType;   // 天気
  workability: Workability;   // 作業適性
  precipitation: number;      // 降水量
  windSpeed: number;          // 風速
  humidity: number;           // 湿度
}

// 作業可能時間帯
export interface WorkableTimeSlot {
  startTime: Date;
  endTime: Date;
  durationHours: number;
}

// 警報・注意報
export interface WeatherAlert {
  id: string;
  type: 'warning' | 'advisory';  // 警報 or 注意報
  category: string;               // 種類（大雨、雷、暴風など）
  title: string;                  // タイトル
  description: string;            // 詳細
  issuedAt: Date;                 // 発令日時
  severity: 'high' | 'medium' | 'low';  // 深刻度
}

// 日別予報
export interface DailyForecast {
  date: Date;
  maxTemperature: number;
  minTemperature: number;
  weatherType: WeatherType;
  precipitationProbability: number;  // 降水確率（%）
  workability: Workability;
}

// 位置情報
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// 気象庁APIレスポンス（簡略版）
export interface JMAResponse {
  // 実際のAPIレスポンスに合わせて定義
  [key: string]: any;
}

// Open-Meteo APIレスポンス
export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    relative_humidity_2m: number[];
    weather_code: number[];
  };
  current: {
    temperature_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    weather_code: number;
  };
}
```

### 確認
TypeScriptのエラーが出ないことを確認。

---

## STEP 3: 定数とユーティリティ関数の作成

### ファイル作成: `src/utils/constants.ts`

```typescript
// 作業適性判定の閾値
export const WORKABILITY_THRESHOLDS = {
  precipitation: {
    suitable: 1,      // 1mm/h未満: 作業適
    caution: 3,       // 3mm/h未満: 要注意
  },
  windSpeed: {
    suitable: 10,     // 10m/s未満: 作業適
    caution: 15,      // 15m/s未満: 要注意
  },
} as const;

// 天気コードから天気タイプへの変換（Open-Meteo用）
export const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'sunny',      // Clear sky
  1: 'sunny',      // Mainly clear
  2: 'cloudy',     // Partly cloudy
  3: 'cloudy',     // Overcast
  45: 'cloudy',    // Fog
  48: 'cloudy',    // Depositing rime fog
  51: 'rainy',     // Drizzle: Light
  53: 'rainy',     // Drizzle: Moderate
  55: 'rainy',     // Drizzle: Dense
  61: 'rainy',     // Rain: Slight
  63: 'rainy',     // Rain: Moderate
  65: 'rainy',     // Rain: Heavy
  71: 'snowy',     // Snow fall: Slight
  73: 'snowy',     // Snow fall: Moderate
  75: 'snowy',     // Snow fall: Heavy
  80: 'rainy',     // Rain showers: Slight
  81: 'rainy',     // Rain showers: Moderate
  82: 'rainy',     // Rain showers: Violent
  85: 'snowy',     // Snow showers: Slight
  86: 'snowy',     // Snow showers: Heavy
  95: 'stormy',    // Thunderstorm: Slight or moderate
  96: 'stormy',    // Thunderstorm with slight hail
  99: 'stormy',    // Thunderstorm with heavy hail
};

// 天気アイコンの絵文字
export const WEATHER_ICONS: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
};

// 作業適性の色
export const WORKABILITY_COLORS = {
  suitable: 'bg-workable text-white',
  caution: 'bg-caution text-white',
  unsuitable: 'bg-unsuitable text-white',
  night: 'bg-night text-white',
} as const;

// 作業適性のラベル
export const WORKABILITY_LABELS = {
  suitable: '作業適',
  caution: '要注意',
  unsuitable: '作業不適',
  night: '夜間',
} as const;

// データ更新間隔（ミリ秒）
export const UPDATE_INTERVALS = {
  current: 10 * 60 * 1000,      // 10分
  forecast: 60 * 60 * 1000,     // 1時間
  radar: 5 * 60 * 1000,         // 5分
} as const;

// 佐渡市のデフォルト位置
export const DEFAULT_LOCATION = {
  latitude: 38.0183,
  longitude: 138.3683,
  address: '新潟県佐渡市',
} as const;
```

### ファイル作成: `src/utils/formatters.ts`

```typescript
// 日時フォーマット関連
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 気象データのフォーマット
export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}℃`;
};

export const formatWindSpeed = (speed: number): string => {
  return `${speed.toFixed(1)}m/s`;
};

export const formatPrecipitation = (precip: number): string => {
  if (precip === 0) return 'なし';
  return `${precip.toFixed(1)}mm/h`;
};

export const formatHumidity = (humidity: number): string => {
  return `${Math.round(humidity)}%`;
};

// 風向のフォーマット（角度から方位へ）
export const formatWindDirection = (degrees: number): string => {
  const directions = ['北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東',
                      '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// 降水確率のフォーマット
export const formatPrecipitationProbability = (prob: number): string => {
  return `${Math.round(prob)}%`;
};
```

---

## STEP 4: 作業適性判定ロジックの実装

### ファイル作成: `src/utils/workability.ts`

```typescript
import { Workability } from '../services/types';
import { WORKABILITY_THRESHOLDS } from './constants';

interface WorkabilityParams {
  precipitation: number;    // 降水量（mm/h）
  windSpeed: number;        // 風速（m/s）
  hasThunder: boolean;      // 雷の有無
  hour: number;             // 時刻（0-23）
}

/**
 * 作業適性を判定する
 */
export const calculateWorkability = ({
  precipitation,
  windSpeed,
  hasThunder,
  hour,
}: WorkabilityParams): Workability => {
  // 夜間（19時〜6時）は判定対象外
  if (hour < 6 || hour >= 19) {
    return 'night';
  }

  // 雷がある場合は作業不適
  if (hasThunder) {
    return 'unsuitable';
  }

  // 降水量と風速で判定
  const isHighPrecipitation = precipitation >= WORKABILITY_THRESHOLDS.precipitation.caution;
  const isHighWind = windSpeed >= WORKABILITY_THRESHOLDS.windSpeed.caution;

  if (isHighPrecipitation || isHighWind) {
    return 'unsuitable';
  }

  const isModeratePrecipitation = 
    precipitation >= WORKABILITY_THRESHOLDS.precipitation.suitable;
  const isModerateWind = 
    windSpeed >= WORKABILITY_THRESHOLDS.windSpeed.suitable;

  if (isModeratePrecipitation || isModerateWind) {
    return 'caution';
  }

  return 'suitable';
};

/**
 * 連続した作業可能時間帯を抽出する
 */
export const extractWorkableTimeSlots = (
  hourlyData: { time: Date; workability: Workability }[]
): { startTime: Date; endTime: Date; durationHours: number }[] => {
  const slots: { startTime: Date; endTime: Date; durationHours: number }[] = [];
  let currentSlot: { startTime: Date; endTime: Date } | null = null;

  for (let i = 0; i < hourlyData.length; i++) {
    const { time, workability } = hourlyData[i];

    if (workability === 'suitable') {
      if (!currentSlot) {
        // 新しいスロット開始
        currentSlot = { startTime: time, endTime: time };
      } else {
        // 既存のスロットを延長
        currentSlot.endTime = time;
      }
    } else {
      if (currentSlot) {
        // スロット終了
        const durationMs = currentSlot.endTime.getTime() - currentSlot.startTime.getTime();
        const durationHours = Math.round(durationMs / (1000 * 60 * 60)) + 1; // +1時間
        slots.push({
          ...currentSlot,
          durationHours,
        });
        currentSlot = null;
      }
    }
  }

  // 最後のスロットを追加
  if (currentSlot) {
    const durationMs = currentSlot.endTime.getTime() - currentSlot.startTime.getTime();
    const durationHours = Math.round(durationMs / (1000 * 60 * 60)) + 1;
    slots.push({
      ...currentSlot,
      durationHours,
    });
  }

  return slots;
};

/**
 * 作業可能時間の合計を計算する
 */
export const calculateTotalWorkableHours = (
  hourlyData: { workability: Workability }[]
): number => {
  return hourlyData.filter(d => d.workability === 'suitable').length;
};
```

---

## STEP 5: API通信層の実装（Open-Meteo）

### ファイル作成: `src/services/openMeteoApi.ts`

```typescript
import { OpenMeteoResponse, HourlyWeather, CurrentWeather, WeatherType, Location } from './types';
import { WEATHER_CODE_MAP, WEATHER_ICONS } from '../utils/constants';
import { calculateWorkability } from '../utils/workability';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Open-Meteo APIから天気データを取得する
 */
export const fetchOpenMeteoData = async (location: Location): Promise<OpenMeteoResponse> => {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    hourly: 'temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code',
    current: 'temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code',
    timezone: 'Asia/Tokyo',
    forecast_days: '3',
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  return response.json();
};

/**
 * 天気コードから天気タイプに変換
 */
const convertWeatherCode = (code: number): WeatherType => {
  return (WEATHER_CODE_MAP[code] as WeatherType) || 'cloudy';
};

/**
 * レスポンスを現在天気データに変換
 */
export const parseCurrentWeather = (data: OpenMeteoResponse): CurrentWeather => {
  const current = data.current;
  const weatherType = convertWeatherCode(current.weather_code);
  const now = new Date();
  const hour = now.getHours();

  // 雷の判定（天気コードが95以上）
  const hasThunder = current.weather_code >= 95;

  const workability = calculateWorkability({
    precipitation: current.precipitation,
    windSpeed: current.wind_speed_10m,
    hasThunder,
    hour,
  });

  return {
    temperature: current.temperature_2m,
    weatherType,
    workability,
    windSpeed: current.wind_speed_10m,
    windDirection: '北', // Open-Meteoから風向取得する場合は追加パラメータ必要
    precipitation: current.precipitation,
    humidity: current.relative_humidity_2m,
    hasThunder,
    visibility: 10, // Open-Meteoには視界データがないため固定値
    updatedAt: now,
  };
};

/**
 * レスポンスを時間別天気データに変換
 */
export const parseHourlyWeather = (data: OpenMeteoResponse): HourlyWeather[] => {
  const hourly = data.hourly;
  const result: HourlyWeather[] = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const time = new Date(hourly.time[i]);
    const hour = time.getHours();
    const weatherType = convertWeatherCode(hourly.weather_code[i]);
    const hasThunder = hourly.weather_code[i] >= 95;

    const workability = calculateWorkability({
      precipitation: hourly.precipitation[i],
      windSpeed: hourly.wind_speed_10m[i],
      hasThunder,
      hour,
    });

    result.push({
      time,
      temperature: hourly.temperature_2m[i],
      weatherType,
      workability,
      precipitation: hourly.precipitation[i],
      windSpeed: hourly.wind_speed_10m[i],
      humidity: hourly.relative_humidity_2m[i],
    });
  }

  return result;
};
```

---

## STEP 6: カスタムフック - 位置情報

### ファイル作成: `src/hooks/useLocation.ts`

```typescript
import { useState, useEffect } from 'react';
import { Location } from '../services/types';
import { DEFAULT_LOCATION } from '../utils/constants';

const STORAGE_KEY = 'sado-weather-location';

/**
 * 位置情報を管理するカスタムフック
 */
export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージから位置情報を読み込む
  useEffect(() => {
    const savedLocation = localStorage.getItem(STORAGE_KEY);
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
      setLoading(false);
    } else {
      // 保存された位置情報がなければ現在地を取得
      getCurrentLocation();
    }
  }, []);

  // 現在地を取得
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('位置情報がサポートされていません');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
        setLoading(false);
      },
      (error) => {
        console.error('位置情報取得エラー:', error);
        setError('位置情報の取得に失敗しました');
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      }
    );
  };

  // 手動で位置を設定
  const setManualLocation = (lat: number, lon: number) => {
    const newLocation: Location = {
      latitude: lat,
      longitude: lon,
    };
    setLocation(newLocation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    setManualLocation,
  };
};
```

---

## STEP 7: カスタムフック - 天気データ

### ファイル作成: `src/hooks/useWeatherData.ts`

```typescript
import { useState, useEffect } from 'react';
import { CurrentWeather, HourlyWeather, Location } from '../services/types';
import { fetchOpenMeteoData, parseCurrentWeather, parseHourlyWeather } from '../services/openMeteoApi';
import { UPDATE_INTERVALS } from '../utils/constants';

/**
 * 天気データを管理するカスタムフック
 */
export const useWeatherData = (location: Location | null) => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [hourlyWeather, setHourlyWeather] = useState<HourlyWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 天気データを取得
  const fetchWeatherData = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchOpenMeteoData(location);
      const current = parseCurrentWeather(data);
      const hourly = parseHourlyWeather(data);

      setCurrentWeather(current);
      setHourlyWeather(hourly);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('天気データ取得エラー:', err);
      setError('天気データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込みと位置変更時にデータ取得
  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  // 定期的に自動更新
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeatherData();
    }, UPDATE_INTERVALS.current);

    return () => clearInterval(interval);
  }, [location]);

  // 手動更新
  const refresh = () => {
    fetchWeatherData();
  };

  return {
    currentWeather,
    hourlyWeather,
    loading,
    error,
    lastUpdated,
    refresh,
  };
};
```

---

## STEP 8: CurrentWeatherコンポーネントの実装

### ファイル作成: `src/components/CurrentWeather/CurrentWeather.tsx`

```typescript
import React from 'react';
import { CurrentWeather as CurrentWeatherType } from '../../services/types';
import { WEATHER_ICONS, WORKABILITY_COLORS, WORKABILITY_LABELS } from '../../utils/constants';
import { formatTemperature, formatWindSpeed, formatPrecipitation, formatTime } from '../../utils/formatters';

interface Props {
  weather: CurrentWeatherType;
  onRefresh: () => void;
  loading: boolean;
}

export const CurrentWeather: React.FC<Props> = ({ weather, onRefresh, loading }) => {
  const workabilityColor = WORKABILITY_COLORS[weather.workability];
  const workabilityLabel = WORKABILITY_LABELS[weather.workability];
  const weatherIcon = WEATHER_ICONS[weather.weatherType];

  return (
    <div className="card">
      {/* 更新時刻とリフレッシュボタン */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          最終更新: {formatTime(weather.updatedAt)}
        </p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {loading ? '更新中...' : '🔄'}
        </button>
      </div>

      {/* 天気アイコンと気温 */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">{weatherIcon}</div>
        <div className="text-4xl font-bold">{formatTemperature(weather.temperature)}</div>
      </div>

      {/* 作業適性 */}
      <div className={`${workabilityColor} rounded-lg py-4 px-6 text-center mb-6`}>
        <div className="text-2xl font-bold">{workabilityLabel}</div>
      </div>

      {/* 詳細情報 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">雷</p>
          <p className="font-semibold">{weather.hasThunder ? 'あり ⚡' : 'なし'}</p>
        </div>
      </div>
    </div>
  );
};
```

### ファイル作成: `src/components/CurrentWeather/index.ts`
```typescript
export { CurrentWeather } from './CurrentWeather';
```

---

## STEP 9: Timelineコンポーネントの実装

### ファイル作成: `src/components/Timeline/Timeline.tsx`

```typescript
import React from 'react';
import { HourlyWeather } from '../../services/types';
import { WEATHER_ICONS, WORKABILITY_COLORS } from '../../utils/constants';
import { formatTime, formatTemperature } from '../../utils/formatters';

interface Props {
  hourlyData: HourlyWeather[];
}

export const Timeline: React.FC<Props> = ({ hourlyData }) => {
  // 今後24時間分のデータを表示
  const displayData = hourlyData.slice(0, 24);

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">📊 今日のタイムライン</h2>
      
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {displayData.map((hour, index) => {
            const workabilityColor = WORKABILITY_COLORS[hour.workability].replace('text-white', '');
            const weatherIcon = WEATHER_ICONS[hour.weatherType];
            
            return (
              <div
                key={index}
                className={`flex-shrink-0 w-16 text-center ${workabilityColor} rounded-lg p-2`}
              >
                <div className="text-xs text-white font-semibold mb-1">
                  {formatTime(hour.time)}
                </div>
                <div className="text-2xl mb-1">{weatherIcon}</div>
                <div className="text-sm text-white font-bold">
                  {formatTemperature(hour.temperature)}
                </div>
                <div className="text-xs text-white mt-1">
                  {hour.precipitation > 0 ? `${hour.precipitation.toFixed(1)}mm` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* グラフ表示（簡易版） */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">気温推移</h3>
        <div className="relative h-32 bg-gray-100 rounded-lg p-2">
          {/* ここに気温グラフを描画（SVGまたはCanvas） */}
          <svg width="100%" height="100%" className="text-blue-600">
            {displayData.map((hour, index) => {
              if (index === 0) return null;
              const prevHour = displayData[index - 1];
              
              // 簡易的な座標計算
              const x1 = ((index - 1) / displayData.length) * 100;
              const x2 = (index / displayData.length) * 100;
              const y1 = 100 - ((prevHour.temperature + 10) / 40) * 100;
              const y2 = 100 - ((hour.temperature + 10) / 40) * 100;
              
              return (
                <line
                  key={index}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
```

### ファイル作成: `src/components/Timeline/index.ts`
```typescript
export { Timeline } from './Timeline';
```

---

## STEP 10: WorkableHoursコンポーネントの実装

### ファイル作成: `src/components/WorkableHours/WorkableHours.tsx`

```typescript
import React from 'react';
import { HourlyWeather } from '../../services/types';
import { extractWorkableTimeSlots, calculateTotalWorkableHours } from '../../utils/workability';
import { formatTime } from '../../utils/formatters';

interface Props {
  hourlyData: HourlyWeather[];
}

export const WorkableHours: React.FC<Props> = ({ hourlyData }) => {
  // 作業可能時間帯を抽出（今日のみ、6-19時）
  const today = new Date();
  const todayData = hourlyData.filter(h => {
    const hour = h.time.getHours();
    return h.time.getDate() === today.getDate() && hour >= 6 && hour < 19;
  });

  const timeSlots = extractWorkableTimeSlots(todayData);
  const totalHours = calculateTotalWorkableHours(todayData);

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">💧 本日の作業可能時間</h2>
      
      {totalHours === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>本日は作業に適した時間帯がありません</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              作業可能時間: <span className="font-bold text-workable">合計 {totalHours}時間</span>
            </p>
          </div>

          <div className="space-y-3">
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-workable/10 border-l-4 border-workable rounded-lg p-3"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    🟢 {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {slot.durationHours}時間
                </div>
              </div>
            ))}
          </div>

          {/* 注意書き */}
          {timeSlots.length > 0 && (
            <div className="mt-4 text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
              ⚠️ 天気は急変する可能性があります。作業中も空模様に注意してください。
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

### ファイル作成: `src/components/WorkableHours/index.ts`
```typescript
export { WorkableHours } from './WorkableHours';
```

---

## STEP 11: AlertBannerコンポーネントの実装

### ファイル作成: `src/components/AlertBanner/AlertBanner.tsx`

```typescript
import React from 'react';
import { WeatherAlert } from '../../services/types';

interface Props {
  alerts: WeatherAlert[];
}

export const AlertBanner: React.FC<Props> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-800">⚠️ 注意報・警報: なし</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((alert) => {
        const bgColor = alert.type === 'warning' ? 'bg-red-100 border-red-500' : 'bg-yellow-100 border-yellow-500';
        const textColor = alert.type === 'warning' ? 'text-red-800' : 'text-yellow-800';
        
        return (
          <div
            key={alert.id}
            className={`${bgColor} border-l-4 rounded-lg p-3`}
          >
            <div className="flex items-start">
              <span className="text-2xl mr-2">
                {alert.type === 'warning' ? '🚨' : '⚠️'}
              </span>
              <div className="flex-1">
                <h3 className={`font-bold ${textColor}`}>
                  {alert.title}
                </h3>
                <p className={`text-sm ${textColor} mt-1`}>
                  {alert.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

### ファイル作成: `src/components/AlertBanner/index.ts`
```typescript
export { AlertBanner } from './AlertBanner';
```

---

## STEP 12: メインAppコンポーネントの実装

### ファイル編集: `src/App.tsx`

```typescript
import React from 'react';
import { useLocation } from './hooks/useLocation';
import { useWeatherData } from './hooks/useWeatherData';
import { CurrentWeather } from './components/CurrentWeather';
import { Timeline } from './components/Timeline';
import { WorkableHours } from './components/WorkableHours';
import { AlertBanner } from './components/AlertBanner';

function App() {
  const { location, loading: locationLoading, error: locationError } = useLocation();
  const { currentWeather, hourlyWeather, loading: weatherLoading, error: weatherError, refresh } = useWeatherData(location);

  // ローディング中
  if (locationLoading || (!currentWeather && weatherLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌤️</div>
          <p className="text-gray-600">天気データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (locationError || weatherError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600 mb-4">
              {locationError || weatherError}
            </p>
            <button
              onClick={refresh}
              className="btn-primary"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  // データがない場合
  if (!currentWeather) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              🌾 佐渡農作業天気
            </h1>
            <div className="text-sm text-gray-600">
              📍 佐渡市
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 警報・注意報バナー */}
        <AlertBanner alerts={[]} />

        {/* 現在の天気 */}
        <CurrentWeather
          weather={currentWeather}
          onRefresh={refresh}
          loading={weatherLoading}
        />

        {/* 作業可能時間帯 */}
        <WorkableHours hourlyData={hourlyWeather} />

        {/* タイムライン */}
        <Timeline hourlyData={hourlyWeather} />
      </main>

      {/* フッター */}
      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>データ提供: Open-Meteo</p>
        <p className="mt-1">天気は急変する可能性があります。作業中も空模様に注意してください。</p>
      </footer>
    </div>
  );
}

export default App;
```

---

## STEP 13: package.jsonの作成

### ファイル作成: `package.json`

```json
{
  "name": "sado-weather-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "description": "佐渡ヶ島の農作業者向け天気予報アプリ",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/node": "^20.10.5",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "prettier": "^3.1.1",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

---

## STEP 14: TypeScript設定

### ファイル作成: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### ファイル作成: `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## STEP 15: Vite設定

### ファイル作成: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

---

## STEP 16: .cursorrulesファイルの作成（次のアーティファクトで出力）

次のアーティファクトに続きます...-gray-500">風速</p>
          <p className="font-semibold">{formatWindSpeed(weather.windSpeed)}</p>
        </div>
        <div>
          <p className="text-gray-500">降水量</p>
          <p className="font-semibold">{formatPrecipitation(weather.precipitation)}</p>
        </div>
        <div>
          <p className="text-gray-500">湿度</p>
          <p className="font-semibold">{weather.humidity}%</p>
        </div>
        <div>
          <p className="text