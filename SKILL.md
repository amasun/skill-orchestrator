---
name: skill-orchestrator
description: >
  Dynamic Project Skill Orchestrator. Minimizes global base token overhead by maintaining
  a cold archive vault and dynamically matching, copying, and managing project-level skills
  throughout the project lifecycle (Init -> Requirements Alignment -> Single-Directional Addition -> Final Cleanup).
---

# Skill Orchestrator Engine (v2.2)

An open, cross-platform Agent Skill that provides automated zero-base-token skill orchestration for AI Coding Assistants (Antigravity, Claude Code, Cursor, Trae, Codex).

---

## 🌐 5 大云端/本地注册表级联引擎 (5-Registry Universal Resolution Engine)

| 注册表来源 | 维护主体 | 核心差异化领域 | 自动匹配/拉取逻辑 |
| :--- | :--- | :--- | :--- |
| **1. Vercel (`vercel-labs`)** | Vercel & 开源社区 | Web 前端、Next.js、UI/UX 规范 | `npx skills add <name>` |
| **2. Upskill (`upskill.dev`)** | 安全团队 | 恶意代码防御、安全审计、合规重构 | `npx upskill add <name>` |
| **3. 巨头官方 (`Stripe/Cloudflare`)**| 各大 Tech 巨头 | 官方 API、Serverless 边缘计算、数据库 | `npx skills add owner/repo` |
| **4. 国内 Gitee / CDN 节点** | Gitee / jsDelivr | 国内秒级响应 (Ping < 30ms) | `npx skills add vercel-labs/skills/<name>` |
| **5. 您的私有 GitHub 组织** | 您的团队 | 团队内部私有架构、商业护城河规范 | `npx skills add your-org/repo` |

---

## 📢 首轮对话与手动唤醒汇报规范 (Proactive & Manual Telemetry Report Protocol)

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
   ├── gsap-core           : 320 Tokens (来源: 本地冷库 | 推断: package.json)
   ├── web-shader-extractor: 380 Tokens (来源: 本地冷库 | 推断: 代码特征 [.glsl])
   ├── ditther-dark-glass  : 410 Tokens (来源: 本地冷库 | 推断: 需求意图)
   ├── solidity            : 510 Tokens (来源: Vercel云端 | 仅存项目临时目录)
------------------------------------------------------------
本项目总底座开销 : 2,070 Tokens (较默认全载节省 78.8% 空间)
Prompt Cache 锚点: 已自动注入 (响应速度提升 4x)
============================================================
```

---

## 🛠️ CLI Operations (命令行工具操作)

- `node scripts/orchestrate.js init` - Setup archive vault and optimize global skills.
- `node scripts/orchestrate.js infer` - Scan package.json/project files and infer dependency skills.
- `node scripts/orchestrate.js sync` - Auto-detect manually added npx skills and migrate to archive.
- `node scripts/orchestrate.js status` - Display active vs archived skills token status dashboard.
- `node scripts/orchestrate.js cleanup` - Clean project-level skills upon completion.

---

## 🗣️ 斜杠指令与自然语言触发 (Triggers & Shortcuts)

在 AI 对话框中，直接输入**斜杠指令**或**自然语言**即可自动触发后台操作：

| 斜杠指令 (支持 Tab 补全) | 替代语法 | 自然语言口语表述 | 后台自动执行 |
| :---: | :---: | :--- | :--- |
| **`/status`** | `$status` / `status` | **“查看 Token 占用”、“技能诊断”** | `npm run status` |
| **`/init`** | `$init` / `init` | **“初始化技能库”、“清空开局占用”** | `npm run init` |
| **`/infer`** | `$infer` / `infer` | **“检查依赖”、“自动匹配技能”** | `npm run infer` |
| **`/sync`** | `$sync` / `sync` | **“刚才 npx 装了新技能，整理一下”** | `npm run sync` |
| **`/cleanup`** | `$cleanup` / `cleanup` | **“项目开发完成了”、“清理临时技能”** | `npm run cleanup` |

---

## 🏛️ Orchestration Protocol & Workflow

When this skill is active, the AI Agent adheres to the following lifecycle workflow:

1. **Initialization (`init`)**:
   - Creates a local cold archive repository (`skills_archive/`).
   - Moves non-core global skills into archive, reducing global base tokens by 90%+.
2. **Requirements Alignment Phase**:
   - 0 extra skills loaded in the project directory. Rapid, lightweight product requirement discussion.
3. **Dependency & Requirements Finalization Phase (`infer` & `fetch`)**:
   - AI automatically inspects project dependencies, file extensions, and chat intent to match cold archive or 5 Cloud Registries (Vercel, Upskill, GitHub Orgs, Gitee/jsDelivr, Private Orgs).
   - Copies matching 2-3 skills into `./.agents/skills/`.
   - **Outputs Proactive Telemetry Report Card with concise origin tags**.
4. **Development Execution Phase (`Incremental Addition`)**:
   - Single-directional addition. Never deletes active skills mid-development to prevent context fragmentation.
5. **Project Offboarding Phase (`cleanup`)**:
   - Cleans project-level skills after project completion.
