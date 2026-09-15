# Thief Book

一个摸鱼看书神器：在 VS Code / Cursor **状态栏**阅读 TXT / EPUB 小说，支持翻页、跳转与文本搜索。

![](./images/1.png)

## 功能

- 支持 **TXT**、**EPUB**（按扩展名自动识别）
- 内容显示在状态栏，翻页不打断编码
- **老板键**：状态栏切换为随机 Hello World 代码
- **搜索**：关键词匹配，从列表选择后跳转到对应页
- 页码保存在设置中，重启可继续阅读

## 安装

**市场安装**

- [VS Code Marketplace - Thief-Book](https://marketplace.visualstudio.com/items?itemName=C-TEAM.thief-book)

**本地 VSIX 安装**

1. 按下方「开发与打包」生成 `.vsix`
2. 扩展视图 → `...` → **从 VSIX 安装**，或：

```bash
code --install-extension ./thief-book-0.2.1.vsix
# Cursor:
# cursor --install-extension ./thief-book-0.2.1.vsix
```

## PC 版本

功能更丰富、更隐蔽的桌面版：[cteams/Thief-Book](https://github.com/cteams/Thief-Book)

## 默认配置

> 必须填写小说文件的**绝对路径**后才能阅读 / 搜索。

在设置中搜索 `Thief-Book`，或直接编辑：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `thiefBook.filePath` | 空 | TXT 或 EPUB 绝对路径 |
| `thiefBook.currPageNumber` | `1` | 当前页（改完后可用跳转快捷键刷新） |
| `thiefBook.pageSize` | `50` | 每页字符数 |
| `thiefBook.isEnglish` | `false` | 英文书勾选后，每页按 `pageSize × 2` 计算 |
| `thiefBook.lineBreak` | 一个空格 | 原文换行替换成的分隔符 |

### 路径格式

- **Mac / Linux**：`/opt/test/name.txt` 或 `/opt/test/name.epub`
- **Windows**：`C:/Users/Administrator/Desktop/name.txt`  
  或 `C:\\Users\\Administrator\\Desktop\\name.txt`

## 快捷键

> 未设置 `thiefBook.filePath` 时，翻页 / 搜索会提示先配置路径。

| 功能 | macOS | Windows / Linux | 说明 |
|------|-------|-----------------|------|
| 老板键 | `Cmd+M` | `Ctrl+M` | 随时可用 |
| 上一页 | `Cmd+,` | `Ctrl+Alt+,` | 需编辑器文本焦点 |
| 下一页 | `Cmd+.` | `Ctrl+Alt+.` | 需编辑器文本焦点 |
| 跳转 | `Cmd+;` | `Ctrl+Alt+;` | 按设置中的当前页刷新状态栏 |
| 搜索 | `Cmd+Alt+F` | `Ctrl+Alt+F` | 输入关键词 → 选择命中 → 跳页 |

也可在命令面板搜索：`thief-book.Search`、`thief-book.NextBook` 等。

### 修改快捷键

![](./images/2.png)

![](./images/3.png)

## 开发与打包

本项目使用 **npm** 管理依赖（请使用 `package-lock.json`，不要再使用 yarn）。

```bash
# 安装依赖
npm install

# 编译 TypeScript → out/
npm run compile

# 监听模式
npm run watch

# 打包为 VSIX（需已安装 @vscode/vsce）
npm install -g @vscode/vsce
npm run package
# 或：npx @vscode/vsce package
```

本地调试：用 VS Code / Cursor 打开本仓库，按 **F5** 启动扩展开发宿主。

---

# Thief Book (English)

Read novels in the VS Code / Cursor **status bar**. Supports TXT / EPUB, paging, jump, and text search.

## Features

- **TXT** and **EPUB** (auto-detected by extension)
- Content shown in the status bar
- **Boss key**: replace status text with random Hello World snippets
- **Search**: substring match → pick a hit → jump to that page
- Current page stored in settings

## Install

- [Marketplace](https://marketplace.visualstudio.com/items?itemName=C-TEAM.thief-book)
- Or install a local `.vsix` (see **Develop & package** below)

## Desktop app

https://github.com/cteams/Thief-Book

## Configuration

> Set an absolute path in `thiefBook.filePath` before reading or searching.

| Setting | Default | Description |
|---------|---------|-------------|
| `thiefBook.filePath` | empty | Absolute path to TXT or EPUB |
| `thiefBook.currPageNumber` | `1` | Current page |
| `thiefBook.pageSize` | `50` | Characters per page |
| `thiefBook.isEnglish` | `false` | If true, page size = `pageSize × 2` |
| `thiefBook.lineBreak` | space | Replacement for newlines |

### Path examples

- **Mac / Linux**: `/opt/test/name.txt`
- **Windows**: `C:/Users/Administrator/Desktop/name.txt`

## Shortcuts

| Action | macOS | Windows / Linux | Notes |
|--------|-------|-----------------|-------|
| Boss key | `Cmd+M` | `Ctrl+M` | Always |
| Previous | `Cmd+,` | `Ctrl+Alt+,` | Requires editor text focus |
| Next | `Cmd+.` | `Ctrl+Alt+.` | Requires editor text focus |
| Jump | `Cmd+;` | `Ctrl+Alt+;` | Uses current page from settings |
| Search | `Cmd+Alt+F` | `Ctrl+Alt+F` | Keyword → pick match → jump |

## Develop & package

This project uses **npm** (`package-lock.json`). Do not use yarn.

```bash
npm install
npm run compile
npm run watch
npm install -g @vscode/vsce
npm run package
```

Press **F5** in VS Code / Cursor to debug the extension.

**Enjoy!**
