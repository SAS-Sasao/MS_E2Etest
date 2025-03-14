# MS E2Eテストサンプルプロジェクト

このプロジェクトは、エンドツーエンド（E2E）テストの導入のためのサンプルアプリケーションです。Playwrightフレームワークを使用したE2Eテストの実装例を提供しています。

## アプリケーション概要

このTODOアプリケーションは、ユーザー認証機能を備えたマルチユーザー対応のタスク管理システムです。

### 主要機能

1. **ユーザー管理**
   - ユーザー登録：新規アカウントの作成
   - ログイン/ログアウト：セキュアなセッション管理
   - パスワードハッシュ化：安全なパスワード保存

2. **タスク管理**
   - タスクの追加：新規TODOアイテムの作成
   - タスクの完了：チェックボックスによる完了状態の切り替え
   - タスクの削除：不要なタスクの削除
   - ユーザーごとの独立したタスクリスト

3. **フィルタリング機能**
   - すべてのタスク表示
   - 未完了タスクのみ表示
   - 完了済みタスクのみ表示

### 技術スタック

- **フロントエンド**: 
  - HTML/CSS/JavaScript（バニラJS）
  - RESTful APIとの非同期通信
  - レスポンシブデザイン

- **バックエンド**: 
  - Python/Flask：軽量Webフレームワーク
  - Flask-Login：ユーザー認証管理
  - Flask-SQLAlchemy：ORMによるデータベース操作

- **データベース**: 
  - SQLite：軽量で設定不要なRDBMS
  - ユーザーテーブルとタスクテーブルの関連付け

- **テストフレームワーク**: 
  - Playwright：モダンなE2Eテストツール

## 機能一覧

- ユーザー認証（登録・ログイン）
- TODOタスクの追加・削除
- タスクの完了状態の切り替え
- タスクのフィルタリング（全て・未完了・完了済み）

## 必要な環境

- Python 3.11以上
- Node.js v22.14.0以上
- npm 10.9.2以上

## セットアップ手順

### 1. アプリケーションのセットアップ

```bash
# 必要なPythonパッケージのインストール
pip install flask flask-sqlalchemy flask-login

# バックエンドサーバーの起動
python backend/app.py
```

サーバーは http://localhost:1234 で起動します。

### 2. E2Eテストのセットアップ

```bash
# Playwrightのインストール
npm install playwright @playwright/test --save-dev
npx playwright install
```

## テストの実行

```bash
# 全てのテストを実行
npx playwright test

# UIモードでテストを実行（視覚的に確認）
npx playwright test --ui

# 特定のテストファイルのみ実行
npx playwright test tests/e2e/todo.spec.js

# テストレポートの確認
npx playwright show-report
```

### スクリーンショットの自動保存

テスト実行時に、重要な操作ポイントでスクリーンショットが自動的に保存されます：

- 保存場所: `test-screenshots/[日付]/[実行順序]_[テスト名]/`
  - 実行順序は3桁の連番（001, 002, ...）で表現
  - 例: `test-screenshots/2025-03-13/001_ログイン状態の確認/`
- ファイル名形式: `[リトライ回数]_[ステップ名].png`
- 保存タイミング:
  - ログイン状態の確認時
  - タスクの追加・完了・削除時
  - フィルタリング操作時
  - ログアウト前後

スクリーンショットは操作の順序が分かるように連番が付与され、テストの実行履歴として保存されます。

## プロジェクト構造

```
MS_E2Etest/
├── .github/
│   └── workflows/
│       └── playwright.yml  # GitHub Actions設定
├── backend/
│   ├── app.py             # バックエンドサーバー
│   └── database.db        # SQLiteデータベース
├── frontend/
│   ├── static/
│   │   └── css/
│   │       └── styles.css # スタイルシート
│   └── templates/
│       ├── index.html     # メインページ
│       ├── login.html     # ログインページ
│       └── register.html  # 登録ページ
├── tests/
│   └── e2e/
│       └── todo.spec.js   # E2Eテストコード
├── playwright-report/     # テストレポート
├── test-results/         # テスト結果
├── test-screenshots/     # テスト実行時のスクリーンショット
├── .gitignore           # Git除外設定
├── package.json         # Node.js依存関係
├── playwright.config.js # Playwright設定
└── requirements.txt     # Python依存関係
```

