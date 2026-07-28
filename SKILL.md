---
name: skill-orchestrator
description: >
  Dynamic Project Skill Orchestrator. Minimizes global base token overhead by maintaining
  a cold archive vault and dynamically matching, copying, and managing project-level skills
  throughout the project lifecycle (Init -> Requirements Alignment -> Single-Directional Addition -> Final Cleanup).
---

# Skill Orchestrator Engine (v2.0)

An open, cross-platform Agent Skill that provides automated zero-base-token skill orchestration for AI Coding Assistants (Antigravity, Claude Code, Cursor, Trae, Codex).

---

## 📢 首轮对话与手动唤醒汇报规范 (Proactive & Manual Telemetry Report Protocol)

### 唤醒方式：
1. **自动触发**：新项目需求定稿 / 中途新增大模块技能时，AI 自动在回复末尾呈现。
2. **快捷单词 / 简写唤醒**：在对话框直接输入 `status`、`telemetry`。
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

## 🗣️ 对话框极简单词 / 自然语言触发指引 (Shortcuts & Triggers)

在 AI 对话框中，您既可以使用**极简单字快捷指令**，也可以使用**自然语言**：

| 对话框快捷单字（最快） | 自然语言表述（口语） | 后台自动执行操作 | 作用与效果 |
| :---: | :--- | :--- | :--- |
| **`status`** | **“查看 Token 占用”、“技能诊断”** | `npm run status` | 打印可视化的 Token 仪表盘与健康度汇报卡 |
| **`init`** | **“初始化技能库”、“清空开局占用”** | `npm run init` | 建立私有冷库，瞬间释放全局 90%+ 占用 |
| **`infer`** | **“检查依赖”、“自动匹配技能”** | `npm run infer` | 自动扫描代码依赖，零沟通精准装载技能 |
| **“刚才 npx 装了新技能，整理一下”** / **“巡检技能”** | `npm run sync` | 捕获手动安装的新技能并静默归档至冷库 |
| **`cleanup`** | **“项目开发完成了”、“清理临时技能”** | `npm run cleanup` | 项目结项，一键清理项目局部临时技能 |

---

## 🏛️ Orchestration Protocol & Workflow

When this skill is active, the AI Agent adheres to the following lifecycle workflow:

1. **Initialization (`init`)**:
   - Creates a local cold archive repository (`skills_archive/`).
   - Moves non-core global skills into archive, reducing global base tokens by 90%+.
2. **Requirements Alignment Phase**:
   - 0 extra skills loaded in the project directory. Rapid, lightweight product requirement discussion.
3. **Dependency & Requirements Finalization Phase (`infer` & `fetch`)**:
   - AI automatically inspects project dependencies, file extensions, and chat intent to match cold archive (or Vercel cloud registry).
   - Copies matching 2-3 skills into `./.agents/skills/`.
   - **Outputs Proactive Telemetry Report Card with concise origin tags**.
4. **Development Execution Phase (`Incremental Addition`)**:
   - Single-directional addition. Never deletes active skills mid-development to prevent context fragmentation.
5. **Project Offboarding Phase (`cleanup`)**:
   - Cleans project-level skills after project completion.

---

## 🛠️ CLI Operations

- `node scripts/orchestrate.js init` - Setup archive vault and optimize global skills.
- `node scripts/orchestrate.js infer` - Scan package.json/project files and infer dependency skills.
- `node scripts/orchestrate.js sync` - Auto-detect manually added npx skills and migrate to archive.
- `node scripts/orchestrate.js status` - Display active vs archived skills token status dashboard.
- `node scripts/orchestrate.js cleanup` - Clean project-level skills upon completion.
