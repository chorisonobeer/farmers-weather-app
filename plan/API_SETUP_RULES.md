# API/Backend 設定ルールと手順

## 総則
- すべての秘密情報は `.env` に保存し、Git追跡から除外（`.gitignore`適用）。
- クライアントに露出させてよいのは「公開キー」のみ。サービスロール等はサーバ側のみ。
- 取得・設定に関する手順は本ドキュメントに一元管理し、遵守する。

## 天気API（現行）
- Open-Meteo: キー不要。
- 気象庁（JMA）: キー不要（非公式）。
- 将来他API採用時は、本ドキュメントに「取得→環境変数→利用箇所」を追記。

## Supabase 設定（採用）
1. プロジェクト作成
   - https://supabase.com に登録→New project→Organization/Projectを作成
2. プロジェクト情報取得
   - `Project URL`（`https://xxxxx.supabase.co`）
   - `Anon key`（公開キー）
   - `Service role key`（サーバ用秘密キー）
3. `.env` へ設定（ローカル）
   - `VITE_SUPABASE_URL=https://xxxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=xxxxxxxxx`
   - サーバ側（Edge Functions）では `SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxx`
4. データベース初期化
   - テーブル: `users`, `preferences`, `locations`, `push_subscriptions`, `weather_snapshots`, `alerts_log`
   - RLS（Row Level Security）を有効化し、ユーザ毎に隔離
5. SDK 初期化
   - フロント: `@supabase/supabase-js` を使用し `VITE_*` 環境変数で初期化
6. Edge Functions
   - Web Push送信の関数を作成（Deno）。`SUPABASE_SERVICE_ROLE_KEY`でDBアクセス。

## Web Push（VAPID）設定（Supabase採用時）
1. VAPID鍵生成
   - ライブラリ（例: `web-push`）で公開鍵/秘密鍵ペア生成
2. 保存
   - 公開鍵: フロントで利用（通知購読に必要）→ `.env` に `VITE_VAPID_PUBLIC_KEY`
   - 秘密鍵: Edge Functions側の環境変数 `VAPID_PRIVATE_KEY`
3. 購読フロー
   - Service Worker登録→`pushManager.subscribe`→`push_subscriptions`テーブルに保存
4. 送信フロー
   - Edge Functionが購読情報を取得→Web Pushを送信

## Firebase（代替案）
- FCMでWeb Pushを利用する場合の手順
  1. Firebase Consoleでプロジェクト作成
  2. Webアプリ追加→`firebaseConfig`取得→`.env`に保存
  3. FCM用の公開鍵（VAPID）設定→通知購読→トークン管理
  4. Cloud Functionsでメッセージ送信
- 採用切替時は、本ドキュメントの Supabase 節をアーカイブし、Firebase節を主にする。

## 位置情報（GPS）
- ブラウザのGeolocation APIを使用
- 許可拒否時はデフォルト位置（佐渡市）にフォールバック
- ユーザー選好の位置は `preferences/locations` へ保存

## ダーク/ライトテーマ
- Tailwindの`dark`クラスで切替。選好は `localStorage` に保存
- 初回は`prefers-color-scheme`で判定

## 運用ポリシー
- 変更時はPRで本ドキュメント更新→レビュー→適用
- 環境変数の命名は `VITE_*`（フロント）と無印（サーバ）で区別
