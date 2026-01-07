# NewsNow Electron 桌面应用

## 快速开始

### 方式 1：使用脚本（推荐）

```bash
# 交互式菜单
./electron.sh

# 或者直接运行开发模式
./electron.sh dev

# 快速重启（仅重编译 Electron）
./electron.sh quick

# 构建安装包
./electron.sh build

# 查看运行状态
./electron.sh status

# 停止所有进程
./electron.sh stop
```

### 方式 2：使用 npm 脚本

```bash
# 开发模式
npm run electron:dev

# 构建安装包
npm run electron:build

# 查看运行状态
npm run electron:status

# 停止进程
npm run electron:stop

# 清理构建文件
npm run electron:clean
```

## 功能说明

### 开发模式 (dev)
完整的开发环境启动流程：
1. 生成资源文件
2. 构建前端
3. 编译 Electron 文件
4. 启动 Nitro 后端服务器
5. 启动 Electron 窗口
6. 自动打开 DevTools

### 快速重启 (quick)
仅重新编译 Electron 文件并重启，适合快速调试：
- 不重新构建前端
- 不重新生成资源
- 仅重编译 main.ts 和 preload.js

### 构建安装包 (build)
生成可分发的安装包：
- macOS: `.dmg` 文件
- Windows: `.exe` 文件
- Linux: `.AppImage` 文件

输出目录：`release/`

### 仅构建 (build-only)
构建所有文件但不运行应用

### 清理 (clean)
删除所有构建生成的文件

### 状态查看 (status)
显示当前运行的进程状态

### 停止 (stop)
停止所有 NewsNow 相关进程

## 项目结构

```
newsnow/
├── electron/
│   ├── main.ts           # Electron 主进程
│   ├── preload.ts        # Preload 脚本
│   ├── preload.js        # 编译后的 preload
│   └── tsconfig.json     # Electron TypeScript 配置
├── dist/
│   ├── main.js          # 编译后的主进程
│   ├── preload.js       # Preload 脚本
│   ├── output/server/   # Nitro 后端服务器
│   └── ...              # 前端构建文件
├── release/             # 生成的安装包目录
└── electron.sh          # 管理脚本
```

## 工作原理

1. **Nitro 后端服务器**
   - 运行在 `http://localhost:3000`
   - 提供 API 接口
   - 数据缓存和新闻源抓取

2. **Electron 主进程**
   - 启动时自动启动 Nitro 服务器
   - 加载前端应用
   - 管理窗口生命周期

3. **前端应用**
   - 通过 `http://localhost:3000` 与后端通信
   - React 应用 + TanStack Router
   - 显示新闻内容

## 开发提示

### 修改前端代码
需要重新运行 `./electron.sh dev`

### 修改 Electron 代码（main.ts/preload.js）
可以使用快速重启：
```bash
./electron.sh quick
```

### 调试
- DevTools 会自动打开
- 后端服务器日志会显示在终端
- 检查 `Console` 标签查看前端错误
- 检查 `Network` 标签查看 API 请求

### 常见问题

**端口 3000 被占用**
```bash
# 查找并停止占用进程
lsof -ti:3000 | xargs kill -9
```

**Electron 无法启动**
```bash
# 重新安装 Electron
npx pnpm rebuild electron
```

**构建失败**
```bash
# 清理并重新构建
./electron.sh clean
./electron.sh build
```

## 分发

构建完成后，安装包位于 `release/` 目录：

- **macOS**: 拖拽 `.dmg` 文件到 Applications 文件夹
- **Windows**: 双击 `.exe` 文件安装
- **Linux**: 运行 `.AppImage` 文件

## 许可证

MIT
