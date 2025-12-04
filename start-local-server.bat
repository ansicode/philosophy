@echo off
REM 快速启动脚本 (Windows) - 本地测试网站

echo.
echo ================================================
echo   西方哲学史时间线 - 本地服务器启动
echo ================================================
echo.

REM 检查是否在正确的目录
if not exist "philosophy-timeline.html" (
    echo [错误] 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo [✓] 检查到项目文件
echo.

REM 尝试用 Python 启动
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [启动] 使用 Python 启动服务器...
    echo.
    python -m http.server 8000
    goto :end
)

REM 如果 Python 不可用，尝试 Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [启动] 使用 Node.js 启动服务器...
    echo.
    npx http-server
    goto :end
)

REM 都不可用
echo [错误] 未找到 Python 或 Node.js
echo.
echo 请安装以下之一：
echo 1. Python 3: https://www.python.org/downloads/
echo 2. Node.js: https://nodejs.org/
echo.
pause
exit /b 1

:end
echo.
echo [信息] 按 Ctrl+C 停止服务器
echo.
