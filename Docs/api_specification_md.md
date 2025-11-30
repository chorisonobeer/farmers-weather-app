# API仕様書 - 佐渡農作業天気アプリ

## 概要
このアプリケーションは以下のAPIを使用して天気データを取得します。

---

## 1. Open-Meteo API（メイン）

### 基本情報
- **ベースURL**: `https://api.open-meteo.com/v1/forecast`
- **認証**: 不要（APIキー不要）
- **料金**: 無料
- **レート制限**: 10,000リクエスト/日（非商用）
- **ドキュメント**: https://open-meteo.com/en/docs

### 使用目的
- 現在の天気データ取得
- 時間別予報（72時間）
- 日別予報（16日間）

---

### エンドポイント: 天気予報取得

#### リクエスト

**メソッド**: GET

**URL**:
```
https://api.open-meteo.com/v1/forecast
```

**パラメータ**:

| パラメータ名 | 型 | 必須 | 説明 | 例 |
|------------|------|------|------|-----|
| `latitude` | float | ✓ | 緯度 | `38.0183` |
| `longitude` | float | ✓ | 経度 | `138.3683` |
| `hourly` | string | - | 時間別データ項目（カンマ区切り） | `temperature_2m,precipitation` |
| `current` | string | - | 現在データ項目（カンマ区切り） | `temperature_2m,precipitation` |
| `daily` | string | - | 日別データ項目（カンマ区切り） | `temperature_2m_max,temperature_2m_min` |
| `timezone` | string | - | タイムゾーン | `Asia/Tokyo` |
| `forecast_days` | integer | - | 予報日数（1-16） | `3` |

**hourlyパラメータで取得可能なデータ**:
- `temperature_2m`: 地上2mの気温（℃）
- `precipitation`: 降水量（mm）
- `wind_speed_10m`: 地上10mの風速（m/s）
- `wind_direction_10m`: 風向（度）
- `relative_humidity_2m`: 相対湿度（%）
- `weather_code`: 天気コード
- `cloud_cover`: 雲量（%）
- `visibility`: 視界（m）

**currentパラメータで取得可能なデータ**:
- hourlyと同じ項目

**dailyパラメータで取得可能なデータ**:
- `temperature_2m_max`: 最高気温（℃）
- `temperature_2m_min`: 最低気温（℃）
- `precipitation_sum`: 総降水量（mm）
- `precipitation_probability_max`: 最大降水確率（%）
- `weather_code`: 天気コード

#### リクエスト例

```bash
curl "https://api.open-meteo.com/v1/forecast?\
latitude=38.0183&\
longitude=138.3683&\
hourly=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code&\
current=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code&\
timezone=Asia/Tokyo&\
forecast_days=3"
```

#### レスポンス例

```json
{
  "latitude": 38.01,
  "longitude": 138.37,
  "generationtime_ms": 0.123,
  "utc_offset_seconds": 32400,
  "timezone": "Asia/Tokyo",
  "timezone_abbreviation": "JST",
  "elevation": 5.0,
  "current_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "precipitation": "mm",
    "wind_speed_10m": "m/s",
    "relative_humidity_2m": "%",
    "weather_code": "wmo code"
  },
  "current": {
    "time": "2025-01-15T14:00",
    "temperature_2m": 5.2,
    "precipitation": 0.0,
    "wind_speed_10m": 8.5,
    "relative_humidity_2m": 65,
    "weather_code": 2
  },
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "precipitation": "mm",
    "wind_speed_10m": "m/s",
    "relative_humidity_2m": "%",
    "weather_code": "wmo code"
  },
  "hourly": {
    "time": [
      "2025-01-15T00:00",
      "2025-01-15T01:00",
      "2025-01-15T02:00"
    ],
    "temperature_2m": [3.5, 3.2, 3.0],
    "precipitation": [0.0, 0.0, 0.1],
    "wind_speed_10m": [5.2, 5.8, 6.1],
    "relative_humidity_2m": [70, 72, 75],
    "weather_code": [1, 2, 61]
  }
}
```

#### 天気コード（WMO Weather Interpretation Codes）

| コード | 説明 | アプリ内表示 |
|--------|------|-------------|
| 0 | Clear sky | ☀️ 晴れ |
| 1 | Mainly clear | ☀️ 晴れ |
| 2 | Partly cloudy | ☁️ 曇り |
| 3 | Overcast | ☁️ 曇り |
| 45, 48 | Fog | ☁️ 霧 |
| 51, 53, 55 | Drizzle | 🌧️ 小雨 |
| 61, 63, 65 | Rain | 🌧️ 雨 |
| 71, 73, 75 | Snow | ❄️ 雪 |
| 80, 81, 82 | Rain showers | 🌧️ にわか雨 |
| 85, 86 | Snow showers | ❄️ にわか雪 |
| 95, 96, 99 | Thunderstorm | ⛈️ 雷雨 |

#### エラーレスポンス

```json
{
  "error": true,
  "reason": "Cannot initialize WeatherVariable from invalid String value sunny for key hourly"
}
```

**主なエラー**:
- 400 Bad Request: 無効なパラメータ
- 429 Too Many Requests: レート制限超過
- 500 Internal Server Error: サーバーエラー

---

## 2. 気象庁API（補助・将来実装予定）

### 基本情報
- **ベースURL**: `https://www.jma.go.jp/bosai/forecast/data/`
- **認証**: 不要
- **料金**: 無料
- **注意**: 非公式API（仕様変更の可能性あり）

