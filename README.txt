TODOアプリケーション セットアップ・実行手順
=====================================

1. 必要な環境
-------------
- Python 3.11以上
- Node.js v22.14.0以上
- npm 10.9.2以上

2. アプリケーションの起動方法
-------------------------
1) プロジェクトディレクトリに移動:
   ```
   cd C:\Apps\MS_E2Etest
   ```

2) 必要なPythonパッケージのインストール:
   ```
   pip install flask flask-sqlalchemy flask-login
   ```

3) バックエンドサーバーの起動:
   ```
   python backend/app.py
   ```
   - サーバーは http://localhost:1234 で起動します
   - 初回起動時にSQLiteデータベースが自動的に作成されます

4) ブラウザでアクセス:
   - http://localhost:1234 にアクセス
   - 初回利用時は「登録」からアカウントを作成
   - 作成したアカウントでログイン

3. 基本的な使い方
--------------
1) タスクの追加:
   - 入力フィールドにタスクを入力
   - 「追加」ボタンをクリック

2) タスクの管理:
   - チェックボックスでタスクの完了/未完了を切り替え
   - 「削除」ボタンでタスクを削除

3) タスクのフィルタリング:
   - 「すべて」「未完了」「完了済み」ボタンでタスク表示を切り替え

4. E2Eテストの実行方法
-------------------
1) テストに必要なパッケージのインストール:
   ```
   npm install playwright @playwright/test --save-dev
   npx playwright install
   ```

2) テストの実行:
   ```
   npx playwright test
   ```

3) UIモードでテストを実行（視覚的に確認）:
   ```
   npx playwright test --ui
   ```

4) 特定のテストファイルのみ実行:
   ```
   npx playwright test tests/e2e/todo.spec.js
   ```

5) テストレポートの確認:
   ```
   npx playwright show-report
   ```

5. データベースの確認方法（A5SQL）
-----------------------------
1) データベースファイルの場所:
   - パス: C:\Apps\MS_E2Etest\instance\database.db
   - 形式: SQLite3

2) テーブル構成:
   - user テーブル:
     * id: INTEGER (主キー)
     * username: VARCHAR(80) (ユニーク)
     * password_hash: VARCHAR(120)

   - task テーブル:
     * id: INTEGER (主キー)
     * title: VARCHAR(100)
     * completed: BOOLEAN
     * user_id: INTEGER (外部キー -> user.id)

3) 主なテーブル関連:
   - task.user_id -> user.id (1対多の関係)
   - 1人のユーザーが複数のタスクを持つことが可能

4) A5SQLでの接続:
   - 「ファイル」→「接続」→「SQLite」を選択
   - データベースファイルとして上記パスのdatabase.dbを指定
   - 文字コード: UTF-8

6. トラブルシューティング
----------------------
1) ポート1234が使用中の場合:
   - backend/app.pyの最後の行でポート番号を変更
   - playwright.config.jsの'port'も同じ番号に変更

2) データベースのリセット:
   - database.dbファイルを削除して再起動

3) テスト失敗時:
   - スクリーンショットとトレースは./test-resultsディレクトリに保存
   - トレースビューアーで確認:
     ```
     npx playwright show-trace test-results/trace.zip
     ```

注意事項:
- テスト実行前にバックエンドサーバーが起動していることを確認
- データベースに初期データは含まれていないため、最初にユーザー登録が必要
- 本番環境での使用時はSECRET_KEYの変更を推奨
