---
name: skill-orchestrator
description: >
  Dynamic Project Skill Orchestrator. Minimizes global base token overhead by maintaining
  a cold archive vault and dynamically matching, copying, and managing project-level skills
  throughout the project lifecycle (Init -> Requirements Alignment -> Single-Directional Addition -> Final Cleanup).
---

# Skill Orchestrator Engine

An open, cross-platform Agent Skill that provides automated zero-base-token skill orchestration for AI Coding Assistants (Antigravity, Claude Code, Cursor, Trae, Codex).

---

## 📂 技能存储路径与加载优先级对照表 (Directory Paths & Priorities)

| 目录路径 (Directory Path) | 目录角色与定位 | 加载与匹配优先级 | Token 空间影响 | 生命周期与清理 |
| :--- | :--- | :---: | :---: | :--- |
| **`<项目根目录>/.agents/skills/`** | **本项目专属动态技能目录** (Project Scope) | **第 1 优先级** (优先复用当前项目内已装载技能) | 仅在当前项目占用 (~300-500 Tokens) | 项目结项使用 `/cleanup` 一键清理 |
| **`~/.<agent>/skills_archive/`** | **本地私有冷归档库** (Local Cold Archive Vault) | **第 2 优先级** (命中即 0ms 复制入项目，截断网络) | **0 Tokens** (完全冷冻，开局 0 占用) | 永久私有保存，绝对不随项目清理 |
| **`~/.<ide-or-agent>/skills/`** | **当前 IDE / Agent 全局热底座目录** (Hot Core Base) | **第 3 优先级** (仅常驻 2-3 个通用核心 Skill) | 保持极低开销 (&le; 500 Tokens) | 常驻热加载 |
| **`~/.agents/skills/`**<br>**`~/.claude/skills/`**<br>**`~/.trae-cn/skills/`** | **第三方 Agent 全局公共目录** (Public Skill Folders) | **自动巡检捕获** (检测用户手动 `npx` 安装的新技能) | 触发 `runSync` 后恢复极简 | 巡检捕获后自动迁移移入 `skills_archive/` |

---

## 首轮对话与手动唤醒汇报规范 (Proactive & Manual Telemetry Report Protocol)

### 唤醒方式：
1. **自动触发**：新项目需求定稿 / 中途新增大模块技能时，AI 自动在回复末尾呈现。
2. **斜杠快捷指令唤醒（最推荐）**：在对话框直接发送 `/status`（或 `$status` / `status`）。
3. **自然语言唤醒**：对 AI 说“查看 Token 占用”、“技能诊断”、“当前项目装了哪些技能”。
4. **命令行唤醒（开发者）**：在项目终端运行标准命令 `npm run status`。

```text
------------------------------------------------------------
[Project Skills & Token Telemetry]
------------------------------------------------------------
全局热底座开销 : ~420 Tokens [Status: Healthy 🟢]
本项目专属装载 : 
   ├── 3d-web-experience   : 450 Tokens (来源: 本地冷库 | 推断: package.json)
   ├── web-shader-extractor: 380 Tokens (来源: 本地冷库 | 推断: 代码特征 [.glsl])
   ├── upskill/sec-header  : 460 Tokens (来源: Upskill安全库 | 推断: 安全审计)
   ├── stripe/agent-skills : 510 Tokens (来源: GitHub组织 | 推断: 依赖匹配)
   └── svelte-kit          : 470 Tokens (来源: Vercel云端 | 推断: 需求意图)
------------------------------------------------------------
本项目总底座开销 : 2,690 Tokens (较默认全载节省 72.4% 空间)
Prompt Cache 锚点: 已自动注入 (响应速度提升 4x)
============================================================
```

---

## 全网多云端源与本地注册表级联引擎 (Multi-Registry Universal Engine)

