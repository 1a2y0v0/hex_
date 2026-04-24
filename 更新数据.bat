@echo off
chcp 65001 >nul
cd /d D:\vsco_file\hex_

echo ================================
echo  海克斯积分数据自动更新工具
echo ================================
echo.
echo 正在读取 Excel 并生成 data.js ...
echo.

node auto_update.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ data.js 更新失败，请检查错误信息。
    pause
    exit /b
)

echo.
echo ================================
echo  已成功生成 data.js 文件
echo ================================
echo.
set /p confirm="是否推送到 GitHub 并更新网页？(Y/N): "

if /i "%confirm%"=="Y" (
    echo.
    echo 正在提交到 GitHub...
    git add data.js
    git commit -m "更新积分数据"
    git push origin main

    if %errorlevel% equ 0 (
        echo.
        echo ✅ 推送成功！网页将在 1-2 分钟后更新。
    ) else (
        echo.
        echo ❌ 推送失败，请检查 Git 配置或网络。
    )
) else (
    echo.
    echo ⚠️ 已跳过推送，data.js 仅在本地更新。
)

echo.
pause