#!/usr/bin/env bash
# 快速启动脚本 - 本地测试网站

echo "================================================"
echo "  西方哲学史时间线 - 本地服务器启动"
echo "================================================"
echo ""

# 检查是否在正确的目录
if [ ! -f "philosophy-timeline.html" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

echo "✓ 检查到项目文件"
echo ""

# 选择服务器类型
if command -v python3 &> /dev/null; then
    echo "🐍 使用 Python 启动服务器..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🐍 使用 Python 启动服务器..."
    python -m http.server 8000
elif command -v node &> /dev/null; then
    echo "📦 使用 Node.js 启动服务器..."
    npx http-server
else
    echo "❌ 错误：未找到 Python 或 Node.js"
    echo "请安装 Python 3 或 Node.js"
    exit 1
fi

echo ""
echo "🌐 服务器已启动，请访问: http://localhost:8000/philosophy-timeline.html"
echo "按 Ctrl+C 停止服务器"
