# アーキテクチャ設計書 - 佐渡農作業天気アプリ

## システム概要

### アーキテクチャパターン
**フロントエンドのみのSPA（Single Page Application）**

- バックエンドなし
- 外部APIから直接データ取得
- 静的ホスティング可能

---

## 技術スタック

### コア技術
| 技術 | バージョン | 用途 |
|------|----------|------|
| React | 18.2+ | UIライブラリ |
| TypeScript | 5.2+ | 型安全な開発 |
| Vite | 5.0+ | ビルドツール |
| Tailwind CSS | 3.3+ | スタイリング |
| Bun | 最新 | パッケージマネージャ・ランタイム |

### 開発ツール
| ツール | 用途 |
|--------|------|
| ESLint | コード品質チェック |
| Prettier | コードフォーマット |
| TypeScript | 静的型チェック |

---

## アプリケーションアーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Components / UI)                │
│  ┌─────────────┐  ┌─────────────┐  │
│  │CurrentWeather│  │  Timeline   │  │
│  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  │
│  │WorkableHours │  │ AlertBanner │  │
│  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│        Application Layer            │
│         (Hooks / State)             │
│  ┌──────────────────────────────┐  │
│  │   useWeatherData             │  │
│  │   useLocation                │  │
│  │   useNotification            │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│         Service Layer               │
│      (API / Business Logic)         │
│  ┌──────────────────────────────┐  │
│  │   openMeteoApi.ts            │  │
│  │   jmaApi.ts (future)         │  │
│  │   workability.ts             │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│         External APIs               │
│  ┌──────────────────────────────┐  │
│  │   Open-Meteo API             │  │
│  │   気象庁API (future)          │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## データフロー

### 1. 初期読み込み

```
User Action
    ↓
App.tsx (mount)
    ↓
useLocation() ────→ Geolocation API
    ↓                    ↓
    ↓              [lat, lon]
    ↓                    ↓
    └──────→ useWeatherData(location)
                    ↓
            openMeteoApi.fetchData()
                    ↓
            Open-Meteo API
                    ↓
            [Weather Data]
                    ↓
            parseCurrentWeather()
            parseHourlyWeather()
                    ↓
            [Formatted Data]
                    ↓
            React State Update
                    ↓
            Components Re-render
                    ↓
            Display to User
```

### 2. 定期更新

```
setInterval (10分)
    ↓
useWeatherData.refresh()
    ↓
openMeteoApi.fetchData()
    ↓
Open-Meteo API
    ↓
[Updated Data]
    ↓
React State Update
    ↓
Components Re-render
```

### 3. 手動更新

```
User Click (Refresh Button)
    ↓
onRefresh()
    ↓
useWeatherData.refresh()
    ↓
[Loading State = true]
    ↓
openMeteoApi.fetchData()
    ↓
Open-Meteo API
    ↓
[Updated Data]
    ↓
[Loading State = false]
    ↓
React State Update
    ↓
Components Re-render
```

---

## 状態管理

### 状態の種類

#### 1. ローカル状態（useState）
- コンポーネント内のUI状態
- 一時的な表示制御

#### 2. カスタムフック状態
- 天気データ（`useWeatherData`）
- 位置情報（`useLocation`）
- 通知設定（`useNotification`）

#### 3. ブラウザストレージ
- LocalStorage: 位置情報の永続化
- SessionStorage: なし（使用しない）

### 状態管理の原則

```typescript
// ✅ Good: カスタムフックで状態管理
const { weather, loading, error } = useWeatherData(location);

// ❌ Bad: Appコンポーネントで直接fetch
useEffect(() => {
  fetch(url).then(...)
}, []);
```

---

## コンポーネント設計

### コンポーネント階層

