# 🌾 佐渡農作業天気アプリ

佐渡ヶ島の急激な天気変化に対応した、農作業者向けの天気予報アプリです。

## 🎯 プロジェクト概要

佐渡ヶ島では一日の中で天気が急激に変化することが多く（朝の暴風雨→午後の晴天など）、農作業者が作業計画を立てるのが困難な状況があります。このアプリは**「今、作業できるか？」を3秒で判断できる**ことを目標に開発されています。

### 主な機能

- ✅ **現在の天気と作業適性表示** - 一目で作業可否を判断
- ✅ **24時間タイムライン** - 今後の天気変化を視覚化
- ✅ **作業可能時間帯の抽出** - 作業チャンスを明確に表示
- ✅ **警報・注意報表示** - 安全な作業をサポート
- 🔄 **雨雲レーダー**（将来実装）
- 🔄 **プッシュ通知**（将来実装）
- 🔄 **PWA対応**（将来実装）

## 🚀 クイックスタート

### 必要な環境

- Node.js 18以上（Bun推奨）
- Git

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/sado-weather-app.git
cd sado-weather-app

# Bunのインストール（未インストールの場合）
curl -fsSL https://bun.sh/install | bash

# 依存関係のインストール
bun install

# 開発サーバーの起動
bun run dev
```

ブラウザで http://localhost:3000 を開く

### ビルド

```bash
# 本番用ビルド
bun run build

# ビルド結果のプレビュー
bun run preview
```

## 📁 プロジェクト構造

```
sado-weather-app/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── CurrentWeather/  # 現在天気表示
│   │   ├── Timeline/        # 時間別天気表示
│   │   ├── WorkableHours/   # 作業可能時間帯
│   │   └── AlertBanner/     # 警報・注意報
│   ├── hooks/               # カスタムフック
│   │   ├── useWeatherData.ts
│   │   └── useLocation.ts
│   ├── services/            # API通信層
│   │   ├── types.ts         # 型定義
│   │   └── openMeteoApi.ts  # Open-Meteo API
│   ├── utils/               # ユーティリティ関数
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   └── workability.ts   # 作業適性判定
│   ├── App.tsx
│   └── main.tsx
├── docs/                    # ドキュメント
│   ├── REQUIREMENTS.md      # 要件定義書
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── API_SPECIFICATION.md
│   └── ARCHITECTURE.md
├── .cursorrules             # Cursor設定
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🔧 開発ガイド

### Cursorでの開発

このプロジェクトはCursorでシームレスに開発できるように設計されています。

1. **プロジェクトを開く**
   ```bash
   cursor .
   ```

2. **実装を開始**
   
   Cursorのチャットで以下のように指示：
   ```
   IMPLEMENTATION_GUIDE.mdのSTEP 6を実装してください
   ```

3. **ルールに従った開発**
   
   `.cursorrules`ファイルに開発ルールが記載されています。
   Cursorはこのルールに従ってコードを生成します。

### 主要なコマンド

```bash
# 開発サーバー起動
bun run dev

# ビルド
bun run build

# プレビュー
bun run preview

# Lintチェック
bun run lint

# フォーマット
bun run format
```

## 📚 ドキュメント

- [REQUIREMENTS.md](docs/REQUIREMENTS.md) - 詳細な要件定義
- [IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) - 段階的な実装手順
- [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) - API仕様書
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - アーキテクチャ設計

## 🌐 使用しているAPI

### Open-Meteo API
- **URL**: https://api.open-meteo.com/
- **料金**: 無料
- **用途**: 天気予報データの取得
- **制限**: 10,000リクエスト/日

### 気象庁API（将来実装予定）
- **URL**: https://www.jma.go.jp/
- **料金**: 無料
- **用途**: 日本国内の高精度予報、警報・注意報

## 🎨 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **パッケージマネージャ**: Bun
- **開発環境**: Cursor

## 🔐 環境変数

このプロジェクトは環境変数を使用しません。すべてのAPIは認証不要です。

## 📝 作業適性の判定基準

| 判定 | 条件 |
|------|------|
| 🟢 **作業適** | 降水量 < 1mm/h、風速 < 10m/s、雷なし |
| 🟡 **要注意** | 降水量 1-3mm/h、風速 10-15m/s、雷注意報 |
| 🔴 **作業不適** | 降水量 > 3mm/h、風速 > 15m/s、雷警報 |
| ⚫ **夜間** | 19-6時（判定対象外） |

## 🚧 開発ロードマップ

### フェーズ1: MVP（現在）
- [x] プロジェクト初期化
- [x] 基本UI実装
- [x] Open-Meteo API連携
- [x] 作業適性判定機能
- [x] タイムライン表示
- [ ] 位置情報取得
- [ ] 警報・注意報表示

### フェーズ2: 機能拡張
- [ ] 雨雲レーダー
- [ ] プッシュ通知
- [ ] PWA対応
- [ ] 週間予報詳細

### フェーズ3: 高度な機能
- [ ] 農作業メモ機能
- [ ] コミュニティ機能
- [ ] 音声読み上げ
- [ ] ホーム画面ウィジェット

## 🤝 コントリビューション

このプロジェクトへの貢献を歓迎します！

### 開発フロー

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約

- `.cursorrules`ファイルの規約に従う
- TypeScriptの厳密な型チェックを通過すること
- Prettierでフォーマットすること
- 新機能には適切なコメントを付ける

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照

## 👥 開発チーム

- プロジェクトリーダー: [あなたの名前]
- 技術サポート: Claude (Anthropic)

## 🙏 謝辞

- **Open-Meteo**: 無料で高精度な天気データを提供
- **気象庁**: 日本国内の天気データ
- **佐渡の農家の皆さん**: フィードバックと要望提供

## 📞 お問い合わせ

- GitHub Issues: [プロジェクトのIssues](https://github.com/yourusername/sado-weather-app/issues)
- Email: your.email@example.com

## 🌟 このプロジェクトについて

このプロジェクトは、佐渡ヶ島の農作業者が安全かつ効率的に作業できるようサポートすることを目的としています。天気の急変から身を守り、作業の最適なタイミングを見極めるためのツールです。

**「今、作業できるか？」を3秒で判断**

この目標を実現するため、UIは極限までシンプルに、情報は一目でわかるように設計されています。

---

Made with ❤️ for 佐渡の農家の皆さん