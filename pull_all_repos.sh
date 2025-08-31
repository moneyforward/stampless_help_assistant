#!/bin/bash

# stampless_help_assistant 自動更新スクリプト
# 現在の stampless_help_assistant リポジトリのみを更新

# 現在のスクリプトのディレクトリ
SCRIPT_DIR=$(dirname "$0")

echo "--- stampless-help-assistant リポジトリ更新開始 ---"
echo "対象ディレクトリ: $SCRIPT_DIR"

# リモート追跡ブランチが設定されているかチェック
if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    echo "📦 Git更新を実行します..."
    git pull || { echo "❌ 更新に失敗しました"; exit 1; }
    echo "✅ 更新完了"
else
    echo "⚠️  追跡ブランチが未設定のためスキップしました"
    echo "   リモートブランチを設定するには: git branch --set-upstream-to=origin/main main"
fi

echo "--- 更新処理完了 ---"
