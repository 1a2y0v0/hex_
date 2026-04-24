chcp 65001 >nul
@echo off
cd /d D:\vsco_file\hex_
node auto_update.js
echo.
echo 按任意键提交到 GitHub...
pause > nul

git add data.js
git commit -m "更新积分数据"
git push origin main
echo.
echo 完成！网页将在1-2分钟后更新。
pause