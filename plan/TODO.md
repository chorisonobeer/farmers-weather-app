# 作成フロー TODO と 実行ルール

## 実行ルール（Self-Execution Rules）
- 1タスクずつ着手（同時進行しない）。完了したら即マーク。
- `.cursorrules` と `/Docs` の指針に厳密準拠（TS strict, A11y, Perf）。
- コードは必要時のみ生成し、既存パターンを厳守。秘密情報は扱わない。
- Conventional Commitsでコミット、`feature/*` ブランチ駆動、PRベース。
- 検証を伴わない変更は行わない（dev起動や簡易テストで確認）。
- 仕様不明点は保守的に実装し、後で調整可能な構成にする。

### 進捗更新ルール
- すべての作業開始/完了時に本ファイルのチェックボックスを更新する。
- 常に1つの「着手中」タスクのみを維持し、見える化する。
- 検証まで終わったもののみ完了扱いにする。

---

## フェーズ1: 基本セットアップ（STEP 1-5）
- [x] Initialize Vite React-TS project with Bun
- [x] Install Tailwind CSS and configure custom colors
- [x] Add ESLint and Prettier configuration
- [x] Set TypeScript strict options in tsconfig
- [x] Verify dev server runs on `http://localhost:3000`

### 追加（UI/UX）
- [x] Implement dark/light theme toggle with Tailwind `dark`

## フェーズ2: 型とユーティリティ（STEP 2-4）
- [x] Define core types in `services/types.ts`
- [x] Implement thresholds and maps in `utils/constants.ts`
- [x] Implement format helpers in `utils/formatters.ts`
- [x] Implement workability logic in `utils/workability.ts`

## フェーズ3: API通信層（STEP 5）
- [x] Implement Open-Meteo fetch function
- [x] Implement `parseCurrentWeather` and `parseHourlyWeather`
- [x] Add error handling and set timezone to Asia/Tokyo

## フェーズ4: カスタムフック（STEP 6-7）
- [x] Implement `useLocation` with Geolocation and LocalStorage
- [x] Implement `useWeatherData` with auto and manual refresh

---

## 進捗サマリ
- 完了: フェーズ2（型/ユーティリティ）、フェーズ3（API層）、フェーズ4（フック）
- 次の着手: フェーズ5（コンポーネント実装）

## フェーズ5: コンポーネント（STEP 8-11）
- [x] Implement `CurrentWeather` component
- [x] Implement `WorkableHours` component
- [x] Implement `Timeline` component with simple graph
- [x] Implement `AlertBanner` component (placeholder)

## フェーズ6: 統合（STEP 12）
- [x] Integrate components in `App.tsx` layout
- [x] Ensure Tailwind styles and responsive behavior

## フェーズ7: 検証
- [x] Run dev and verify data fetching flows
- [x] Validate workability thresholds and display
- [x] Check accessibility: contrast, font size, tap targets
 - [x] Verify geolocation fallback to default location

## フェーズ8: バックエンド（Supabase）
- [x] Initialize Supabase project and keys (.env)
- [x] Create tables (`users`, `preferences`, `locations`, `push_subscriptions`, `weather_snapshots`, `alerts_log`)
- [x] Enable RLS and basic policies
- [x] Implement Edge Function for Web Push sending
- [x] Integrate Supabase Auth in frontend (env未設定時は案内表示)

## フェーズ9: 認証/有料化の基盤
- [x] Implement email/password login UI
- [x] Persist session and guard protected routes
- [x] Prepare Stripe integration (future placeholder)

## フェーズ10: プッシュ通知
- [ ] Generate VAPID keys and configure
- [x] Register Service Worker and subscribe users（UI/コード実装済・鍵設定後に検証）
- [ ] Save subscriptions and send test notifications（鍵設定後に検証）

## フェーズ11: データ保存・履歴
- [ ] Persist user preferences (theme, notifications, time window)
- [ ] Save locations and default choice
- [ ] Snapshot hourly forecast (daily) for history
- [ ] Log sent alerts and notification events

## フェーズ12: デプロイ準備（将来）
- [ ] Set up CI for lint, test, build
- [ ] Configure hosting (Vercel/Netlify/GitHub Pages)

---

## 受け入れ基準（MVP）
- 天気取得・表示が10分ごとに自動更新、手動更新も可能。
- 作業適性が要件基準で一貫判定・表示。
- 24時間タイムラインと作業可能時間帯抽出が正しく機能。
- 屋外視認性（高コントラスト/大きな文字）を満たす。
