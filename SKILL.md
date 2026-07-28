---
name: skill-orchestrator
description: >
  Dynamic Project Skill Orchestrator. Minimizes global base token overhead by maintaining
  a unified shared cold archive vault and dynamically matching, copying, and managing project-level skills
  throughout the project lifecycle (Init -> Requirements Alignment -> Single-Directional Addition -> Final Cleanup -> Eject Offboarding).
  Activate when user asks to manage skills, infer dependencies, check token status, or run slash commands (/status, /infer, /init, /sync, /cleanup, /eject).
---

# Skill Orchestrator Engine

AI Agent execution rules for dynamic skill orchestration and zero-base-token optimization.

## Command Mapping

| Trigger / Natural Language Intent | Execution Command |
| :--- | :--- |
| `/status`, `$status`, "Check Token/Skill Status", "技能诊断" | `npx skill-orchestrator status` |
| `/init`, `$init`, "Initialize Skill Vault", "初始化技能库" | `npx skill-orchestrator init` |
| `/infer`, `$infer`, "Auto Match Skills/Infer Dependencies", "自动匹配技能" | `npx skill-orchestrator infer` |
| `/sync`, `$sync`, "Sync New Skills/Organize Cold Archive", "同步所有技能" | `npx skill-orchestrator sync` |
| `/merge`, `$merge`, "Merge Duplicate Skills", "合并技能/去重" | `npx skill-orchestrator merge` |
| **"只同步/归档 Gemini/Antigravity 的技能"** | `npx skill-orchestrator sync --ide=gemini` |
| **"把 Claude 的技能移入冷库"** | `npx skill-orchestrator sync --ide=claude` |
| **"只整理 Cursor 的技能"** | `npx skill-orchestrator sync --ide=cursor` |
| **"只归档 Trae 的技能"** | `npx skill-orchestrator sync --ide=trae` |
| `/cleanup`, `$cleanup`, "Clean Up Project Skills", "清理项目技能" | `npx skill-orchestrator cleanup` |
| `/eject`, `$eject`, "Restore Skills & Uninstall", "退出并恢复" | `npx skill-orchestrator eject` |

## Resolution Priority

| Directory Path | Role & Scope | Priority & Loading | Token Impact | Lifecycle & Cleanup |
| :--- | :--- | :---: | :---: | :--- |
| **`<ProjectRoot>/.agents/skills/`** | **Project-Scoped Skills** | **Priority 1** (Local reuse) | Project-only (~300-500 Tokens) | Cleaned up via `/cleanup` |
| **`~/.agents/skills_archive/`** | **Unified Shared Cold Archive** | **Priority 2** (0ms Copy, Cross-IDE Shared) | **0 Tokens** (Cold state) | Permanent private storage |
| **`~/.<ide-or-agent>/skills/`** | **IDE Hot Base Directory** | **Priority 3** (Core base only) | Low overhead (<= 500 Tokens) | Always preloaded |
| **`~/.gemini/config/skills/`**<br>**`~/.claude/skills/`**<br>**`~/.trae-cn/skills/`** | **Public Skill Folders** | **Auto-Sync Scanner** (Detects manual `npx` skills) | Reduced on `runSync` | Auto-migrated to `~/.agents/skills_archive/` |

## Node.js Environment Self-Healing & Silent Installation

When executing any orchestrator command, the AI Agent MUST verify Node.js runtime availability:

1. **Check Availability**: Run `node -v`.
2. **Silent Background Auto-Installation** (If Node.js is missing):
   Execute the appropriate OS native package manager command quietly without interrupting the user:
   - **Windows OS**:
     `winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements`
   - **macOS**:
     `brew install node`
   - **Linux (Debian/Ubuntu)**:
     `sudo apt-get update -y && sudo apt-get install -y nodejs npm`
3. **Resume Execution**: Once installed, immediately execute the requested orchestrator command without asking the user to manually setup environment variables.

## Telemetry Report Format

Format output after running `infer` or `status`:

```text
------------------------------------------------------------
[Project Skills & Token Telemetry]
------------------------------------------------------------
Global Base Overhead : ~420 Tokens [Status: Healthy 🟢]
Project-Scoped Skills: 
   ├── 3d-web-experience   : 450 Tokens (Origin: Cold Archive | Infer: package.json)
   ├── web-shader-extractor: 380 Tokens (Origin: Cold Archive | Infer: Code Feature [.glsl])
   ├── upskill/sec-header  : 460 Tokens (Origin: Upskill Registry | Infer: Security Audit)
   ├── stripe/agent-skills : 510 Tokens (Origin: GitHub Org | Infer: Dependency Match)
   └── svelte-kit          : 470 Tokens (Origin: Vercel Registry | Infer: User Intent)
------------------------------------------------------------
Total Project Token Overhead : 2,690 Tokens (Save 72.4% vs Preload All)
Prompt Cache Anchor          : Injected (4x Speedup)
============================================================
```

## Lifecycle Rules

1. **`init`**: Run `npx skill-orchestrator init` to move non-core global skills into unified shared archive vault (`~/.agents/skills_archive/`).
2. **`infer`**: Run `npx skill-orchestrator infer` when project scope locks or dependencies change. Print Telemetry Report.
3. **`sync`**: Run `npx skill-orchestrator sync` (or `npx skill-orchestrator sync --ide=<target>`) to capture manual `npx` skills into unified shared archive vault.
4. **`cleanup`**: Run `npx skill-orchestrator cleanup` upon project completion.
5. **`eject`**: Run `npx skill-orchestrator eject` to restore all archived skills back to global directory and uninstall cleanly (0 data loss).
