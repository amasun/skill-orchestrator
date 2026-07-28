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

## 📢 首轮对话自动汇报规范 (Proactive Telemetry Report Protocol)

在任何新项目/新工作区中，当需求定稿或首轮技能调配完成后，AI 应当在回复末尾**自动精准标注技能来源与归属**：

```text
------------------------------------------------------------
📊 本项目技能与 Token 健康度汇报 (Project Skills Telemetry)
------------------------------------------------------------
🔥 全局热底座开销 : ~420 Tokens [健康 🟢]
🚀 本项目专属装载 : 
   ├── 3d-web-experience   : 450 Tokens (来源: 本地私有冷库 [skills_archive] | 推断: package.json)
   ├── gsap-core           : 320 Tokens (来源: 本地私有冷库 [skills_archive] | 推断: package.json)
   ├── solidity            : 510 Tokens (来源: Vercel 云端 [vercel-labs/skills] | 仅存项目临时目录)
------------------------------------------------------------
💡 本项目总底座开销 : 1,700 Tokens (对比默认全载节省 82.5% 空间!)
⚡ Prompt Cache 锚点: 已自动注入 (响应速度提速 4x)
============================================================
```

---

## 🗣️ 自然语言触发指引 (Natural Language Triggers)

用户不需要记忆任何 CLI 命令行，AI 应当根据用户的自然语言意图，在后台自动执行对应的脚本工具：

| 用户自然语言表述 | 后台自动执行命令 | 作用 |
| :--- | :--- | :--- |
| **“初始化技能库”** / **“清空开局 Token 占用”** | `node scripts/orchestrate.js init` | 建立私有冷库，瞬间释放全局 90%+ 占用 |
| **“检查 package.json 需要什么技能”** / **“自动匹配依赖技能”** | `node scripts/orchestrate.js infer` | 自动扫描项目代码依赖，零沟通精准装载技能 |
| **“刚才在终端 npx 装了新技能，整理一下”** / **“巡检技能”** | `node scripts/orchestrate.js sync` | 捕获手动安装的新技能并静默归档至冷库 |
| **“查看 Token 占用状态”** / **“技能诊断”** | `node scripts/orchestrate.js telemetry` | 打印可视化的 Token 仪表盘与健康度报告 |
| **“项目开发完成了”** / **“清理临时技能”** | `node scripts/orchestrate.js cleanup` | 项目结项，一键清理项目局部临时技能 |

---

## 🏛️ Orchestration Protocol & Workflow

When this skill is active, the AI Agent adheres to the following lifecycle workflow:

1. **Initialization (`init`)**:
   - Creates a local cold archive repository (`skills_archive/`).
   - Moves non-core global skills into archive, reducing global base tokens by 90%+.
2. **Requirements Alignment Phase**:
   - 0 extra skills loaded in the project directory. Rapid, lightweight product requirement discussion.
3. **Dependency & Requirements Finalization Phase (`infer` & `fetch`)**:
   - AI automatically inspects `package.json` and project text to match cold archive (or Vercel cloud registry).
   - Copies matching 2-3 skills into `./.agents/skills/`.
   - **Outputs Proactive Telemetry Report Card with explicit origin sources**.
4. **Development Execution Phase (`Incremental Addition`)**:
   - Single-directional addition. Never deletes active skills mid-development to prevent context fragmentation.
5. **Project Offboarding Phase (`cleanup`)**:
   - Cleans project-level skills after project completion.

---

## 🛠️ CLI Operations

- `node scripts/orchestrate.js init` - Setup archive vault and optimize global skills.
- `node scripts/orchestrate.js infer` - Scan package.json and infer dependency skills.
- `node scripts/orchestrate.js sync` - Auto-detect manually added npx skills and migrate to archive.
- `node scripts/orchestrate.js cleanup` - Clean project-level skills upon completion.
- `node scripts/orchestrate.js telemetry` - Display active vs archived skills token status.