### 使用目的
- 日本国内の高精度予報
- 警報・注意報の取得
- 降水確率データ

---

### エンドポイント: 地域予報取得

#### リクエスト

**URL**:
```
https://www.jma.go.jp/bosai/forecast/data/forecast/{areaCode}.json
```

**パラメータ**:
- `areaCode`: 地域コード（佐渡市: `150010`）

#### リクエスト例

```bash
curl "https://www.jma.go.jp/bosai/forecast/data/forecast/150010.json"
```

#### レスポンス例（簡略版）

```json
[
  {
    "publishingOffice": "新潟地方気象台",
    "reportDatetime": "2025-01-15T11:00:00+09:00",
    "timeSeries": [
      {
        "timeDefines": [
          "2025-01-15T11:00:00+09:00",
          "2025-01-16T00:00:00+09:00",
          "2025-01-17T00:00:00+09:00"
        ],
        "areas": [
          {
            "area": {
              "name": "佐渡",
              "code": "150010"
            },
            "weatherCodes": ["202", "201", "101"],
            "weathers": ["曇り時々雨", "曇り時々晴れ", "晴れ"],
            "winds": ["北の風やや強く", "北の風", "北の風"],
            "waves": ["2.5メートルうねりを伴う", "2メートル", "1.5メートル"]
          }
        ]
      },
      {
        "timeDefines": [
          "2025-01-15T00:00:00+09:00",
          "2025-01-15T06:00:00+09:00"
        ],
        "areas": [
          {
            "area": {
              "name": "佐渡",
              "code": "150010"
            },
            "pops": ["40", "20"]
          }
        ]
      }
    ]
  }
]
```

---

### エンドポイント: 警報・注意報取得

#### リクエスト

**URL**:
```
https://www.jma.go.jp/bosai/warning/data/warning/{areaCode}.json
```

**パラメータ**:
- `areaCode`: 地域コード（新潟県: `15`）

#### レスポンス例（簡略版）

```json
{
  "areaTypes": [
    {
      "areas": [
        {
          "code": "150010",
          "name": "佐渡",
          "warnings": [
            {
              "code": "03",
              "name": "大雨注意報",
              "status": "発表"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 3. 気象庁 高解像度降水ナウキャスト（将来実装予定）

### 基本情報
- **ベースURL**: `https://www.jma.go.jp/bosai/jmatile/data/nowc/`
- **認証**: 不要
- **更新頻度**: 5分ごと

### 使用目的
- 1時間先までの雨雲の動き
- 高解像度（250m四方）の降水データ

---

## データ取得フロー

### 初回読み込み時
```
1. 位置情報を取得（Geolocation API）
2. Open-Meteo APIで天気データ取得
   - current: 現在の天気
   - hourly: 72時間分の予報
3. データをパースして状態に保存
4. UIに表示
```

### 定期更新
```
1. 10分ごとに自動更新
2. Open-Meteo APIを再度呼び出し
3. 新しいデータで状態を更新
4. UIを再レンダリング
```

### 手動更新
```
1. ユーザーがリフレッシュボタンをタップ
2. 即座にAPIを呼び出し
3. ローディング表示
4. データ取得後、UIを更新
```

---

## エラーハンドリング

### APIエラー時の対応

```typescript
try {
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 429) {
      // レート制限
      throw new Error('APIの呼び出し制限に達しました。しばらくしてから再試行してください。');
    } else if (response.status >= 500) {
      // サーバーエラー
      throw new Error('サーバーエラーが発生しました。後ほど再試行してください。');
    } else {
      throw new Error('天気データの取得に失敗しました。');
    }
  }
  
  const data = await response.json();
  return data;
  
} catch (error) {
  if (error instanceof TypeError) {
    // ネットワークエラー
    throw new Error('ネットワーク接続を確認してください。');
  }
  throw error;
}
```

---

## キャッシング戦略

### LocalStorageでのキャッシュ

```typescript
// データ取得時
const fetchWithCache = async (url: string, cacheKey: string, maxAge: number) => {
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    if (age < maxAge) {
      return data; // キャッシュを返す
    }
  }
  
  // 新しいデータを取得
  const response = await fetch(url);
  const data = await response.json();
  
  // キャッシュに保存
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
};
```

---

## 実装時の注意事項

### 1. レート制限の遵守
- Open-Meteo: 1日10,000リクエスト
- 不要な呼び出しを避ける
- キャッシュを活用

### 2. エラー処理
- すべてのAPI呼び出しにtry-catchを使用
- ユーザーにわかりやすいエラーメッセージを表示
- フォールバック処理を実装

### 3. データ変換
- APIレスポンスは必ずアプリ内の型に変換
- 不正なデータはフィルタリング
- デフォルト値を設定

### 4. タイムゾーン
- すべての日時は`Asia/Tokyo`で統一
- Date型で扱い、表示時にフォーマット

### 5. パフォーマンス
- 不要なデータは取得しない
- 必要最小限のパラメータで呼び出し
- 並列リクエストを避ける

---

## テスト用データ

### 佐渡市の座標
```
緯度: 38.0183
経度: 138.3683
```

### テスト用URL
```
https://api.open-meteo.com/v1/forecast?latitude=38.0183&longitude=138.3683&hourly=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code&current=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code&timezone=Asia/Tokyo&forecast_days=3
```

---

## 参考リンク

- Open-Meteo ドキュメント: https://open-meteo.com/en/docs
- 気象庁 天気予報: https://www.jma.go.jp/jma/kishou/know/yougo_hp/tenki.html
- WMO Weather Codes: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM