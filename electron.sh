#!/bin/bash

# NewsNow Electron 管理脚本
# 使用方法: ./electron.sh [选项]
# 或者不带参数运行会显示交互菜单

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 检查 pnpm 是否安装
check_pnpm() {
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm 未安装"
        echo "请运行: npm install -g pnpm"
        exit 1
    fi
}

# 检查 npx 是否可用
check_npx() {
    if ! command -v npx &> /dev/null; then
        print_error "npx 不可用"
        exit 1
    fi
}

# 清理构建文件
clean() {
    print_info "清理构建文件..."
    rm -rf dist/release
    rm -rf dist/*.js
    rm -rf dist/*.map
    rm -rf electron/*.js
    rm -rf electron/*.js.map
    print_success "清理完成"
}

# 安装依赖
install_deps() {
    print_info "安装依赖..."
    npx pnpm install
    print_success "依赖安装完成"
}

# 生成资源
generate_resources() {
    print_info "生成资源文件..."
    npx pnpm run presource
    print_success "资源生成完成"
}

# 构建前端
build_frontend() {
    print_info "构建前端..."
    npx vite build
    print_success "前端构建完成"
}

# 编译 Electron 文件
compile_electron() {
    print_info "编译 Electron 文件..."
    npx tsc electron/main.ts --outDir dist --module ESNext --target ESNext --moduleResolution bundler --skipLibCheck
    cp electron/preload.js dist/

    if [ ! -f "dist/preload.js" ]; then
        print_error "preload.js 编译失败"
        exit 1
    fi

    print_success "Electron 文件编译完成"
}

# 开发模式运行
dev() {
    print_info "启动开发模式..."
    echo ""

    # 使用 pnpm 运行完整的开发流程
    npx pnpm run electron:dev
}

# 快速重启（仅重新编译 Electron）
quick_restart() {
    print_info "快速重启 Electron..."

    # 停止正在运行的 Electron
    pkill -f "electron.*newsnow" || true

    # 编译 Electron 文件
    compile_electron

    # 启动 Electron
    print_info "启动 Electron..."
    NODE_ENV=development npx electron . &
}

# 构建安装包
build_package() {
    print_info "构建安装包..."

    # 清理旧的构建
    clean

    # 完整构建流程
    generate_resources
    build_frontend
    compile_electron

    # 使用 electron-builder 打包
    print_info "开始打包..."
    npx pnpm run electron:build

    print_success "安装包构建完成！"
    print_info "查看 release/ 目录获取安装包"

    # 列出生成的文件
    if [ -d "release" ]; then
        echo ""
        echo "生成的文件:"
        ls -lh release/ | tail -n +2
    fi
}

# 仅构建前端（不运行）
build_only() {
    print_info "构建项目（不运行）..."
    generate_resources
    build_frontend
    compile_electron
    print_success "构建完成"
}

# 检查运行状态
status() {
    print_info "检查运行状态..."

    # 检查 Electron 进程
    if pgrep -f "electron.*newsnow" > /dev/null; then
        echo "✅ Electron 正在运行"
        ps aux | grep -E "electron.*newsnow|node.*server" | grep -v grep
    else
        echo "❌ Electron 未运行"
    fi

    # 检查服务器进程
    if pgrep -f "node.*dist/output/server" > /dev/null; then
        echo "✅ 后端服务器正在运行"
    else
        echo "❌ 后端服务器未运行"
    fi
}

# 停止所有进程
stop() {
    print_info "停止所有 NewsNow 进程..."
    pkill -f "electron.*newsnow" || print_warning "Electron 进程未运行"
    pkill -f "node.*dist/output/server" || print_warning "服务器进程未运行"
    print_success "所有进程已停止"
}

# 显示帮助
show_help() {
    cat << EOF
NewsNow Electron 管理脚本

用法: ./electron.sh [选项]

选项:
  dev           开发模式运行（默认）
  quick         快速重启（仅重编译 Electron）
  build         构建安装包
  build-only    仅构建（不运行）
  clean         清理构建文件
  install       安装依赖
  status        查看运行状态
  stop          停止所有进程
  help          显示此帮助信息

示例:
  ./electron.sh dev       # 开发模式
  ./electron.sh build     # 构建 dmg/exe
  ./electron.sh quick     # 快速重启

EOF
}

# 交互式菜单
show_menu() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    NewsNow Electron 管理工具         ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
    echo ""
    echo "1) 开发模式运行"
    echo "2) 快速重启 (Quick Restart)"
    echo "3) 构建安装包"
    echo "4) 仅构建 (Build Only)"
    echo "5) 清理构建文件"
    echo "6) 安装依赖"
    echo "7) 查看运行状态"
    echo "8) 停止所有进程"
    echo "0) 退出"
    echo ""
}

# 主函数
main() {
    local command=${1:-}

    # 如果没有参数，显示交互式菜单
    if [ -z "$command" ]; then
        while true; do
            show_menu
            read -p "请选择 [0-8]: " choice

            case $choice in
                1) dev; break ;;
                2) quick_restart; break ;;
                3) build_package; break ;;
                4) build_only; break ;;
                5) clean; break ;;
                6) install_deps; break ;;
                7) status; break ;;
                8) stop; break ;;
                0) echo "退出"; exit 0 ;;
                *) print_error "无效选择，请重试" ;;
            esac
        done
    else
        # 根据参数执行命令
        case $command in
            dev)
                dev
                ;;
            quick)
                quick_restart
                ;;
            build)
                build_package
                ;;
            build-only)
                build_only
                ;;
            clean)
                clean
                ;;
            install)
                install_deps
                ;;
            status)
                status
                ;;
            stop)
                stop
                ;;
            help|--help|-h)
                show_help
                ;;
            *)
                print_error "未知命令: $command"
                show_help
                exit 1
                ;;
        esac
    fi
}

# 运行主函数
main "$@"
