---
name: skill-orchestrator
description: >
  Dynamic Project Skill Orchestrator. Minimizes global base token overhead by maintaining
  a cold archive vault and dynamically matching, copying, and managing project-level skills
  throughout the project lifecycle (Init -> Requirements Alignment -> Single-Directional Addition -> Final Cleanup).
  Activate when user asks to manage skills, infer dependencies, check token status, or run slash commands (/status, /infer, /init, /sync, /cleanup).
---

# Skill Orchestrator Engine

AI Agent execution rules for dynamic skill orchestration and zero-base-token optimization.

## Command Mapping

| Trigger / User Intent | Execution Command |
| :--- | :--- |
| `/status`, `$status`, `status`, "查看Token/技能诊断" | `node scripts/orchestrate.js status` |
| `/init`, `$init`, `init`, "初始化技能库" | `node scripts/orchestrate.js init` |
| `/infer`, `$infer`, `infer`, "自动匹配技能/检查依赖" | `node scripts/orchestrate.js infer` |
| `/sync`, `$sync`, `sync`, "整理新技能/同步冷库" | `node scripts/orchestrate.js sync` |
| `/cleanup`, `$cleanup`, `cleanup`, "清理临时技能" | `node scripts/orchestrate.js cleanup` |

## Resolution Priority

1. **Project Scope** (`./.agents/skills/`): Priority 1 (Local reuse)
2. **Cold Archive** (`~/.<agent>/skills_archive/`): Priority 2 (0ms Copy, 0 Base Tokens)
3. **Hot Base** (`~/.<ide-or-agent>/skills/`): Priority 3 (Core base only, <= 500 Tokens)

## Telemetry Report Format

Format output after running `infer` or `status`:

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

## Lifecycle Rules

1. **`init`**: Run `node scripts/orchestrate.js init` to move non-core global skills into archive vault.
2. **`infer`**: Run `node scripts/orchestrate.js infer` when project scope locks or dependencies change. Print Telemetry Report.
3. **`sync`**: Run `node scripts/orchestrate.js sync` to capture manual `npx` skills into cold archive.
4. **`cleanup`**: Run `node scripts/orchestrate.js cleanup` upon project completion.
