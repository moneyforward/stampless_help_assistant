# 🚀 Google Slides API連携セットアップガイド

## 📋 概要

Google Slides APIを使用して、新リース会計ガイドラインを自動で取得・更新する機能のセットアップ手順です。

### ✅ **実現できること**
- 📄 Google Slidesから最新のガイドライン情報を自動取得
- 🔄 顧客共有可否判定の自動更新
- ⚡ リアルタイムでの情報反映
- 📊 構造化データでの管理

---

## ⚡ セットアップ手順

### **Step 1: Google Cloud Platform設定**

#### 1.1 プロジェクト作成
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. プロジェクト名: `stampless-help-assistant` など

#### 1.2 Google Slides API有効化
1. 「APIとサービス」→「ライブラリ」
2. 「Google Slides API」を検索
3. APIを有効化

### **Step 2: サービスアカウント作成**

#### 2.1 サービスアカウント設定
1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「サービスアカウント」
3. **サービスアカウント名**: `slides-reader`
4. **説明**: `新リース会計Slides読み取り用`
5. 役割は設定不要（デフォルトのまま）

#### 2.2 キーファイル作成
1. 作成されたサービスアカウントをクリック
2. 「キー」タブ→「キーを追加」→「新しいキーを作成」
3. **形式**: JSON
4. ダウンロードされたファイルを以下に配置:
   ```
   config/google-api-credentials.json
   ```

### **Step 3: Google Slidesアクセス権限付与**

#### 3.1 Slidesに権限追加
1. [新リース会計Slides](https://docs.google.com/presentation/d/1e9xoZB8VqfD4FsRH-eM5OPElTF8NIgs5NbZNh8ZSgEw/edit)を開く
2. 右上の「共有」ボタンをクリック
3. サービスアカウントのメールアドレスを追加
   - **メールアドレス**: `credentials.json`ファイル内の`client_email`の値
   - **権限**: 閲覧者
4. 「送信」ボタンをクリック

### **Step 4: 依存関係インストール**

```bash
# googleapis パッケージのインストール
npm install googleapis
```

### **Step 5: 動作テスト**

```bash
# 設定確認
npm run slides-setup

# 初回同期実行
npm run slides-sync

# 同期状況確認
npm run slides-status
```

---

## 🛠️ 使用方法

### **基本コマンド**

```bash
# セットアップガイド表示
npm run slides-setup

# Google Slidesから最新情報を同期
npm run slides-sync

# 現在の同期状況を確認
npm run slides-status
```

### **直接スクリプト実行**

```bash
# セットアップガイド
node scripts/google-slides-api.js --setup

# 同期実行
node scripts/google-slides-api.js --sync

# 状況確認
node scripts/google-slides-api.js --status
```

---

## 📊 自動抽出される情報

### **抽出項目**
Google Slidesから以下の情報を自動抽出し、構造化データとして保存：

#### ✅ **顧客共有OK**
- 新リース会計基準の説明
- 対応スケジュール（確定済み）
- 機能の利用方法・操作手順
- 既存機能からの移行手順

#### ❌ **顧客共有NG**
- 内部開発スケジュール
- 技術的実装詳細
- 他社との差別化戦略
- 未確定の機能仕様

#### 🚨 **エスカレーション必要**
- 法的責任に関わる判断
- 監査対応に関する具体的手順
- 他社製品との詳細比較
- カスタマイズ開発の可否

#### 📅 **スケジュール情報**
- リリース予定日
- 対応完了時期
- 移行期間

#### 🔧 **機能情報**
- 新機能の説明
- 対応範囲
- 実装状況

---

## 🔄 自動更新フロー

### **Step 1: Google Slides更新**
```
担当者がGoogle Slidesのガイドライン資料を更新
```

### **Step 2: 同期実行**
```bash
# 手動同期
npm run slides-sync

# または定期実行（cron設定）
0 9 * * * cd /path/to/project && npm run slides-sync
```

### **Step 3: 自動反映**
```
次回のhelp_request_assistant実行時に最新情報が適用される
```

---

## 📱 定期実行設定（推奨）

### **Cronによる自動実行**

```bash
# crontabの編集
crontab -e

# 毎日朝9時に自動同期
0 9 * * * cd /Users/sudo.ryota/Documents/workspace/stampless_help_assistant && npm run slides-sync >> logs/slides-sync.log 2>&1

# 毎週月曜日の朝9時に実行
0 9 * * 1 cd /Users/sudo.ryota/Documents/workspace/stampless_help_assistant && npm run slides-sync
```

### **ログファイル作成**

```bash
# ログディレクトリ作成
mkdir -p logs

# ログファイル初期化
touch logs/slides-sync.log
```

---

## 🔧 トラブルシューティング

### **よくあるエラーと対処法**

#### ❌ **403 Forbidden エラー**
```
Error: The caller does not have permission
```
**対処法**:
1. Google Slidesの共有設定を確認
2. サービスアカウントのメールアドレスが正しく追加されているか確認
3. 権限が「閲覧者」以上に設定されているか確認

#### ❌ **404 Not Found エラー**
```
Error: Requested entity was not found
```
**対処法**:
1. Slides IDが正しいか確認
2. Slidesが削除されていないか確認
3. URLが正しいか確認

#### ❌ **認証エラー**
```
Error: invalid_grant
```
**対処法**:
1. `google-api-credentials.json`の内容を確認
2. サービスアカウントキーを再作成
3. ファイルのパスが正しいか確認

#### ❌ **依存関係エラー**
```
Cannot find module 'googleapis'
```
**対処法**:
```bash
npm install googleapis
```

---

## 📊 設定ファイル構造

### **認証情報ファイル例**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "slides-reader@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/...",
  "universe_domain": "googleapis.com"
}
```

### **出力データ構造**
```json
{
  "last_updated": "2024-01-20T09:00:00.000Z",
  "slides_url": "https://docs.google.com/presentation/d/...",
  "slides_content": {
    "title": "新リース会計ガイドライン",
    "total_slides": 15,
    "last_modified": "2024-01-20T09:00:00.000Z"
  },
  "guidelines": {
    "customer_sharing_ok": [...],
    "customer_sharing_ng": [...],
    "escalation_required": [...],
    "schedule_info": [...],
    "feature_info": [...]
  },
  "update_history": [...]
}
```

---

## 🎯 運用のポイント

### **定期メンテナンス**
- **週1回**: 同期状況の確認
- **月1回**: Google Slides内容の手動確認
- **四半期1回**: サービスアカウントキーの更新検討

### **セキュリティ**
- サービスアカウントキーは適切に管理
- 最小権限の原則（閲覧者権限のみ）
- 定期的なアクセスログ確認

### **監視**
- 同期失敗時のアラート設定
- ログファイルの定期確認
- データ整合性の確認

---

## 🏆 完成イメージ

### **Before（手動更新）**
```
Google Slides更新 → 手動でコピペ → JSON手動編集 → システム反映
所要時間: 30分〜1時間
```

### **After（自動同期）**
```
Google Slides更新 → npm run slides-sync → 自動でシステム反映
所要時間: 1分
```

**作業効率が劇的に向上！** 🚀
