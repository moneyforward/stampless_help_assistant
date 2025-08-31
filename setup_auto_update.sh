#!/bin/bash

# stampless-help-assistant 自動更新設定スクリプト
# OS自動検出・クロスプラットフォーム対応

echo "🚀 stampless-help-assistant 自動更新設定を開始します..."
echo ""

# OS検出
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    echo "📱 OS検出: macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="Windows"
    echo "🪟 OS検出: Windows"
else
    OS="Linux"
    echo "🐧 OS検出: Linux"
fi

echo "🔧 必要なスクリプトを確認しています..."

# 必要なファイルの存在確認
REQUIRED_FILES=("pull_all_repos.sh" "git_auto_update.sh" "update_reminder.sh")

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file 存在します"
    else
        echo "❌ $file が見つかりません"
        exit 1
    fi
done

echo ""
echo "🔑 実行権限を設定しています..."

# 実行権限付与
if [[ "$OS" == "macOS" ]] || [[ "$OS" == "Linux" ]]; then
    chmod +x *.sh
    echo "✅ macOS/Linux 用に実行権限を付与しました"
elif [[ "$OS" == "Windows" ]]; then
    echo "✅ Windows ではバッチファイルを使用します"
fi

echo ""
echo "🚀 自動更新を開始しています..."

# OSに応じた自動更新開始
if [[ "$OS" == "macOS" ]] || [[ "$OS" == "Linux" ]]; then
    echo "macOS/Linux 用自動更新を開始します..."
    ./git_auto_update.sh &
    sleep 2
    ps aux | grep git_auto_update | grep -v grep
elif [[ "$OS" == "Windows" ]]; then
    echo "Windows 用自動更新を開始します..."
    # Windowsの場合はバッチファイルを使用（未実装の場合はbash互換）
    if [[ -f "git_auto_update.bat" ]]; then
        echo "Windowsバッチファイルが見つかりました"
        # Windows環境では手動実行を推奨
        echo "💡 Windowsでは以下のコマンドで開始してください："
        echo "   start /B git_auto_update.bat"
    else
        echo "Windowsバッチファイルが見つからないため、bashスクリプトを使用します"
        ./git_auto_update.sh &
        sleep 2
        ps aux | grep git_auto_update | grep -v grep
    fi
fi

echo ""
echo "📝 初期通知ファイルを作成しています..."

# 通知ファイル作成
NOTIFICATION_FILE="🔔_STAMPLESS_UPDATE_NOTIFICATION.md"

cat > "$NOTIFICATION_FILE" << 'EOF'
# 🔔 stampless-help-assistant 更新通知

## ✅ 自動更新設定完了

**設定日時**: $(date '+%Y年%m月%d日 %H:%M')

### 📊 設定内容
- OS: $OS
- リモート更新: 毎日朝10時（日本時間）
- ローカル更新: 24時間間隔自動更新
- 通知システム: 自動更新完了通知

### 🔗 関連リンク
- [GitHub Actions実行状況](https://github.com/moneyforward/stampless_help_assistant/actions)
- [設定ガイド](STAMPLESS_GIT_UPDATE_GUIDE.md)
- [自動設定ガイド](AUTO_SETUP_GUIDE.md)

---

*このファイルは自動更新の履歴を記録します*
EOF

echo "✅ 通知ファイルを作成しました: $NOTIFICATION_FILE"

echo ""
echo "🎉 自動更新設定が完了しました！"
echo ""
echo "📋 設定内容:"
echo "   • OS: $OS"
echo "   • リモート更新: 毎日朝10時（日本時間）"
echo "   • ローカル更新: 24時間間隔"
echo "   • 通知ファイル: $NOTIFICATION_FILE"
echo ""
echo "🔍 確認方法:"
echo "   • プロセス確認: ps aux | grep git_auto_update"
echo "   • 更新履歴: cat $NOTIFICATION_FILE"
echo "   • GitHub Actions: https://github.com/moneyforward/stampless_help_assistant/actions"
echo ""
echo "⚠️  注意事項:"
if [[ "$OS" == "macOS" ]]; then
    echo "   • Macスリープ時は手動再開が必要です: ./git_auto_update.sh &"
elif [[ "$OS" == "Windows" ]]; then
    echo "   • Windowsではタスクスケジューラーの使用を推奨します"
fi
echo ""
echo "🚀 stampless-help-assistant の自動更新が開始されました！"