## データベース構造

### テーブル構成

#### userテーブル
- id: INTEGER (主キー)
- username: VARCHAR(80) (ユニーク)
- password_hash: VARCHAR(120)

#### taskテーブル
- id: INTEGER (主キー)
- title: VARCHAR(100)
- completed: BOOLEAN
- user_id: INTEGER (外部キー -> user.id)

## トラブルシューティング

1. **ポート1234が使用中の場合**:
   - backend/app.pyの最後の行でポート番号を変更
   - playwright.config.jsの'port'も同じ番号に変更

2. **データベースのリセット**:
   - database.dbファイルを削除して再起動

3. **テスト失敗時**:
   - スクリーンショットとトレースは./test-resultsディレクトリに保存
   - トレースビューアーで確認: `npx playwright show-trace test-results/trace.zip`

## CI/CD

このプロジェクトはGitHub Actionsを使用して継続的インテグレーション（CI）を実装しています。

### 自動テスト設定

mainブランチへのプッシュまたはプルリクエスト時に、以下の処理が自動的に実行されます：

1. **環境のセットアップ**
   - Python 3.11のインストール
     - requirements.txtによる依存関係管理
     - pipキャッシュによる高速化
   - Node.js 20のインストール
     - package.jsonによる依存関係管理
     - npmキャッシュによる高速化
   - システム依存関係のインストール
     - Xvfbによる仮想ディスプレイ
     - Chromium実行用ライブラリ
     - オーディオ関連パッケージ

2. **テストの実行環境**
   - バックエンドサーバー
     - 自動起動と状態監視
     - ヘルスチェックによる確認
     - エラーログの自動収集
   - テストユーザー
     - 自動作成とエラーリトライ
     - 状態確認とログ収集
   - Playwrightの設定
     - Chromiumブラウザの使用
     - ヘッドレスモードでの実行
     - タイムアウトとリトライの最適化

3. **テスト実行とレポート**
   - テストの並列実行制御
     - シングルワーカーモード
     - リトライ回数の設定
   - 詳細なログ収集
     - APIとブラウザのデバッグログ
     - スクリーンショットの自動保存
     - トレース情報の記録
   - レポート生成
     - HTML形式のレポート
     - JUnit形式のレポート
     - コンソールログの出力

### テスト結果の確認

1. GitHubリポジトリのActionsタブを開く
2. 最新の実行結果を選択
3. 「Artifacts」セクションから以下を確認可能：
   - playwright-report/: HTML形式の詳細レポート
   - test-results/: JUnitレポートとテスト結果
   - test-screenshots/: 実行時のスクリーンショット
   - logs/: サーバーログとデバッグ情報

### ローカルでの開発とテスト

1. 依存関係のインストール
   ```bash
   # Pythonパッケージのインストール
   pip install -r requirements.txt

   # Node.jsパッケージのインストール
   npm install

   # Playwrightブラウザのインストール
   npx playwright install chromium
   ```

2. テストの実行
   ```bash
   # バックエンドサーバーの起動
   python backend/app.py

   # テストの実行（別ターミナルで）
   npm test

   # UIモードでのテスト実行
   npm run test:ui
   ```

3. テスト結果の確認
   - playwright-report/index.html: テスト実行レポート
   - test-screenshots/: スクリーンショット
   - test-results/: テスト結果とログ

## 注意事項

- テスト実行前にバックエンドサーバーが起動していることを確認してください
- データベースに初期データは含まれていないため、最初にユーザー登録が必要です
- 本番環境での使用時はSECRET_KEYの変更を推奨します
