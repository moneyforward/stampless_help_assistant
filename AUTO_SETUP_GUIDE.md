# 🚀 stampless-help-assistant 自動更新設定ガイド

**Cursor AIエージェント対応版**

---

## 📋 概要

この記事をCursorのチャットに貼り付けて、「この記事を参考にして自動更新できるようにして」と言うだけで、AIエージェントが自動的に stampless-help-assistant リポジトリの自動更新設定を行います。

### 🎯 自動設定される内容
- **リモート自動更新**: GitHub Actionsで毎日朝10時実行
- **ローカル自動更新**: OSに応じた自動更新スクリプト設定
- **通知システム**: 更新完了通知
- **クロスプラットフォーム**: Windows & macOS対応

### ⏱️ 設定時間
- **所要時間**: 約2-3分
- **必要な操作**: 記事を貼り付けてコマンドを実行するだけ

---

## ⚙️ 前提条件

### 必須条件
- **Cursor** がインストールされている
- **Git** がインストールされている
- **インターネット接続** がある
- **stampless-help-assistant リポジトリ** がクローン済み

### 推奨環境
- **Node.js**: 18.x以上
- **npm**: 最新版
- **Git**: 2.30以上

---

## 🚀 自動設定手順

### ステップ1: 記事をCursorに貼り付ける
この記事全体をCursorのチャット欄にコピーして貼り付けてください。

### ステップ2: コマンド実行
以下のコマンドをCursorのチャットで実行してください：

```
この記事を参考にして自動更新できるようにして
```

### ステップ3: AIエージェントの実行
AIエージェントが自動的に以下の処理を実行します：
1. OSの自動検出
2. 必要なスクリプトの作成・設定
3. 実行権限の付与
4. 自動更新の開始
5. 設定完了の確認

---

## 💻 OS別自動設定内容

### 🍎 macOSの場合

#### 自動実行される処理
```bash
# 1. 自動更新スクリプトの作成
./setup_auto_update_mac.sh

# 2. 実行権限付与
chmod +x *.sh

# 3. 自動更新開始
./git_auto_update.sh &

# 4. 設定確認
ps aux | grep git_auto_update
```

#### 作成されるファイル
- `pull_all_repos.sh` - 単発更新スクリプト
- `git_auto_update.sh` - 24時間間隔自動更新
- `update_reminder.sh` - リマインダースクリプト
- `🔔_STAMPLESS_UPDATE_NOTIFICATION.md` - 更新履歴

### 🪟 Windowsの場合

#### 自動実行される処理
```batch
# 1. 自動更新スクリプトの作成
setup_auto_update_windows.bat

# 2. 実行権限確認
# 3. 自動更新開始
start /B git_auto_update.bat

# 4. 設定確認
tasklist | findstr git_auto_update
```

#### 作成されるファイル
- `pull_all_repos.bat` - 単発更新バッチファイル
- `git_auto_update.bat` - 自動更新バッチファイル
- `update_reminder.bat` - リマインダーバッチファイル
- `🔔_STAMPLESS_UPDATE_NOTIFICATION.md` - 更新履歴

---

## 🔧 自動設定される機能

### 1. 自動更新スクリプト
```bash
# macOS
./git_auto_update.sh &
# Windows
start /B git_auto_update.bat
```

### 2. 通知システム
- 更新完了時に自動通知
- 更新履歴の記録
- エラー時の警告表示

### 3. プロセス管理
- 自動起動設定
- プロセス監視
- 異常停止時の再起動

### 4. ログ管理
- 実行ログの自動保存
- エラーログの記録
- 定期的なログ整理

---

## 📊 設定後の運用フロー

### 自動運用開始
```
クローン済みリポジトリ
       ↓
   記事を貼り付け
       ↓
「自動更新できるようにして」
       ↓
AIエージェントが自動設定
       ↓
リモート: 毎日朝10時自動更新
ローカル: 24時間間隔自動更新
```

