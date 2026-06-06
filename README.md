<p align="center">
  <a href="#简体中文">简体中文</a> | <a href="#繁體中文">繁體中文</a> | <a href="#english">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/zero-dependencies-✓-brightgreen.svg" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/pure-frontend-orange.svg" alt="Pure Frontend">
  <img src="https://img.shields.io/badge/ES2022+-yellow.svg" alt="ES2022+">
  <img src="https://img.shields.io/badge/lines_of_code-6037-blueviolet.svg" alt="6037 Lines">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-✓-4285F4.svg" alt="Chrome">
  <img src="https://img.shields.io/badge/Edge-✓-0078D7.svg" alt="Edge">
  <img src="https://img.shields.io/badge/Safari-✓-FF9500.svg" alt="Safari">
  <img src="https://img.shields.io/badge/Firefox-⚠️-FF7139.svg" alt="Firefox (Limited)">
</p>

---

# 简体中文

<div align="center">

# 🎙️ VoicePilot Studio

**轻量级 AI 语音交互桌面引擎**

一个零依赖、纯前端的 AI 语音交互引擎，打开浏览器即可与 AI 自然对话。

[![GitHub stars](https://img.shields.io/github/stars/gitstq/VoicePilot-Studio?style=social)](https://github.com/gitstq/VoicePilot-Studio)
[![GitHub forks](https://img.shields.io/github/forks/gitstq/VoicePilot-Studio?style=social)](https://github.com/gitstq/VoicePilot-Studio)

</div>

---

## 🎉 项目介绍

### 它是什么？

VoicePilot Studio 是一款**轻量级 AI 语音交互桌面引擎**，专为希望在浏览器中实现自然语音对话的用户而设计。它将大语言模型（LLM）的智能对话能力与语音识别、语音合成、虚拟形象动画融为一体，打造出沉浸式的 AI 交互体验。

### 解决什么痛点？

- **部署门槛高**：现有方案（如 Open-LLM-VTuber）通常需要 Python、Node.js 等运行时环境和复杂的依赖链，对非技术用户极不友好。
- **模型绑定强**：多数项目与特定 LLM 深度耦合，切换模型成本高昂。
- **隐私顾虑**：数据需要经过第三方服务器中转，用户对数据安全缺乏掌控感。
- **体积臃肿**：动辄数百 MB 的安装包，仅仅为了一个语音对话功能显得过于沉重。

### 差异化亮点

| 特性 | VoicePilot Studio | Open-LLM-VTuber | 其他同类方案 |
|------|-------------------|-----------------|-------------|
| **运行依赖** | 零依赖，纯前端 | Python + 依赖链 | Node.js / Python |
| **启动方式** | 浏览器直接打开 | 命令行启动 | 需要构建/编译 |
| **代码规模** | 6037 行 | 数万行 | 不等 |
| **LLM 支持** | 多模型自由切换 | 绑定特定模型 | 因项目而异 |
| **数据隐私** | 完全本地运行 | 部分本地 | 多数需云端 |
| **部署难度** | 零配置 | 中等 | 中等到高 |

### 灵感来源

灵感源自对 AI 虚拟主播（VTuber）和语音助手产品的观察——它们功能强大，但普通开发者很难快速上手搭建属于自己的语音交互系统。VoicePilot Studio 的目标是让任何人都能在 **30 秒内** 启动一个功能完整的 AI 语音对话引擎。

---

## ✨ 核心特性

- 🤖 **多 LLM API 支持** — 兼容 OpenAI GPT-4o、Anthropic Claude、Google Gemini、DeepSeek、GLM-5.1 以及**任意 OpenAI 兼容 API**，自由切换不锁定。
- 🎤 **语音识别 (STT)** — 基于 Web Speech API，支持多语种实时语音转文字，**无需额外服务**。
- 🔊 **语音合成 (TTS)** — 利用 Web Speech Synthesis API，将 AI 回复自然朗读出来，语速、音调可调。
- ✂️ **语音打断** — 智能检测用户说话时自动停止 TTS 播放，实现自然的中断式对话体验。
- 🎭 **Canvas 虚拟形象动画引擎** — 内置 4 种状态（idle / listening / speaking / thinking）、4 种表情、**嘴型同步**与眨眼动画，让 AI 不再只是文字框。
- 📊 **实时音频可视化** — Web Audio API 频谱分析与波形绘制，让声音"看得见"。
- 💬 **多会话管理** — 创建、切换、删除、重命名会话，数据通过 **localStorage 持久化**，刷新不丢失。
- 🌍 **国际化 (i18n)** — 内置简体中文、繁体中文、English、日本語四种语言，一键切换。
- 🌗 **深色 / 浅色主题** — 跟随系统或手动切换，保护你的眼睛。
- 📤 **对话导出** — 支持 Markdown 和 JSON 两种格式，方便记录和分享。
- ⚡ **流式 SSE 响应** — AI 回复逐字输出，体验更流畅，等待更短。
- 📱 **响应式布局** — 桌面端、平板、手机均可使用，跨平台无障碍。

---

## 🚀 快速开始

### 环境要求

- **浏览器**：Chrome 89+、Edge 89+、Safari 14.1+（推荐使用 Chrome 或 Edge 以获得最佳 Web Speech API 兼容性）
- **网络**：需要访问所选 LLM API 的网络连接
- **无需安装**：不需要 Node.js、Python 或任何构建工具

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/gitstq/VoicePilot-Studio.git

# 进入项目目录
cd VoicePilot-Studio
```

### 本地启动

**方式一：直接打开（最简单）**

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

**方式二：使用本地静态服务器（推荐用于开发调试）**

```bash
# 使用 Python 内置服务器
python3 -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server -p 8080

# 或使用 VS Code 的 Live Server 插件
# 右键 index.html -> Open with Live Server
```

然后在浏览器中访问 `http://localhost:8080`。

> **提示**：直接用浏览器打开 `index.html` 即可正常使用，静态服务器主要用于避免某些浏览器的 CORS 限制。

---

## 📖 详细使用指南

### LLM API 配置

首次使用需要配置至少一个 LLM API。点击界面右上角的 **设置图标** 进入配置页面。

**支持的 API 类型：**

| API 提供商 | 模型示例 | 需要的信息 |
|-----------|---------|-----------|
| OpenAI | GPT-4o, GPT-4o-mini | API Key, API Base URL |
| Anthropic | Claude 3.5 Sonnet | API Key |
| Google | Gemini Pro | API Key |
| DeepSeek | DeepSeek Chat | API Key, API Base URL |
| GLM | GLM-5.1 | API Key, API Base URL |
| 自定义 | 任意 OpenAI 兼容 API | API Key, API Base URL, 模型名称 |

**配置步骤：**

1. 打开设置面板
2. 选择 API 提供商类型
3. 填入对应的 API Key
4. 如使用自定义 API，填写 API Base URL 和模型名称
5. 点击"保存配置"

> **注意**：API Key 仅存储在浏览器本地，**不会上传到任何服务器**。

### 语音交互

1. **开始对话**：点击界面中的麦克风按钮或按 `Space` 键开始语音输入
2. **查看识别结果**：语音会被实时转为文字并显示在输入区域
3. **AI 回复**：AI 的回复会以语音和文字两种形式同步呈现
4. **打断 AI**：在 AI 说话时直接开口，系统会自动检测并停止播放
5. **手动输入**：也可以直接在文本框中键入文字发送

### 虚拟形象自定义

Canvas 虚拟形象引擎支持以下自定义选项：

- **状态动画**：idle（待机）、listening（聆听）、speaking（说话）、thinking（思考）
- **表情系统**：4 种表情自动切换，与对话内容情绪关联
- **嘴型同步**：根据 TTS 音频数据实时驱动嘴型开合
- **眨眼动画**：自然的随机眨眼效果

### 会话管理

- **创建会话**：点击侧边栏的"+"按钮新建会话
- **切换会话**：点击侧边栏中的会话名称即可切换
- **重命名**：右键点击会话名称选择"重命名"
- **删除**：右键点击会话名称选择"删除"
- **持久化**：所有会话数据自动保存在 localStorage 中

### 对话导出

点击会话面板中的导出按钮，选择格式：

- **Markdown (.md)**：适合阅读和笔记
- **JSON (.json)**：适合程序处理和数据分析

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` | 开始/停止语音输入 |
| `Enter` | 发送文本消息 |
| `Shift + Enter` | 换行 |
| `Esc` | 关闭设置面板 |
| `Ctrl/Cmd + E` | 导出当前对话 |

---

## 💡 设计思路与迭代规划

### 设计理念

VoicePilot Studio 遵循三个核心设计原则：

1. **零门槛**：用户不需要任何编程基础，不需要安装任何软件，打开浏览器就能用。
2. **隐私优先**：所有数据（对话记录、API Key）都存储在用户本地设备上，绝不上传至第三方服务器。
3. **开放兼容**：不绑定任何特定 LLM 提供商，用户可以自由选择最适合自己的 AI 模型。

### 技术选型原因

| 技术选择 | 原因 |
|---------|------|
| **纯 HTML/CSS/JS** | 零构建依赖，浏览器原生支持，部署最简 |
| **Web Speech API** | 浏览器内置语音能力，无需第三方 STT/TTS 服务 |
| **Canvas API** | 高性能 2D 动画渲染，适合虚拟形象引擎 |
| **Web Audio API** | 实时音频分析，驱动可视化与嘴型同步 |
| **SSE (Server-Sent Events)** | 轻量级流式传输，实现逐字输出效果 |
| **localStorage** | 无服务器的本地数据持久化方案 |

### 后续迭代计划

- [ ] **更多 LLM 接入**：支持 Mistral、Llama、Qwen 等更多模型
- [ ] **虚拟形象编辑器**：可视化自定义虚拟形象外观
- [ ] **插件系统**：支持第三方功能扩展
- [ ] **语音唤醒词**：自定义唤醒词，无需手动点击
- [ ] **多轮对话上下文管理**：更灵活的上下文窗口控制
- [ ] **PWA 支持**：离线使用、桌面快捷方式
- [ ] **WebSocket 备选传输**：为不支持 SSE 的 API 提供替代方案

### 社区贡献方向

我们欢迎以下方向的贡献：

- 🌍 **新增语言翻译**：帮助完善国际化支持
- 🎨 **UI/UX 改进**：界面设计与交互优化
- 🤖 **LLM 适配**：为新模型编写 API 适配层
- 📚 **文档完善**：教程、使用案例、FAQ
- 🐛 **Bug 修复**：问题报告与修复

---

## 📦 部署指南

### 本地运行

最简单的方式——直接用浏览器打开 `index.html` 文件即可。

### 静态服务器部署

将项目文件部署到任意静态文件服务器：

```bash
# Nginx 示例配置
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/VoicePilot-Studio;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Apache 示例配置
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/VoicePilot-Studio
    DirectoryIndex index.html
</VirtualHost>
```

### 嵌入到现有项目

VoicePilot Studio 可以轻松嵌入到任何 Web 项目中：

```html
<!-- 作为 iframe 嵌入 -->
<iframe
    src="https://your-domain.com/VoicePilot-Studio/index.html"
    width="100%"
    height="600"
    frameborder="0"
    allow="microphone"
></iframe>
```

```html
<!-- 作为 Web Component 嵌入（未来支持） -->
<voice-pilot-studio
    api-key="your-api-key"
    model="gpt-4o"
    lang="zh-CN"
></voice-pilot-studio>
```

---

## 🤝 贡献指南

### PR 提交规范

我们采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>
```

**type 类型：**

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式调整（不影响功能） |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `i18n` | 国际化相关 |
| `chore` | 构建/工具链变更 |

**提交示例：**

```bash
git commit -m "feat(avatar): add blinking animation to idle state"
git commit -m "fix(speech): resolve TTS interruption on Chrome 91"
git commit -m "i18n: add Japanese translation"
```

### Issue 反馈规则

提交 Issue 时请包含以下信息：

1. **浏览器及版本**（如 Chrome 120）
2. **操作系统**（如 macOS 14.2）
3. **问题复现步骤**
4. **预期行为与实际行为**
5. **控制台错误信息**（如有）

### 开发环境搭建

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/<your-username>/VoicePilot-Studio.git

# 2. 创建特性分支
git checkout -b feature/your-feature-name

# 3. 启动本地服务器进行开发
python3 -m http.server 8080
# 或
npx http-server -p 8080

# 4. 在浏览器中打开 http://localhost:8080 进行测试

# 5. 提交并推送
git add .
git commit -m "feat(scope): your feature description"
git push origin feature/your-feature-name

# 6. 创建 Pull Request
```

---

## 📄 开源协议

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。

```
MIT License

Copyright (c) 2024 VoicePilot Studio Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**用最简单的方式，开启 AI 语音交互之旅。** ⭐ 如果这个项目对你有帮助，欢迎 Star！

</div>

---
---

# 繁體中文

<div align="center">

# 🎙️ VoicePilot Studio

**輕量級 AI 語音互動桌面引擎**

一個零依賴、純前端的 AI 語音互動引擎，打開瀏覽器即可與 AI 自然對話。

[![GitHub stars](https://img.shields.io/github/stars/gitstq/VoicePilot-Studio?style=social)](https://github.com/gitstq/VoicePilot-Studio)
[![GitHub forks](https://img.shields.io/github/forks/gitstq/VoicePilot-Studio?style=social)](https://github.com/gitstq/VoicePilot-Studio)

</div>

---

## 🎉 專案介紹

### 它是什麼？

VoicePilot Studio 是一款**輕量級 AI 語音互動桌面引擎**，專為希望在瀏覽器中實現自然語音對話的使用者而設計。它將大型語言模型（LLM）的智慧對話能力與語音辨識、語音合成、虛擬形象動畫融為一體，打造出沉浸式的 AI 互動體驗。

### 解決什麼痛點？

- **部署門檻高**：現有方案（如 Open-LLM-VTuber）通常需要 Python、Node.js 等執行環境和複雜的依賴鏈，對非技術使用者極不友善。
- **模型綁定強**：多數專案與特定 LLM 深度耦合，切換模型成本高昂。
- **隱私顧慮**：資料需要經過第三方伺服器中轉，使用者對資料安全缺乏掌控感。
- **體積臃腫**：動輒數百 MB 的安裝包，僅僅為了一個語音對話功能顯得過於沉重。

### 差異化亮點

| 特性 | VoicePilot Studio | Open-LLM-VTuber | 其他同類方案 |
|------|-------------------|-----------------|-------------|
| **執行依賴** | 零依賴，純前端 | Python + 依賴鏈 | Node.js / Python |
| **啟動方式** | 瀏覽器直接開啟 | 命令列啟動 | 需要建置/編譯 |
| **程式碼規模** | 6037 行 | 數萬行 | 不等 |
| **LLM 支援** | 多模型自由切換 | 綁定特定模型 | 因專案而異 |
| **資料隱私** | 完全本地執行 | 部分本地 | 多數需雲端 |
| **部署難度** | 零設定 | 中等 | 中等到高 |

### 靈感來源

靈感源自對 AI 虛擬主播（VTuber）和語音助理產品的觀察——它們功能強大，但普通開發者很難快速上手搭建屬於自己的語音互動系統。VoicePilot Studio 的目標是讓任何人都能在 **30 秒內** 啟動一個功能完整的 AI 語音對話引擎。

---

## ✨ 核心特性

- 🤖 **多 LLM API 支援** — 相容 OpenAI GPT-4o、Anthropic Claude、Google Gemini、DeepSeek、GLM-5.1 以及**任意 OpenAI 相容 API**，自由切換不鎖定。
- 🎤 **語音辨識 (STT)** — 基於 Web Speech API，支援多語系即時語音轉文字，**無需額外服務**。
- 🔊 **語音合成 (TTS)** — 利用 Web Speech Synthesis API，將 AI 回覆自然朗讀出來，語速、音調可調。
- ✂️ **語音打斷** — 智慧偵測使用者說話時自動停止 TTS 播放，實現自然的中斷式對話體驗。
- 🎭 **Canvas 虛擬形象動畫引擎** — 內建 4 種狀態（idle / listening / speaking / thinking）、4 種表情、**嘴型同步**與眨眼動畫，讓 AI 不再只是文字框。
- 📊 **即時音訊視覺化** — Web Audio API 頻譜分析與波形繪製，讓聲音「看得見」。
- 💬 **多會話管理** — 建立、切換、刪除、重新命名會話，資料透過 **localStorage 持久化**，重新整理不遺失。
- 🌍 **國際化 (i18n)** — 內建簡體中文、繁體中文、English、日本語四種語言，一鍵切換。
- 🌗 **深色 / 淺色主題** — 跟隨系統或手動切換，保護你的眼睛。
- 📤 **對話匯出** — 支援 Markdown 和 JSON 兩種格式，方便記錄和分享。
- ⚡ **串流 SSE 回應** — AI 回覆逐字輸出，體驗更流暢，等待更短。
- 📱 **響應式佈局** — 桌面端、平板、手機均可使用，跨平台無障礙。

---

## 🚀 快速開始

### 環境需求

- **瀏覽器**：Chrome 89+、Edge 89+、Safari 14.1+（建議使用 Chrome 或 Edge 以獲得最佳 Web Speech API 相容性）
- **網路**：需要存取所選 LLM API 的網路連線
- **無需安裝**：不需要 Node.js、Python 或任何建置工具

### 安裝步驟

```bash
# 克隆儲存庫
git clone https://github.com/gitstq/VoicePilot-Studio.git

# 進入專案目錄
cd VoicePilot-Studio
```

### 本地啟動

**方式一：直接開啟（最簡單）**

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

**方式二：使用本地靜態伺服器（建議用於開發除錯）**

```bash
# 使用 Python 內建伺服器
python3 -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server -p 8080

# 或使用 VS Code 的 Live Server 套件
# 右鍵 index.html -> Open with Live Server
```

然後在瀏覽器中前往 `http://localhost:8080`。

> **提示**：直接用瀏覽器開啟 `index.html` 即可正常使用，靜態伺服器主要用於避免某些瀏覽器的 CORS 限制。

---

## 📖 詳細使用指南

### LLM API 設定

首次使用需要設定至少一個 LLM API。點擊介面右上角的 **設定圖示** 進入設定頁面。

**支援的 API 類型：**

| API 提供商 | 模型範例 | 需要的資訊 |
|-----------|---------|-----------|
| OpenAI | GPT-4o, GPT-4o-mini | API Key, API Base URL |
| Anthropic | Claude 3.5 Sonnet | API Key |
| Google | Gemini Pro | API Key |
| DeepSeek | DeepSeek Chat | API Key, API Base URL |
| GLM | GLM-5.1 | API Key, API Base URL |
| 自訂 | 任意 OpenAI 相容 API | API Key, API Base URL, 模型名稱 |

**設定步驟：**

1. 開啟設定面板
2. 選擇 API 提供商類型
3. 填入對應的 API Key
4. 如使用自訂 API，填寫 API Base URL 和模型名稱
5. 點擊「儲存設定」

> **注意**：API Key 僅儲存在瀏覽器本地，**不會上傳到任何伺服器**。

### 語音互動

1. **開始對話**：點擊介面中的麥克風按鈕或按 `Space` 鍵開始語音輸入
2. **查看辨識結果**：語音會被即時轉為文字並顯示在輸入區域
3. **AI 回覆**：AI 的回覆會以語音和文字兩種形式同步呈現
4. **打斷 AI**：在 AI 說話時直接開口，系統會自動偵測並停止播放
5. **手動輸入**：也可以直接在文字框中鍵入文字發送

### 虛擬形象自訂

Canvas 虛擬形象引擎支援以下自訂選項：

- **狀態動畫**：idle（待機）、listening（聆聽）、speaking（說話）、thinking（思考）
- **表情系統**：4 種表情自動切換，與對話內容情緒關聯
- **嘴型同步**：根據 TTS 音訊資料即時驅動嘴型開合
- **眨眼動畫**：自然的隨機眨眼效果

### 會話管理

- **建立會話**：點擊側邊欄的「+」按鈕新建會話
- **切換會話**：點擊側邊欄中的會話名稱即可切換
- **重新命名**：右鍵點擊會話名稱選擇「重新命名」
- **刪除**：右鍵點擊會話名稱選擇「刪除」
- **持久化**：所有會話資料自動儲存在 localStorage 中

### 對話匯出

點擊會話面板中的匯出按鈕，選擇格式：

- **Markdown (.md)**：適合閱讀和筆記
- **JSON (.json)**：適合程式處理和資料分析

### 快捷鍵

| 快捷鍵 | 功能 |
|--------|------|
| `Space` | 開始/停止語音輸入 |
| `Enter` | 發送文字訊息 |
| `Shift + Enter` | 換行 |
| `Esc` | 關閉設定面板 |
| `Ctrl/Cmd + E` | 匯出目前對話 |

---

## 💡 設計思路與迭代規劃

### 設計理念

VoicePilot Studio 遵循三個核心設計原則：

1. **零門檻**：使用者不需要任何程式設計基礎，不需要安裝任何軟體，打開瀏覽器就能用。
2. **隱私優先**：所有資料（對話記錄、API Key）都儲存在使用者本地裝置上，絕不上傳至第三方伺服器。
3. **開放相容**：不綁定任何特定 LLM 提供商，使用者可以自由選擇最適合自己的 AI 模型。

### 技術選型原因

| 技術選擇 | 原因 |
|---------|------|
| **純 HTML/CSS/JS** | 零建置依賴，瀏覽器原生支援，部署最簡 |
| **Web Speech API** | 瀏覽器內建語音能力，無需第三方 STT/TTS 服務 |
| **Canvas API** | 高效能 2D 動畫渲染，適合虛擬形象引擎 |
| **Web Audio API** | 即時音訊分析，驅動視覺化與嘴型同步 |
| **SSE (Server-Sent Events)** | 輕量級串流傳輸，實現逐字輸出效果 |
| **localStorage** | 無伺服器的本地資料持久化方案 |

### 後續迭代計畫

- [ ] **更多 LLM 接入**：支援 Mistral、Llama、Qwen 等更多模型
- [ ] **虛擬形象編輯器**：視覺化自訂虛擬形象外觀
- [ ] **外掛系統**：支援第三方功能擴充
- [ ] **語音喚醒詞**：自訂喚醒詞，無需手動點擊
- [ ] **多輪對話上下文管理**：更靈活的上下文視窗控制
- [ ] **PWA 支援**：離線使用、桌面捷徑
- [ ] **WebSocket 備選傳輸**：為不支援 SSE 的 API 提供替代方案

### 社群貢獻方向

我們歡迎以下方向的貢獻：

- 🌍 **新增語言翻譯**：幫助完善國際化支援
- 🎨 **UI/UX 改進**：介面設計與互動優化
- 🤖 **LLM 适配**：為新模型撰寫 API 适配層
- 📚 **文件完善**：教學、使用案例、FAQ
- 🐛 **Bug 修復**：問題回報與修復

---

## 📦 部署指南

### 本地執行

最簡單的方式——直接用瀏覽器開啟 `index.html` 檔案即可。

### 靜態伺服器部署

將專案檔案部署到任意靜態檔案伺服器：

```nginx
# Nginx 範例設定
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/VoicePilot-Studio;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```apache
# Apache 範例設定
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/VoicePilot-Studio
    DirectoryIndex index.html
</VirtualHost>
```

### 嵌入到現有專案

VoicePilot Studio 可以輕鬆嵌入到任何 Web 專案中：

```html
<!-- 作為 iframe 嵌入 -->
<iframe
    src="https://your-domain.com/VoicePilot-Studio/index.html"
    width="100%"
    height="600"
    frameborder="0"
    allow="microphone"
></iframe>
```

```html
<!-- 作為 Web Component 嵌入（未來支援） -->
<voice-pilot-studio
    api-key="your-api-key"
    model="gpt-4o"
    lang="zh-TW"
></voice-pilot-studio>
```

---

## 🤝 貢獻指南

### PR 提交規範

我們採用 [Conventional Commits](https://www.conventionalcommits.org/) 規範：

```
<type>(<scope>): <subject>

<body>
```

**type 類型：**

| 類型 | 說明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修復 |
| `docs` | 文件更新 |
| `style` | 程式碼格式調整（不影響功能） |
| `refactor` | 程式碼重構 |
| `perf` | 效能優化 |
| `i18n` | 國際化相關 |
| `chore` | 建置/工具鏈變更 |

**提交範例：**

```bash
git commit -m "feat(avatar): add blinking animation to idle state"
git commit -m "fix(speech): resolve TTS interruption on Chrome 91"
git commit -m "i18n: add Japanese translation"
```

### Issue 回報規則

提交 Issue 時請包含以下資訊：

1. **瀏覽器及版本**（如 Chrome 120）
2. **作業系統**（如 macOS 14.2）
3. **問題重現步驟**
4. **預期行為與實際行為**
5. **主控台錯誤資訊**（如有）

### 開發環境搭建

```bash
# 1. Fork 並克隆儲存庫
git clone https://github.com/<your-username>/VoicePilot-Studio.git

# 2. 建立特性分支
git checkout -b feature/your-feature-name

# 3. 啟動本地伺服器進行開發
python3 -m http.server 8080
# 或
npx http-server -p 8080

# 4. 在瀏覽器中開啟 http://localhost:8080 進行測試

# 5. 提交並推送
git add .
git commit -m "feat(scope): your feature description"
git push origin feature/your-feature-name

# 6. 建立 Pull Request
```

---

## 📄 開源授權

本專案基於 [MIT License](https://opensource.org/licenses/MIT) 開源。

```
MIT License

Copyright (c) 2024 VoicePilot Studio Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**用最簡單的方式，開啟 AI 語音互動之旅。** ⭐ 如果這個專案對你有幫助，歡迎 Star！

</div>

---
---

# English

<div align="center">

# 🎙️ VoicePilot Studio

**A Lightweight AI Voice Interaction Desktop Engine**

A zero-dependency, pure-frontend AI voice interaction engine. Open your browser and start talking to AI naturally.

[![GitHub stars](https://img.shields.io/github/stars/gitstq/VoicePilot-Studio?style=social)](https://github.com/gitstq/VoicePilot-Studio)
[![GitHub forks](https://img.shields.io/github/forks/gitstq/VoicePilot-Studio?style=social)](https://github.com/gitstq/VoicePilot-Studio)

</div>

---

## 🎉 Introduction

### What Is It?

VoicePilot Studio is a **lightweight AI voice interaction desktop engine** designed for users who want natural voice conversations with AI directly in the browser. It combines the conversational intelligence of Large Language Models (LLMs) with speech recognition, speech synthesis, and avatar animation to deliver an immersive AI interaction experience.

### What Problems Does It Solve?

- **High Deployment Barrier**: Existing solutions (like Open-LLM-VTuber) typically require Python, Node.js, or other runtime environments with complex dependency chains, making them intimidating for non-technical users.
- **Tight Model Lock-in**: Most projects are deeply coupled with a specific LLM, making model switching costly and cumbersome.
- **Privacy Concerns**: Data often routes through third-party servers, leaving users with little control over their own information.
- **Bloated Installations**: Installers weighing hundreds of megabytes feel excessive when all you need is a voice chat interface.

### What Makes It Different?

| Feature | VoicePilot Studio | Open-LLM-VTuber | Other Alternatives |
|---------|-------------------|-----------------|-------------------|
| **Dependencies** | Zero, pure frontend | Python + dependency chain | Node.js / Python |
| **Startup** | Open in browser | Command-line launch | Build/compile required |
| **Codebase Size** | 6,037 lines | Tens of thousands | Varies |
| **LLM Support** | Free multi-model switching | Locked to specific model | Varies by project |
| **Data Privacy** | Fully local execution | Partially local | Mostly cloud-based |
| **Deployment** | Zero configuration | Moderate | Moderate to high |

### Inspiration

The idea was born from observing AI VTuber and voice assistant products — they're incredibly capable, but setting up your own voice interaction system is far too complex for the average developer. VoicePilot Studio aims to let anyone launch a fully functional AI voice conversation engine in **under 30 seconds**.

---

## ✨ Core Features

- 🤖 **Multi-LLM API Support** — Compatible with OpenAI GPT-4o, Anthropic Claude, Google Gemini, DeepSeek, GLM-5.1, and **any OpenAI-compatible API**. Switch freely, no vendor lock-in.
- 🎤 **Speech Recognition (STT)** — Powered by the Web Speech API with real-time, multi-language speech-to-text. **No external services required.**
- 🔊 **Speech Synthesis (TTS)** — Uses the Web Speech Synthesis API to read AI responses aloud with adjustable speed and pitch.
- ✂️ **Voice Interruption** — Intelligently detects when the user speaks and automatically stops TTS playback for a natural, interruptible conversation flow.
- 🎭 **Canvas Avatar Animation Engine** — Built-in 4 states (idle / listening / speaking / thinking), 4 expressions, **lip-sync**, and blink animations. AI is more than just a text box.
- 📊 **Real-time Audio Visualization** — Web Audio API spectrum analysis and waveform rendering make sound visible.
- 💬 **Multi-Session Management** — Create, switch, delete, and rename sessions. Data is **persisted via localStorage** and survives page refreshes.
- 🌍 **Internationalization (i18n)** — Built-in support for Simplified Chinese, Traditional Chinese, English, and Japanese. Switch with one click.
- 🌗 **Dark / Light Theme** — Follow system preferences or toggle manually. Easy on the eyes.
- 📤 **Conversation Export** — Export conversations in Markdown or JSON format for record-keeping and sharing.
- ⚡ **Streaming SSE Responses** — AI replies stream in word by word for a smoother, lower-latency experience.
- 📱 **Responsive Layout** — Works on desktops, tablets, and phones. Cross-platform, no barriers.

---

## 🚀 Quick Start

### Requirements

- **Browser**: Chrome 89+, Edge 89+, Safari 14.1+ (Chrome or Edge recommended for best Web Speech API compatibility)
- **Network**: Internet connection to access your chosen LLM API
- **No Installation Needed**: No Node.js, Python, or build tools required

### Installation

```bash
# Clone the repository
git clone https://github.com/gitstq/VoicePilot-Studio.git

# Navigate into the project directory
cd VoicePilot-Studio
```

### Launch Locally

**Option 1: Open directly (simplest)**

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

**Option 2: Use a local static server (recommended for development)**

```bash
# Using Python's built-in server
python3 -m http.server 8080

# Or using Node.js http-server
npx http-server -p 8080

# Or use VS Code's Live Server extension
# Right-click index.html -> Open with Live Server
```

Then open `http://localhost:8080` in your browser.

> **Tip**: Opening `index.html` directly in your browser works perfectly fine. A static server is mainly useful to avoid CORS restrictions in certain browsers.

---

## 📖 Detailed Usage Guide

### LLM API Configuration

You'll need to configure at least one LLM API on first use. Click the **settings icon** in the top-right corner of the interface.

**Supported API Types:**

| API Provider | Example Models | Required Info |
|-------------|---------------|---------------|
| OpenAI | GPT-4o, GPT-4o-mini | API Key, API Base URL |
| Anthropic | Claude 3.5 Sonnet | API Key |
| Google | Gemini Pro | API Key |
| DeepSeek | DeepSeek Chat | API Key, API Base URL |
| GLM | GLM-5.1 | API Key, API Base URL |
| Custom | Any OpenAI-compatible API | API Key, API Base URL, Model Name |

**Configuration Steps:**

1. Open the settings panel
2. Select the API provider type
3. Enter your API Key
4. If using a custom API, enter the API Base URL and model name
5. Click "Save Configuration"

> **Note**: Your API Key is stored **only in your browser locally** and is **never uploaded to any server**.

### Voice Interaction

1. **Start a conversation**: Click the microphone button or press `Space` to begin voice input
2. **See recognition results**: Your speech is transcribed to text in real time and displayed in the input area
3. **AI responds**: Responses are delivered simultaneously as voice and text
4. **Interrupt the AI**: Simply start speaking while the AI is talking — the system detects your voice and stops playback automatically
5. **Type manually**: You can also type directly in the text input field and press send

### Avatar Customization

The Canvas avatar engine supports the following customization options:

- **State Animations**: idle (waiting), listening (hearing), speaking (talking), thinking (processing)
- **Expression System**: 4 expressions that auto-switch based on conversational context
- **Lip Sync**: Mouth shapes are driven in real time by TTS audio data
- **Blink Animation**: Natural, randomized blinking effect

### Session Management

- **Create a session**: Click the "+" button in the sidebar to create a new session
- **Switch sessions**: Click a session name in the sidebar to switch to it
- **Rename**: Right-click a session name and select "Rename"
- **Delete**: Right-click a session name and select "Delete"
- **Persistence**: All session data is automatically saved in localStorage

### Conversation Export

Click the export button in the session panel and choose your format:

- **Markdown (.md)**: Ideal for reading and note-taking
- **JSON (.json)**: Ideal for programmatic processing and data analysis

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Start / stop voice input |
| `Enter` | Send text message |
| `Shift + Enter` | New line |
| `Esc` | Close settings panel |
| `Ctrl/Cmd + E` | Export current conversation |

---

## 💡 Design Philosophy & Roadmap

### Design Principles

VoicePilot Studio is built on three core principles:

1. **Zero Barrier to Entry**: No programming knowledge required, no software to install. Open your browser and you're good to go.
2. **Privacy First**: All data — conversation history, API keys — stays on your local device. Nothing is ever uploaded to third-party servers.
3. **Open & Compatible**: No lock-in to any specific LLM provider. Users are free to choose whichever AI model works best for them.

### Technical Choices

| Technology | Why? |
|-----------|------|
| **Pure HTML/CSS/JS** | Zero build dependencies, native browser support, simplest possible deployment |
| **Web Speech API** | Browser-native speech capabilities, no third-party STT/TTS services needed |
| **Canvas API** | High-performance 2D animation rendering, ideal for the avatar engine |
| **Web Audio API** | Real-time audio analysis for visualization and lip-sync |
| **SSE (Server-Sent Events)** | Lightweight streaming for word-by-word response output |
| **localStorage** | Server-free local data persistence |

### Roadmap

- [ ] **More LLM integrations**: Mistral, Llama, Qwen, and more
- [ ] **Avatar editor**: Visual customization of avatar appearance
- [ ] **Plugin system**: Third-party feature extensions
- [ ] **Wake word detection**: Custom wake words, no manual clicking needed
- [ ] **Advanced context management**: More flexible conversation context window control
- [ ] **PWA support**: Offline usage, desktop shortcuts
- [ ] **WebSocket fallback**: Alternative transport for APIs that don't support SSE

### Ways to Contribute

We welcome contributions in the following areas:

- 🌍 **New language translations**: Help improve internationalization support
- 🎨 **UI/UX improvements**: Interface design and interaction optimization
- 🤖 **LLM adapters**: Write API adapter layers for new models
- 📚 **Documentation**: Tutorials, use cases, FAQ
- 🐛 **Bug fixes**: Issue reports and fixes

---

## 📦 Deployment Guide

### Running Locally

The simplest approach — just open `index.html` in your browser.

### Static Server Deployment

Deploy the project files to any static file server:

```nginx
# Nginx example configuration
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/VoicePilot-Studio;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```apache
# Apache example configuration
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/VoicePilot-Studio
    DirectoryIndex index.html
</VirtualHost>
```

### Embedding in Existing Projects

VoicePilot Studio can be easily embedded into any web project:

```html
<!-- Embed as an iframe -->
<iframe
    src="https://your-domain.com/VoicePilot-Studio/index.html"
    width="100%"
    height="600"
    frameborder="0"
    allow="microphone"
></iframe>
```

```html
<!-- Embed as a Web Component (coming soon) -->
<voice-pilot-studio
    api-key="your-api-key"
    model="gpt-4o"
    lang="en"
></voice-pilot-studio>
```

---

## 🤝 Contributing Guide

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>
```

**Commit types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation update |
| `style` | Code formatting (no functional change) |
| `refactor` | Code refactoring |
| `perf` | Performance optimization |
| `i18n` | Internationalization |
| `chore` | Build/tooling changes |

**Examples:**

```bash
git commit -m "feat(avatar): add blinking animation to idle state"
git commit -m "fix(speech): resolve TTS interruption on Chrome 91"
git commit -m "i18n: add Japanese translation"
```

### Issue Reporting Guidelines

When filing an issue, please include:

1. **Browser and version** (e.g., Chrome 120)
2. **Operating system** (e.g., macOS 14.2)
3. **Steps to reproduce**
4. **Expected vs. actual behavior**
5. **Console error messages** (if any)

### Setting Up a Development Environment

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/VoicePilot-Studio.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Start a local server for development
python3 -m http.server 8080
# or
npx http-server -p 8080

# 4. Open http://localhost:8080 in your browser to test

# 5. Commit and push
git add .
git commit -m "feat(scope): your feature description"
git push origin feature/your-feature-name

# 6. Create a Pull Request
```

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

```
MIT License

Copyright (c) 2024 VoicePilot Studio Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**The simplest way to start your AI voice interaction journey.** ⭐ If you find this project helpful, please give it a Star!

</div>
