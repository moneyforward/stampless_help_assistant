#!/bin/bash

# stampless_help_assistant 自動更新スクリプト - 定期実行版
# 使用方法: ./git_auto_update.sh &
# 停止方法: Ctrl+C または kill <プロセスID>

echo "🚀 stampless-help-assistant 自動更新スクリプトを開始します..."
echo "24時間間隔で更新を実行します"
echo "停止するには Ctrl+C を押してください"
echo ""

INTERVAL=86400  # 24時間（秒）
COUNT=0

while true; do
    COUNT=$((COUNT + 1))
    echo "--- サイクル $COUNT: stampless-help-assistant 更新を開始します ---"

    # pull_all_repos.sh を実行
    ./pull_all_repos.sh >> auto_update.log 2>&1

    # 通知ファイルを更新
    CURRENT_TIME=$(date '+%Y-%m-%d %H:%M')
    echo "✅ $CURRENT_TIME - stampless-help-assistant 更新完了" >> "🔔_STAMPLESS_UPDATE_NOTIFICATION.md"

    echo "--- サイクル $COUNT: 更新が完了しました ---"
    echo "次回の更新まで $INTERVAL 秒待機します..."
    echo ""
    sleep $INTERVAL
done