### 確認方法

#### 更新状況の確認
```bash
# macOS
ps aux | grep git_auto_update
cat 🔔_STAMPLESS_UPDATE_NOTIFICATION.md

# Windows
tasklist | findstr git_auto_update
type 🔔_STAMPLESS_UPDATE_NOTIFICATION.md
```

#### GitHub Actionsの確認
- GitHub → stampless_help_assistant → Actionsタブ
- "Daily Git Update" ワークフローの実行履歴

---

## 🛠️ 手動設定（バックアップ）

AIエージェントが動作しない場合の手動設定方法です。

### macOSの手動設定
```bash
# 1. スクリプト実行権限付与
chmod +x pull_all_repos.sh git_auto_update.sh update_reminder.sh

# 2. 自動更新開始
./git_auto_update.sh &

# 3. プロセス確認
ps aux | grep git_auto_update
```

### Windowsの手動設定
```batch
# 1. 自動更新開始
start /B git_auto_update.bat

# 2. プロセス確認
tasklist | findstr git_auto_update
```

---

## ⚠️ 注意事項

### 重要ポイント
- **初回実行**: インターネット接続が必要です
- **実行権限**: スクリプトに実行権限が自動付与されます
- **バックグラウンド実行**: 自動更新はバックグラウンドで実行されます
- **スリープ対応**: macOSのスリープ復帰時は手動再開が必要です

### セキュリティ
- スクリプトはリポジトリ内のファイルのみを操作します
- 外部ネットワークアクセスはGit操作のみです
- 個人情報や設定ファイルにはアクセスしません

---

## 🔍 トラブルシューティング

### AIエージェントが動作しない場合
1. Cursorのバージョンを確認してください
2. インターネット接続を確認してください
3. 記事全体を正しく貼り付けたか確認してください

### 自動更新が開始されない場合
```bash
# macOS
ps aux | grep git_auto_update
./git_auto_update.sh &

# Windows
tasklist | findstr git_auto_update
start /B git_auto_update.bat
```

### 権限エラーが発生する場合
```bash
# macOS
chmod +x *.sh
ls -la *.sh

# Windows
# 管理者権限でコマンドプロンプトを開いて実行
```

---

## 📞 サポート

### 問題が発生した場合
1. **Cursorのチャットで確認**
   ```
   自動更新が動作していないようです。確認してください。
   ```

2. **手動での設定確認**
   - 上記の「手動設定」セクションを参照
   - 各OSの手動実行コマンドを使用

3. **ログの確認**
   ```bash
   # 更新ログ確認
   cat 🔔_STAMPLESS_UPDATE_NOTIFICATION.md

   # エラーログ確認
   ls -la *.log 2>/dev/null || echo "ログファイルなし"
   ```

---

## 🎯 効果

### 自動化による効果
- ✅ **時間節約**: 手動更新から解放
- ✅ **ミス防止**: 定期的な自動更新
- ✅ **チーム同期**: 全員が最新状態維持
- ✅ **運用効率**: 最小限の手間で最大限の効果

### 設定前後の比較

| 項目 | 設定前 | 設定後 |
|------|--------|-------|
| **更新頻度** | 手動（不定期） | 毎日自動 |
| **更新時間** | 都度手動実行 | 朝10時自動 |
| **人的ミス** | 発生しやすい | ほぼゼロ |
| **チーム同期** | 非効率的 | 自動同期 |

---

## 📝 更新履歴

- **v1.0.0** (2025-01-XX): 初回リリース
  - クロスプラットフォーム対応
  - AIエージェント自動設定
  - 24時間間隔自動更新

---

## 🎉 設定完了！

この記事をCursorのチャットに貼り付けて、「この記事を参考にして自動更新できるようにして」と言うだけで、AIエージェントが自動的に設定を行います。

**設定完了まで約2-3分です！** 🚀

---

*本文書は stampless-help-assistant リポジトリの自動更新設定専用です。*
