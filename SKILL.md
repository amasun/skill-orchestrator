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
| `/status`, `$status`, `status`, "Check Token/Skill Status" | `node scripts/orchestrate.js status` |
| `/init`, `$init`, `init`, "Initialize Skill Vault" | `node scripts/orchestrate.js init` |
| `/infer`, `$infer`, `infer`, "Auto Match Skills/Infer Dependencies" | `node scripts/orchestrate.js infer` |
| `/sync`, `$sync`, `sync`, "Sync New Skills/Organize Cold Archive" | `node scripts/orchestrate.js sync` |
| `/cleanup`, `$cleanup`, `cleanup`, "Clean Up Project Skills" | `node scripts/orchestrate.js cleanup` |

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

1. **`init`**: Run `node scripts/orchestrate.js init` to move non-core global skills into archive vault.
2. **`infer`**: Run `node scripts/orchestrate.js infer` when project scope locks or dependencies change. Print Telemetry Report.
3. **`sync`**: Run `node scripts/orchestrate.js sync` to capture manual `npx` skills into cold archive.
4. **`cleanup`**: Run `node scripts/orchestrate.js cleanup` upon project completion.