```
App
├── Header
│   └── LocationDisplay
├── AlertBanner
├── CurrentWeather
│   ├── WeatherIcon
│   ├── Temperature
│   ├── WorkabilityBadge
│   └── WeatherDetails
├── WorkableHours
│   └── TimeSlot[]
├── Timeline
│   ├── HourlyCard[]
│   └── TemperatureGraph
├── DetailedData (future)
│   ├── PrecipitationGraph
│   ├── WindSpeedGraph
│   └── HumidityGraph
├── WeeklyForecast (future)
│   └── DayCard[]
└── Footer
```

### コンポーネント設計原則

#### 1. Single Responsibility
各コンポーネントは1つの責務のみ持つ

```typescript
// ✅ Good
const WeatherIcon: React.FC<{ type: WeatherType }> = ({ type }) => {
  return <span>{WEATHER_ICONS[type]}</span>;
};

// ❌ Bad: 複数の責務
const WeatherDisplay = () => {
  // 天気取得 + 表示 + 判定ロジック
};
```

#### 2. Props Down, Events Up
- データは親から子へ（Props）
- イベントは子から親へ（Callback）

```typescript
// Parent
const [weather, setWeather] = useState<CurrentWeather>();
<CurrentWeather weather={weather} onRefresh={handleRefresh} />

// Child
interface Props {
  weather: CurrentWeather;
  onRefresh: () => void;
}
```

#### 3. Composition over Inheritance
- コンポーネントの合成を優先
- 継承は使用しない

---

## API設計

### API層の責務

1. **HTTPリクエストの実行**
2. **レスポンスのパース**
3. **エラーハンドリング**
4. **型変換**

### API関数の構造

```typescript
// 1. データ取得関数
export const fetchOpenMeteoData = async (
  location: Location
): Promise<OpenMeteoResponse> => {
  // HTTPリクエスト実行
};

// 2. パース関数
export const parseCurrentWeather = (
  data: OpenMeteoResponse
): CurrentWeather => {
  // レスポンスをアプリ内の型に変換
};

// 3. 統合関数（フック内で使用）
const getWeatherData = async (location: Location) => {
  const raw = await fetchOpenMeteoData(location);
  const current = parseCurrentWeather(raw);
  const hourly = parseHourlyWeather(raw);
  return { current, hourly };
};
```

---

## ビジネスロジック

### 作業適性判定

```typescript
// 入力
interface WorkabilityParams {
  precipitation: number;
  windSpeed: number;
  hasThunder: boolean;
  hour: number;
}

// 処理
1. 夜間チェック（19-6時）
2. 雷チェック
3. 降水量・風速チェック
4. 適性判定

// 出力
type Workability = 'suitable' | 'caution' | 'unsuitable' | 'night';
```

### データ変換フロー

```
API Response (外部形式)
    ↓
Parse関数
    ↓
内部型 (CurrentWeather, HourlyWeather)
    ↓
ビジネスロジック (作業適性判定)
    ↓
表示用データ
    ↓
Component (表示)
```

---

## ファイル構成の詳細

### src/components/
```
components/
├── CurrentWeather/
│   ├── CurrentWeather.tsx    # メインコンポーネント
│   ├── index.ts              # エクスポート
│   └── CurrentWeather.test.tsx (future)
├── Timeline/
│   ├── Timeline.tsx
│   ├── HourlyCard.tsx        # 時間別カード
│   └── index.ts
├── WorkableHours/
│   ├── WorkableHours.tsx
│   ├── TimeSlot.tsx          # 時間帯カード
│   └── index.ts
└── AlertBanner/
    ├── AlertBanner.tsx
    └── index.ts
```

### src/hooks/
```
hooks/
├── useWeatherData.ts         # 天気データ管理
├── useLocation.ts            # 位置情報管理
└── useNotification.ts (future)  # 通知管理
```

### src/services/
```
services/
├── types.ts                  # 型定義
├── openMeteoApi.ts           # Open-Meteo API
└── jmaApi.ts (future)        # 気象庁API
```

### src/utils/
```
utils/
├── constants.ts              # 定数定義
├── formatters.ts             # フォーマット関数
└── workability.ts            # 作業適性判定
```

---

