# Supabase vs Firebase 比較検証（本プロジェクト前提）

## 前提
- フロント: React+TS SPA、静的ホスティング
- 機能: 認証、データ永続化、プッシュ通知、将来有料化
- コスト: 無料枠重視

## 概観
- Supabase: OSS/Postgresベース。Auth/DB/Storage/Edge Functions（Deno）。RLS/SQLが強み。
- Firebase: Google提供。Auth/Firestore/Storage/Cloud Functions/FCM。Web Push（FCM）が強み。

## 比較ポイント
- 認証
  - Supabase: Email/Password/OAuth。Postgres連携が容易。RLSでデータ保護。
  - Firebase: Authプロバイダ豊富。クライアントSDK成熟。
- データモデル
  - Supabase: リレーショナル（Postgres）。集計/結合/正規化に強い。
  - Firebase: Firestore（ドキュメント型）。柔軟だが結合/複雑集計は工夫が必要。
- プッシュ通知
  - Supabase: ネイティブPushは無。Web PushはVAPID＋Edge Functionsで実装可能。
  - Firebase: FCMが標準でWeb Push対応。導入が簡単。
- サーバレス関数
  - Supabase: Edge Functions（Deno）。DB近接、シンプル。
  - Firebase: Cloud Functions（Node）。エコシステム豊富。
- コスト/無料枠
  - 両者無料枠でMVPは十分。超過時はFirebaseのFCMがコスト効率よくPushを提供。
- DX/運用
  - Supabase: SQL/pg・RLSで権限管理が明快。データ分析に強い。
  - Firebase: SDKと管理画面が成熟。モバイル/通知が得意。

## 本プロジェクト向け結論
- 推奨: Supabase を採用（Auth+Postgres+Edge Functions）。
- 理由: 履歴/分析にリレーショナルが適し、RLSで有料化時の権限管理が容易。OSSで移行容易。
- Push対策: Web Push（VAPID）を採用。配信はSupabase Edge Functionsで行う。
- 代替案: Push簡便性を最優先する場合は Firebase（FCM）採用も妥当。

## 実装方針（Supabase採用時）
- 認証: Supabase Auth（Email/Password/OAuth）。RLSでユーザ毎に隔離。
- データ: Postgresテーブル（`users`, `preferences`, `locations`, `push_subscriptions`, `weather_snapshots`, `alerts_log`）。
- Push: Service Workerで購読→`push_subscriptions`保存→Edge FunctionでVAPID送信。
- 料金/有料化: Stripe連携（将来）。RLS＋メタデータで有料機能を制御。

## 実装方針（Firebase採用時）
- 認証: Firebase Auth。
- データ: Firestore（同等スキーマをコレクションで表現）。
- Push: FCMを利用（Web Push即導入）。
- 料金/有料化: Stripe＋Functions。セキュリティルールで制御。

## 決定
- 初期実装は Supabase を標準とし、PushはWeb Push（VAPID）で提供。
- 要件変更でPushの運用簡便性が最優先になった場合のみ Firebase へ切替検討。