| 注册表来源 | 维护主体 | 核心差异化领域 | 自动匹配/拉取逻辑 |
| :--- | :--- | :--- | :--- |
| **1. Vercel (`vercel-labs`)** | Vercel & 开源社区 | Web 前端、Next.js、UI/UX 规范 | `npx skills add <name>` |
| **2. Upskill (`upskill.dev`)** | 安全团队 | 恶意代码防御、安全审计、合规重构 | `npx upskill add <name>` |
| **3. 巨头官方 (`Stripe/Cloudflare`)**| 各大 Tech 巨头 | 官方 API、Serverless 边缘计算、数据库 | `npx skills add owner/repo` |
| **4. 国内 Gitee / CDN 节点** | Gitee / jsDelivr | 国内秒级响应 (Ping < 30ms) | `npx skills add vercel-labs/skills/<name>` |
| **5. 您的私有 GitHub 组织** | 您的团队 | 团队内部私有架构、商业护城河规范 | `npx skills add your-org/repo` |

---

## CLI Operations (命令行工具操作)

- `node scripts/orchestrate.js init` - Setup archive vault and optimize global skills.
- `node scripts/orchestrate.js infer` - Scan package.json/project files and infer dependency skills.
- `node scripts/orchestrate.js sync` - Auto-detect manually added npx skills and migrate to archive.
- `node scripts/orchestrate.js status` - Display active vs archived skills token status dashboard.
- `node scripts/orchestrate.js cleanup` - Clean project-level skills upon completion.

---

## 斜杠指令与自然语言触发 (Triggers & Shortcuts)

在 AI 对话框中，直接输入**斜杠指令**或**自然语言**即可自动触发后台操作：

| 斜杠指令 (最推荐 - 支持 IDE 敲 / 自动补全) | 替代语法 | 自然语言口语表述 | 后台自动执行 |
| :---: | :---: | :--- | :--- |
| **`/status`** | `$status` / `status` | **“查看 Token 占用”、“技能诊断”** | `node scripts/orchestrate.js status` (`npm run status`) |
| **`/init`** | `$init` / `init` | **“初始化技能库”、“清空开局占用”** | `node scripts/orchestrate.js init` (`npm run init`) |
| **`/infer`** | `$infer` / `infer` | **“检查依赖”、“自动匹配技能”** | `node scripts/orchestrate.js infer` (`npm run infer`) |
| **`/sync`** | `$sync` / `sync` | **“刚才 npx 装了新技能，整理一下”** | `node scripts/orchestrate.js sync` (`npm run sync`) |
| **`/cleanup`** | `$cleanup` / `cleanup` | **“项目开发完成了”、“清理临时技能”** | `node scripts/orchestrate.js cleanup` (`npm run cleanup`) |

---

## 🏛️ Orchestration Protocol & Execution Rules

当此 Skill 激活时，AI Agent 必须严格遵循以下生命周期逻辑并调用底层核心执行脚本 `scripts/orchestrate.js`：

1. **初始化阶段 (`init`)**:
   - AI 执行命令: `node scripts/orchestrate.js init`
   - 建立私有冷库 (`skills_archive/`)，将非 Core 的全局技能归档，降级开局 Tokens 至 <500。
2. **需求对齐阶段 (Requirements Alignment)**:
   - 项目目录保持 0 额外技能，进行轻量化产品需求讨论。
3. **依赖推断与多源装载阶段 (`infer`)**:
   - AI 执行命令: `node scripts/orchestrate.js infer`
   - 自动扫描配置文件与代码后缀特征，从冷库或多云端源拉取对应技能到 `./.agents/skills/`，并输出 Telemetry 汇报卡。
4. **巡检同步阶段 (`sync`)**:
   - AI 执行命令: `node scripts/orchestrate.js sync`
   - 巡检捕获用户通过 `npx` 手动安装的新技能并自动迁移入私有冷库。
5. **项目结项清理阶段 (`cleanup`)**:
   - AI 执行命令: `node scripts/orchestrate.js cleanup`
   - 统一清理本项目下临时技能目录 `./.agents/skills/`。
