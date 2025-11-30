# 佐渡農作業天気アプリ 作成プラン

## 目的と前提
- 目的: 「今、作業できるか？」を3秒で判断できるReact+TypeScript製SPAを短期でMVP→改善版→完成版へ段階的に構築する。
- 前提: バックエンドなし。外部API（Open-Meteoを主、JMAは将来）を直接利用。無料で運用可能な静的ホスティング（Vercel推奨）。
- 参考資料: `/Docs/requirements_md.md` `/Docs/architecture_md.md` `/Docs/implementation_guide_md.md` `/Docs/api_specification_md.md` `/Docs/sado_weather_app_concept.md`。

## リポジトリ設定（今回適用）
- `.gitignore` をDocsの定義に基づき作成（Node/Bun/TS/Vite/Tailwind/環境ファイル/ビルド出力/IDEファイルなどを除外）。
- `.cursorrules` をDocsのCursor開発ルールに基づき作成（型安全、ディレクトリ構造、フック/API/ユーティリティ方針、アクセシビリティ/パフォーマンス基準）。

## 技術スタックと方針
- フロント: `React 18 + TypeScript + Vite + Tailwind CSS`
- パッケージ管理: `Bun`（推奨）
- データソース: `Open-Meteo`（現行）、`JMA`（警報・注意報/将来）、`ナウキャスト`（将来）
- 状態: カスタムフック中心（`useLocation` `useWeatherData`）、LocalStorageで位置情報を永続化
- セキュリティ: HTTPS前提、APIキー不要、環境変数は現時点不要
- 品質: ESLint+Prettier、型strict、アクセシビリティ配慮、Lighthouseでパフォーマンス確認

## 画面／機能ブロック
- ヒーロー（現在天気＋作業適性）
- アラートバナー（警報・注意報）
- 作業可能時間帯（抽出と合計）
- タイムライン（24h/横スクロール、簡易グラフ）
- 将来: 雨雲レーダー、通知、PWA、週間予報、詳細グラフ

## 作成フロー（MVP中心）
1. 初期セットアップ
   - Vite React-TSテンプレートで初期化（Bun推奨）。
   - Tailwind導入とカスタムカラー（workable/caution/unsuitable/night）。
   - ESLint/Prettier/TS strict設定。
2. 型とユーティリティ
   - `services/types.ts` に主要型（Current/Hourly/Workability/Alert/Location等）。
   - `utils/constants.ts`・`utils/formatters.ts`・`utils/workability.ts` 実装。
3. API層
   - `services/openMeteoApi.ts` に取得とパース関数（Current/Hourly）。
   - エラーハンドリング・タイムゾーン`Asia/Tokyo`統一。
4. フック
   - `useLocation`（Geolocation+LocalStorageフォールバック）。
   - `useWeatherData`（初回/定期/手動更新、10分間隔、エラー管理）。
5. コンポーネント
   - `CurrentWeather`（更新時刻、作業適性、大型表示）。
   - `WorkableHours`（抽出・合計・注意書き）。
   - `Timeline`（24hカード＋簡易グラフ）。
   - `AlertBanner`（ダミー→後にJMA連携）。
6. 統合
   - `App.tsx` でLocation/Weather統合、レイアウト構築（ヘッダー/メイン/フッター）。
7. 動作確認
   - `bun run dev` 起動、佐渡座標での取得確認、主要画面の視認性・操作性確認。

## マイルストーン
- フェーズ1: MVP（3週間）
  - 現在天気、タイムライン、作業可能時間、警報表示（ダミー）、位置情報
  - KPI: 実地ユーザーに使ってもらいフィードバック取得
- フェーズ1.5: 改善版（+2週間）
  - 雨雲レーダー、通知、PWA
  - KPI: 日常利用レベル到達（読み込み3秒以内）
- フェーズ2: 完成版（+1ヶ月）
  - 週間予報、詳細グラフ、設定充実
  - KPI: 公開と広報開始

## 開発規約（要約）
- TypeScript strict、`any`禁止、戻り値型必須。
- 関数コンポーネント＋フック。`Props Down, Events Up`。単一責務原則。
- データはAPI層→パース→ビジネスロジック→表示用の流れに統一。
- スタイリングはTailwind中心、モバイルファースト、高コントラスト。
- アクセシビリティ（色＋アイコン＋テキスト）、タップ44x44、スクリーンリーダー配慮。
- パフォーマンス（メモ化、遅延読み込み、不要再レンダリング抑制）。

## Git運用（軽量）
- ブランチ: `main`（安定）/ `feature/*`（機能）/ `fix/*`（修正）。
- コミット: Conventional Commits（`feat:`, `fix:`, `refactor:`, `chore:`）。
- PRベース、レビュー最小1名（自己レビュー→PR）。

## CI/CD（将来拡張）
- GitHub Actionsで `lint → test → build`。
- Vercel/Netlify/GitHub Pagesのいずれかで自動デプロイ（`main`にpush）。

## リスクと対策
- 気象庁API非公式: 仕様変更→Open-Meteoへの切替/フォールバック。
- 通信弱い地域: オフラインキャッシュ（PWA）で緩和。
- 精度限界: 予報は参考/注意書き明記、ユーザー検証ループ。

## 受け入れ基準（MVP）
- 天気取得・表示が10分おきに自動更新し、手動更新も可能。
- 作業適性が要件の基準で一貫して判定・表示される。
- 24時間タイムラインと作業可能時間帯抽出が正しく機能する。
- 屋外視認性（高コントラスト/大きな文字）を満たす。

## 次アクション（実装開始）
- Vite React-TSテンプレート初期化、Tailwind設定、型/ユーティリティ/API層/フック/コンポーネントの順で実装。
- 実装ガイド `/Docs/implementation_guide_md.md` のSTEP1〜12に沿って進行。