## パフォーマンス最適化

### 1. メモ化

```typescript
// コンポーネントのメモ化
export const Timeline = React.memo<Props>(({ hourlyData }) => {
  // ...
});

// 計算のメモ化
const workableSlots = useMemo(
  () => extractWorkableTimeSlots(hourlyData),
  [hourlyData]
);
```

### 2. 遅延読み込み

```typescript
// コード分割
const DetailedData = lazy(() => import('./components/DetailedData'));

<Suspense fallback={<Loading />}>
  <DetailedData data={weather} />
</Suspense>
```

### 3. 仮想スクロール（将来実装）

大量のデータを扱う場合は`react-window`を検討

---

## セキュリティ

### 1. XSS対策
- Reactのデフォルトのエスケープ機能を活用
- `dangerouslySetInnerHTML`は使用しない

### 2. データ検証
- API レスポンスは必ず検証
- 不正なデータは除外

```typescript
const validateWeatherData = (data: any): boolean => {
  return (
    typeof data.temperature === 'number' &&
    data.temperature >= -50 &&
    data.temperature <= 50
  );
};
```

### 3. HTTPS通信
- すべてのAPI通信はHTTPS
- 本番環境もHTTPSで配信

---

## エラーハンドリング

### エラーの種類と対応

| エラー種類 | 原因 | 対応 |
|-----------|------|------|
| ネットワークエラー | 接続不可 | リトライ促進 |
| APIエラー | サーバー障害 | フォールバック表示 |
| 位置情報エラー | 許可拒否 | デフォルト位置使用 |
| データ不整合 | パース失敗 | エラー表示 |

### エラーバウンダリ（将来実装）

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // エラーログ送信
    console.error(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## テスト戦略（将来実装）

### 1. ユニットテスト
- `utils/`の関数
- ビジネスロジック

```typescript
describe('calculateWorkability', () => {
  it('should return suitable for good conditions', () => {
    const result = calculateWorkability({
      precipitation: 0,
      windSpeed: 5,
      hasThunder: false,
      hour: 10,
    });
    expect(result).toBe('suitable');
  });
});
```

### 2. 統合テスト
- API通信
- フックの動作

### 3. E2Eテスト
- ユーザーシナリオ
- クリティカルパス

---

## デプロイメント

### ビルド

```bash
bun run build
```

出力: `dist/`ディレクトリ

### ホスティング候補

1. **Vercel**（推奨）
   - 無料プラン
   - 自動デプロイ
   - HTTPS標準

2. **Netlify**
   - 無料プラン
   - フォーム機能

3. **GitHub Pages**
   - 無料
   - 簡単デプロイ

### CI/CD（将来実装）

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 監視とロギング（将来実装）

### 1. エラー監視
- Sentry等のエラートラッキングツール

### 2. アナリティクス
- Google Analytics
- ユーザー行動分析

### 3. パフォーマンス監視
- Lighthouse CI
- Web Vitals

---

## スケーラビリティ

### 水平スケーリング
- 静的ファイル配信のため、CDNで容易にスケール
- APIは外部サービス（Open-Meteo）に依存

### データ量増加への対応
- ページネーション
- 仮想スクロール
- データの遅延読み込み

---

## 保守性

### コードレビュー
- PRベースの開発
- レビュー必須

### ドキュメント
- コードコメント
- README.md
- アーキテクチャ図

### バージョン管理
- Semantic Versioning
- CHANGELOG.md

---

## 将来の拡張

### フェーズ2
1. 雨雲レーダー機能
2. 通知機能の実装
3. PWA対応
4. 週間予報詳細

### フェーズ3
1. 農作業メモ機能
2. コミュニティ機能
3. 音声読み上げ
4. ウィジェット

---

## 参考資料

- React公式ドキュメント: https://react.dev/
- TypeScript公式ドキュメント: https://www.typescriptlang.org/
- Tailwind CSS: https://tailwindcss.com/
- Vite: https://vitejs.dev/