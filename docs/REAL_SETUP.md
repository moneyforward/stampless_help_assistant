# 🔧 実業務用セットアップガイド

## 概要
模擬データから実際のデータベース・APIに接続して、本格的な業務で使用するための設定手順です。

## 🚀 セットアップ手順

### **Step 1: 必要なパッケージインストール**
```bash
cd /Users/sudo.ryota/Documents/workspace/stampless_help_assistant
npm init -y
npm install mysql2 https
```

### **Step 2: データベース接続設定**

#### **2-1. 設定ファイル作成**
```bash
cp config/database-config.example.json config/database-config.json
```

#### **2-2. 設定ファイル編集**
`config/database-config.json` を開いて実際の接続情報を設定：

```json
{
  "stampless_db": {
    "host": "実際のDBホスト名",
    "user": "あなたのDBユーザー名", 
    "password": "あなたのDBパスワード",
    "database": "stampless_production",
    "port": 3306
  },
  "erpweb_api": {
    "host": "実際のERPWebAPIホスト",
    "username": "あなたのERPWebユーザー名",
    "password": "あなたのERPWebパスワード"
  }
}
```

### **Step 3: 権限取得**

#### **3-1. stampless_backend DB への読み取り権限**
以下の情報をDB管理者に依頼：
- **必要テーブル**: `navis_offices`, `address_book_masters`
- **権限**: SELECT のみ（読み取り専用）
- **接続元**: あなたのIP または 社内ネットワーク

#### **3-2. ERPWeb API アクセス権限**
以下の情報をERPWeb管理者に依頼：
- **APIエンドポイント**: `/api/contracts/{tenant_uid}`
- **認証方式**: Basic認証
- **権限**: 契約情報の参照のみ

### **Step 4: テスト実行**

#### **4-1. 接続テスト**
```bash
node scripts/customer-lookup-real.js "株式会社マネーフォワード"
```

#### **4-2. 成功例**
```
🔍 実データベースから顧客情報を検索中...

# 🏢 顧客情報 - 株式会社マネーフォワード
- 事業者名: 株式会社マネーフォワード
- 事業者No: 123456
- プラン: Midプラン
- 支払い方法: クレジットカード
```

### **Step 5: Cursorルール設定完了**

ルール設定は自動で更新済みです。これで実際の業務データを使った問い合わせ対応が可能になります。

<function_calls>
<invoke name="search_replace">
<parameter name="file_path">/Users/sudo.ryota/Documents/workspace/stampless_help_assistant/.cursor/rules/help_request_assistant.mdc
