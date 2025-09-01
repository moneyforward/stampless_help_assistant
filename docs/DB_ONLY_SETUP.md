# 🚀 代替案1：stampless_backend DB接続のみセットアップガイド

## 📋 概要

**代替案1**では、ERPWeb APIへの依頼を回避し、`stampless_backend` のMySQLデータベースにのみ接続します。

### ✅ メリット
- **依頼作業が最小限**: stampless_backend DB管理者のみ
- **高速セットアップ**: ERPWeb権限待ちなし
- **基本情報は完全自動化**: 事業者名、ID、事業者番号等
- **支払い情報は効率的に確認**: 直接リンクで1クリック確認

### 📊 取得できる情報

| 項目 | 自動取得 | 取得元 |
|------|----------|--------|
| 事業者名 | ✅ | `navis_offices.name` |
| 事業者No (tenant_uid) | ✅ | `navis_offices.tenant_uid` |
| Office ID | ✅ | `navis_offices.id` |
| 事業者番号 | ✅ | `address_book_masters.corporate_number` |
| 識別コード | ✅ | `navis_offices.identification_code` |
| 登録日 | ✅ | `navis_offices.created_at` |
| **支払い方法** | 🔗 手動 | ERPWebリンク（1クリック） |
| **プラン名** | 🔗 手動 | ERPWebリンク（1クリック） |
| **契約状況** | 🔗 手動 | ERPWebリンク（1クリック） |

---

## ⚡ クイックセットアップ（3ステップ）

### ステップ1: 依存関係インストール
```bash
cd /Users/sudo.ryota/Documents/workspace/stampless_help_assistant
npm install mysql2
```

### ステップ2: 設定ファイル作成
```bash
# 設定ファイルテンプレートをコピー
cp config/database-config-simple.example.json config/database-config-simple.json

# 設定ファイルを編集
code config/database-config-simple.json
```

### ステップ3: 実際の接続情報を設定
`config/database-config-simple.json` を以下のように編集：

```json
{
  "host": "実際のMySQLホスト名",
  "user": "読み取り専用ユーザー名", 
  "password": "対応するパスワード",
  "database": "stampless_backend",
  "port": 3306
}
```

---

## 🙋‍♂️ DB管理者への依頼文（コピペ用）

```
お疲れ様です。

CS業務効率化のため、以下のデータベース読み取り権限をお願いします。

■ 目的
問い合わせ対応時の顧客情報自動取得（help_request_assistant ルール用）

■ 必要な権限
- データベース: stampless_backend
- テーブル: navis_offices, address_book_masters
- 権限: SELECT のみ（読み取り専用）

■ 接続元
- ユーザー: [あなたの名前]
- 接続元IP: [あなたのIPアドレス] または 社内ネットワーク
- 用途: Cursor AI ルール からの自動クエリ実行

■ アクセスパターン
- 頻度: 問い合わせ発生時のみ（1日数回程度）
- クエリ: 会社名・ID検索のSELECTクエリのみ
- データ量: 1回あたり1件のレコード取得

■ セキュリティ
- 書き込み権限は不要
- 個人情報は暗号化されたフィールドのため安全
- 結果はローカルファイルに一時保存のみ

何かご不明な点がございましたら、お気軽にお声がけください。
よろしくお願いいたします。
```

---

## 🧪 テスト実行

### 基本テスト
```bash
# 会社名で検索
node scripts/customer-lookup-db-only.js "株式会社マネーフォワード"

# Office IDで検索
node scripts/customer-lookup-db-only.js "12345"

# Tenant UIDで検索  
node scripts/customer-lookup-db-only.js "67890"
```

### 成功時の出力例
```markdown
# 🏢 顧客情報 - 株式会社マネーフォワード

## 📋 基本情報（自動取得済み ✅）
- **事業者名**: 株式会社マネーフォワード
- **事業者No (tenant_uid)**: 67890
- **Office ID**: 12345
- **事業者番号**: 1234567890123
- **識別コード**: MF123
- **登録日**: 2023/1/15

## 💳 契約・支払い情報（手動確認）
- **プラン名**: [ERPWebで確認](https://erp.moneyforward.com/search?tenant_uid=67890)
- **支払い方法**: [ERPWebで確認](https://erp.moneyforward.com/search?tenant_uid=67890)
- **契約状況**: [ERPWebで確認](https://erp.moneyforward.com/search?tenant_uid=67890)
```

---

## 🤖 Cursor AI ルール連携

### 自動実行例
```
# Cursor で以下のように問い合わせすると自動実行
@help_request_assistant.mdc 株式会社サンプルで契約書のダウンロードができません。

# 内部で自動実行される
node scripts/customer-lookup-db-only.js "株式会社サンプル"

# 結果がテンプレートに自動入力される
```

### help_request_assistant.mdc ルールの動作
1. **自動検出**: 問い合わせから会社名・IDを検出
2. **スクリプト実行**: `customer-lookup-db-only.js` を自動実行
3. **情報取得**: 基本情報をDBから自動取得
4. **テンプレート生成**: 不具合報告テンプレートに自動入力
5. **リンク提供**: 支払い情報確認用のERPWebリンクを生成

---

## 🔧 トラブルシューティング

### エラー: データベース接続失敗
```bash
❌ データベース接続エラー: Error: connect ECONNREFUSED
```
**対処法**:
1. VPN接続を確認
2. `config/database-config-simple.json` の設定を確認
3. DB管理者に権限付与を確認

### エラー: 顧客情報が見つからない
```bash
❌ 顧客情報取得エラー
検索結果: 該当する顧客が見つかりませんでした
```
**対処法**:
1. 会社名のスペルミスを確認
2. 略称ではなく正式名称で検索
3. Awebで手動検索して確認
4. office_id や tenant_uid での検索を試行

### エラー: 権限不足
```bash
❌ データベース接続エラー: Error: Access denied for user
```
**対処法**:
1. DB管理者に権限付与を再依頼
2. ユーザー名・パスワードを確認
3. 社内ネットワークからの接続を確認

---

## 🎯 次のステップ

### 1. 即座に開始可能
- [x] スクリプト作成完了
- [x] 設定ファイルテンプレート完了
- [x] Cursor ルール更新完了
- [ ] DB管理者への依頼
- [ ] テスト実行

### 2. 効果測定後の拡張
代替案1で効果を確認後、以下を検討：
- ERPWeb API連携の追加（完全自動化）
- 他システム連携の追加
- バッチ処理での定期更新

---

## 📞 サポート

### 設定でお困りの場合
1. `config/database-config-simple.json` の設定を確認
2. VPN接続を確認
3. DB管理者に権限を確認
4. `node scripts/customer-lookup-db-only.js --help` でヘルプ表示

### 機能拡張のご要望
- [ ] より多くの顧客情報の自動取得
- [ ] ERPWeb API連携の追加
- [ ] バッチ処理機能
- [ ] ダッシュボード機能

**現在の状況**: 代替案1のセットアップ完了！DB管理者への依頼のみで利用開始できます。
