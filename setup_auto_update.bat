@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 stampless-help-assistant 自動更新設定を開始します...
echo.

echo 🔧 必要なファイルを確認しています...

REM 必要なファイルの存在確認
set REQUIRED_FILES[0]=pull_all_repos.bat
set REQUIRED_FILES[1]=git_auto_update.bat
set REQUIRED_FILES[2]=update_reminder.bat

set /a count=0
for %%i in (0,1,2) do (
    set file=!REQUIRED_FILES[%%i]!
    if exist "!file!" (
        echo ✅ !file! 存在します
    ) else (
        echo ❌ !file! が見つかりません
        echo 代わりにbashスクリプトを使用します...
        goto :bash_fallback
    )
    set /a count+=1
)

echo.
echo 🚀 Windows用自動更新を開始しています...

REM Windowsバッチファイルが存在する場合
if exist "git_auto_update.bat" (
    echo Windowsバッチファイルが見つかりました
    start /B git_auto_update.bat
    timeout /t 2 >nul
    tasklist | findstr git_auto_update
) else (
    goto :bash_fallback
)

goto :notification

:bash_fallback
echo.
echo 🔄 bashスクリプトに切り替えています...

REM bashスクリプトが存在するか確認
if exist "git_auto_update.sh" (
    echo bashスクリプトが見つかりました
    bash git_auto_update.sh &
    timeout /t 2 >nul
    tasklist | findstr bash
) else (
    echo ❌ 自動更新スクリプトが見つかりません
    echo 手動で設定してください
    goto :end
)

:notification
echo.
echo 📝 初期通知ファイルを作成しています...

REM 通知ファイル作成
set NOTIFICATION_FILE=🔔_STAMPLESS_UPDATE_NOTIFICATION.md

echo # 🔔 stampless-help-assistant 更新通知 > "%NOTIFICATION_FILE%"
echo. >> "%NOTIFICATION_FILE%"
echo ## ✅ 自動更新設定完了 >> "%NOTIFICATION_FILE%"
echo. >> "%NOTIFICATION_FILE%"
echo **設定日時**: %date% %time% >> "%NOTIFICATION_FILE%"
echo. >> "%NOTIFICATION_FILE%"
echo ### 📊 設定内容 >> "%NOTIFICATION_FILE%"
echo - OS: Windows >> "%NOTIFICATION_FILE%"
echo - リモート更新: 毎日朝10時（日本時間） >> "%NOTIFICATION_FILE%"
echo - ローカル更新: 24時間間隔自動更新 >> "%NOTIFICATION_FILE%"
echo - 通知システム: 自動更新完了通知 >> "%NOTIFICATION_FILE%"
echo. >> "%NOTIFICATION_FILE%"
echo ### 🔗 関連リンク >> "%NOTIFICATION_FILE%"
echo - [GitHub Actions実行状況](https://github.com/moneyforward/stampless_help_assistant/actions) >> "%NOTIFICATION_FILE%"
echo - [設定ガイド](STAMPLESS_GIT_UPDATE_GUIDE.md) >> "%NOTIFICATION_FILE%"
echo - [自動設定ガイド](AUTO_SETUP_GUIDE.md) >> "%NOTIFICATION_FILE%"
echo. >> "%NOTIFICATION_FILE%"
echo --- >> "%NOTIFICATION_FILE%"
echo. >> "%NOTIFICATION_FILE%"
echo *このファイルは自動更新の履歴を記録します* >> "%NOTIFICATION_FILE%"

echo ✅ 通知ファイルを作成しました: %NOTIFICATION_FILE%

echo.
echo 🎉 自動更新設定が完了しました！
echo.
echo 📋 設定内容:
echo    • OS: Windows
echo    • リモート更新: 毎日朝10時（日本時間）
echo    • ローカル更新: 24時間間隔
echo    • 通知ファイル: %NOTIFICATION_FILE%
echo.
echo 🔍 確認方法:
echo    • プロセス確認: tasklist ^| findstr git_auto_update
echo    • 更新履歴: type "%NOTIFICATION_FILE%"
echo    • GitHub Actions: https://github.com/moneyforward/stampless_help_assistant/actions
echo.
echo ⚠️  注意事項:
echo    • Windowsではタスクスケジューラーの使用を推奨します
echo    • 管理者権限が必要な場合があります
echo.
echo 🚀 stampless-help-assistant の自動更新が開始されました！

:end
pause
