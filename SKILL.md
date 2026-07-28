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

在任何新项目/新工作区中，当需求定稿或首轮技能调配完成后，AI 应当在回复末尾**自动标注技能来源与归属**（保留状态指示 Emoji 🟢/🟡）：

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

### 5 大技能推断来源分类 (Inference Source Categories)
1. **`推断: package.json`**：JavaScript / Node 前端依赖
2. **`推断: requirements.txt` / `Cargo.toml` / `go.mod`**：Python / Rust / Go 等后端依赖
3. **`推断: 代码特征 [.glsl / .sqlx]`**：扫描到特定扩展名的代码特征文件
4. **`推断: 需求意图`**：通过与人类沟通的产品文档与聊天语义理解
5. **`推断: 用户指定`**：用户显式输入 `$技能名` 唤醒

---

## 🗣️ 自然语言触发指引 (Natural Language Triggers)

用户不需要记忆任何 CLI 命令行，AI 应当根据用户的自然语言意图，在后台自动执行对应的脚本工具：

| 用户自然语言表述 | 后台自动执行命令 | 作用 |
| :--- | :--- | :--- |
| **“初始化技能库”** / **“清空开局 Token 占用”** | `node scripts/orchestrate.js init` | 建立私有冷库，瞬间释放全局 90%+ 占用 |
| **“检查代码依赖需要什么技能”** / **“自动匹配技能”** | `node scripts/orchestrate.js infer` | 自动扫描项目代码依赖，零沟通精准装载技能 |
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
- `node scripts/orchestrate.js cleanup` - Clean project-level skills upon completion.
- `node scripts/orchestrate.js telemetry` - Display active vs archived skills token status.
