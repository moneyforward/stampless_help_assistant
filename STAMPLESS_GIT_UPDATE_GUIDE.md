# 🚀 stampless-help-assistant Git自動更新システム導入ガイド

## 📋 概要

Money Forwardのstampless-help-assistantリポジトリに対して、Git自動更新システムを導入します。

### 🎯 目標
- **リモートリポジトリ**: 毎日自動更新（GitHub Actions）
- **ローカル環境**: 各メンバーが選択して設定
- **最小限の手間**: 最大限の効果

---

## ⚙️ GitHub Actions設定状況

### ✅ 完了済みの設定
- **ファイル**: `.github/workflows/git-daily-update.yml`
- **機能**:
  - 毎日0時（UTC）に自動実行
  - Node.js 18.x環境での実行
  - 依存関係のインストール
  - プロジェクト構造の確認
  - データベース設定の確認（安全な方法）
  - スクリプト実行テスト
  - 詳細な実行結果通知

### 🔄 運用フロー
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ GitHub      │ => │ リモート     │ => │ チーム通知   │
│ Actions実行 │    │ リポジトリ   │    │ 生成        │
│ (自動)      │    │ 更新完了     │    │            │
└─────────────┘    └─────────────┘    └─────────────┘
                                                │
┌─────────────┐    ┌─────────────┐         │
│ 各メンバー   │ <= │ 通知受信     │ <───────┘
│ ローカル更新 │    │ (Actionsログ)│
│ (各自選択)   │    │             │
└─────────────┘    └─────────────┘
```

---

## 👥 チームメンバーの設定（各自）

### 📋 選択肢

#### **方法1: Cursorタスク（推奨）**
```json
// .cursor/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "stampless-help-assistant 更新",
      "type": "shell",
      "command": "./pull_all_repos.sh",
      "group": {
        "kind": "build",
        "isDefault": false
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": true,
        "clear": false
      },
      "problemMatcher": [],
      "runOptions": {
        "runOn": "folderOpen"
      }
    }
  ]
}
```

**実行方法:**
- Cursorで `Cmd+Shift+P` (Mac) または `Ctrl+Shift+P` (Windows)
- "Tasks: Run Task" と入力
- "stampless-help-assistant 更新" を選択

#### **方法2: 定期実行スクリプト**
```bash
# 自動更新開始
./git_auto_update.sh &

# プロセス確認
ps aux | grep git_auto_update

# 停止
pkill -f git_auto_update
```

#### **方法3: リマインダースクリプト**
```bash
# 毎朝実行（習慣化）
./update_reminder.sh
```

---

## 📁 必要なファイル

### 🔧 共通ファイル
```
pull_all_repos.sh          # 基本更新スクリプト
🔔_GIT_UPDATE_NOTIFICATION.md  # 更新履歴
```

### 📊 個別設定ファイル

#### Cursorユーザー
```
.cursor/tasks.json         # Cursorタスク設定
```

#### スクリプトユーザー
```
git_auto_update.sh         # 自動更新スクリプト
update_reminder.sh         # リマインダースクリプト
```

---

## 🔍 GitHub Actionsの確認方法

### 1. Actionsタブの確認
1. GitHubリポジトリを開く
2. "Actions" タブをクリック
3. "Daily Git Update" ワークフローを確認

### 2. 実行結果の確認
- ワークフローの実行履歴を確認
- 実行結果の詳細ログを表示
- 通知ファイルの内容を確認

### 3. 手動実行
- Actionsタブから "Run workflow" をクリック
- 手動でワークフローを実行

---

## 📊 stampless-help-assistant特有の機能

### 🔧 技術スタック
- **Node.js**: 18.x
- **依存関係**: mysql2, googleapis
- **データベース**: MySQL
- **外部API**: Google APIs

### 🧪 テスト内容
- **依存関係インストール**: npm ci
- **プロジェクト構造確認**: ファイル・ディレクトリの存在確認
- **データベース設定確認**: configファイルの存在確認（接続テストなし）
- **スクリプト実行テスト**: Node.js実行テスト

### 📋 監視対象
- package.json の更新
- スクリプトファイルの変更
- 設定ファイルの更新
- ドキュメントの更新

---

## 🎯 効果

| 項目 | Before | After |
|------|--------|-------|
| **リモート更新** | 手動プル必須 | 毎日自動更新 |
| **依存関係** | 手動更新 | 自動更新確認 |
| **プロジェクト状態** | 不明瞭 | 自動監視 |
| **チーム同期** | 非効率的 | 効率的 |
| **ミス防止** | 発生しやすい | 大幅削減 |

---

## 🆘 トラブルシューティング

### Q: GitHub Actionsが実行されない
A: リポジトリのActions設定を確認してください

### Q: ワークフローが失敗する
A: Actionsタブの実行ログを確認してください

### Q: ローカル更新が失敗する
A: スクリプトの実行権限を確認: `chmod +x *.sh`

### Q: 更新が失敗する
A: ターミナルの出力でエラーメッセージを確認してください

---

## 📞 サポート

質問があればチームSlackでお知らせください！

## 🎉 設定完了！

これでstampless-help-assistantの自動更新システムが完成しました！ 🚀

**コミットID**: 497fa7b
**設定日時**: 2025年8月31日
