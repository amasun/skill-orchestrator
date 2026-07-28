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

## Short Alias & Directives (`so` & `so-xxx`)

- **`so`** = Short alias for **`skill-orchestrator`** (e.g. `npx so`, `so infer`, `so status`).
- **`so-xxx`** = Quick sub-command directives under this skill orchestrator:

| Alias / Trigger | Intent / Purpose | Target Execution |
| :--- | :--- | :--- |
| `so`, `/so` | Activate Skill Orchestrator Engine | `npx skill-orchestrator` |
| `so-status`, `/so-status` | Inspect Skill/Token Status & Control Panel | `npx skill-orchestrator status` |
| `so-init`, `/so-init` | Initialize Project Skill Environment | `npx skill-orchestrator init` |
| `so-infer`, `/so-infer` | Deduce & Auto-Copy Required Skills from Cold Vault | `npx skill-orchestrator infer` |
| `so-sync`, `/so-sync` | Synchronize `so_skills_registry` MD & JSON | `npx skill-orchestrator sync` |
| `so-merge`, `/so-merge` | Merge Duplicate Skills & Clean Vault | `npx skill-orchestrator merge` |
| `so-cleanup`, `/so-cleanup` | Clean Project Skills (Return to Cold Vault) | `npx skill-orchestrator cleanup` |
| `so-eject`, `/so-eject` | Offboard Orchestrator from Project | `npx skill-orchestrator eject` |

## Command Mapping

| Trigger / Natural Language Intent | Execution Command |
| :--- | :--- |
| `so-status`, `/status`, `$status`, "Check Token/Skill Status" | `npx skill-orchestrator status` |
| `so-init`, `/init`, `$init`, "Initialize Skill Vault" | `npx skill-orchestrator init` |
| `so-infer`, `/infer`, `$infer`, "Auto Match Skills/Infer Dependencies" | `npx skill-orchestrator infer` |
| **"Infer skills based on natural language intent"** | `npx skill-orchestrator infer --intent="Build a 3D ThreeJS project"` |
| `so-sync`, `/sync`, `$sync`, "Sync New Skills/Organize Cold Archive" | `npx skill-orchestrator sync` |
| `so-merge`, `/merge`, `$merge`, "Merge Duplicate Skills" | `npx skill-orchestrator merge` |
| **"Only sync/archive Gemini/Antigravity skills"** | `npx skill-orchestrator sync --ide=gemini` |
| **"Move Claude skills to cold vault"** | `npx skill-orchestrator sync --ide=claude` |
| **"Only organize Cursor skills"** | `npx skill-orchestrator sync --ide=cursor` |
| **"Only archive Trae skills"** | `npx skill-orchestrator sync --ide=trae` |
| `so-cleanup`, `/cleanup`, `$cleanup`, "Clean Up Project Skills" | `npx skill-orchestrator cleanup` |
| `so-eject`, `/eject`, `$eject`, "Restore Skills & Uninstall" | `npx skill-orchestrator eject` |

## Resolution Priority

| Directory Path | Role & Scope | Priority & Loading | Token Impact | Lifecycle & Cleanup |
| :--- | :--- | :---: | :---: | :--- |
| **`<ProjectRoot>/.agents/skills/`** | **Project-Scoped Skills** | **Priority 1** (Local reuse) | Project-only (~300-500 Tokens) | Cleaned up via `/cleanup` |
| **`~/.agents/skills_archive/`** | **Unified Shared Cold Archive** | **Priority 2** (0ms Copy, Cross-IDE Shared) | **0 Tokens** (Cold state) | Permanent private storage |
| **`~/.<ide-or-agent>/skills/`** | **IDE Base Skills Directory** | **Priority 3** (Core base only) | Low overhead (<= 500 Tokens) | Always preloaded |
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
Global Base Overhead : ~3,352 Tokens [Status: Healthy 🟢]
   ├── agentic-workflow                 :  1,723 Tokens (Agent Workflow Orchestration)
   ├── find-skills                      :  1,095 Tokens (Skill Discovery & Extension)
   ├── z-coding-refactoring             :    534 Tokens (Code Architecture Refactoring)
------------------------------------------------------------
Project Dynamic Loaded Skills Overhead : ~13,184 Tokens [Project-Scoped]
   ├── 3d-web-experience                :  1,377 Tokens (Local Vault | Three.js & 3D Web)
   ├── web-shader-extractor             :    380 Tokens (Local Vault | GLSL Shader Parsing)
   ├── gsap-core                        :  3,759 Tokens (Local Vault | GSAP Tween Animation)
   ├── cinematic-gsap-lenis-motion-system : 4,580 Tokens (Local Vault | Smooth Camera Control)
   └── vibe-coding-design               :  3,088 Tokens (Local Vault | OKLCh Design System)
------------------------------------------------------------
Project Active Total Overhead : ~16,536 Tokens
Prompt Cache Control Anchor   : Auto Injected (4x Latency Reduction)
============================================================
```

## Semantic Cold-Start & Auto-Classification Rules for `init`

When initializing or migrating skills (`/init` or onboarding), the AI Agent & Engine perform **Semantic Reading & Intelligent Classification** for each discovered skill before deciding whether to move it:

1. **Semantic Inspection**: Inspect each candidate's `SKILL.md` (frontmatter & core prompt) using AI semantic analyzer (`analyzeSkillSemantics`).
2. **AI Classification Criteria**:
   - **Universal Meta-Skills (➔ Preserve in Base Skills)**:
     - *Scope*: Core workflow management, refactoring guidance, security/error debugging, agent orchestration, project context handoff.
     - *Action*: Automatically register the skill name into `~/.agents/base_skills.json` under `core_base_skills` array.
   - **Domain Specific / Framework Skills (➔ Consolidate to Cold Vault)**:
     - *Scope*: Framework-specific (React/Svelte/Vue), UI component libraries (Shadcn), payment gateways (Stripe/Alipay), cloud databases (BigQuery/GCP), specialized animation tools (GSAP/Shader).
     - *Action*: Consolidate into `~/.agents/skills_archive/` (Cold Vault) for 0-token cold storage.
3. **Persist User Choice**: Generate/update `~/.agents/base_skills.json` with the classified results so users have 100% transparent control to inspect or modify their Base Skills whitelist.
4. **Unified Machine Engine Registry (`so_skills_registry.json`)**:
   Maintain a single structured database ([~/.agents/so_skills_registry.json](file:///C:/Users/Amasun-PC/.agents/so_skills_registry.json)) containing rich metadata (descriptions, purposes, tokens, category, status, original paths) for 0-disk-IO semantic matching and Base/Vault classification.
5. **Standalone Dual-Track Control Panel (`so_skills_registry.md`)**:
   Maintain a matching Markdown Control Panel ([~/.agents/so_skills_registry.md](file:///C:/Users/Amasun-PC/.agents/so_skills_registry.md)). Running `npx skill-orchestrator sync` automatically maps user `[x]` / `[ ]` checkmarks into the JSON database.
6. **Automated Domain-Category Routing Protocol**:
   When new skills are probed and discovered across any IDE directory, `skill-orchestrator` automatically inspects their name and Frontmatter `description` to categorize them directly into their appropriate Domain Blocks in `so_skills_registry.md` (`🎨 UI/UX & Motion`, `🎨 Figma Toolchain`, `🛠️ Core Engineering`, `📊 BigData & Cloud`, `📄 Office & Docs`). Unrecognized skills are routed to `## 🆕 Newly Discovered Skills (Pending Classification)`.

## AI Agent Dynamic Skill Reasoning & Ecosystem Discovery (Aligned with `find-skills`)

In alignment with the `find-skills` open ecosystem paradigm, reasoning logic is NOT hardcoded into script matrices. When a user requests a new project or capability, the AI Agent MUST follow this strict **4-Step Resolution Priority Sequence**:

1. **Step 1: Local Cold Vault & Direct Name Mention Match (`~/.agents/skills_archive/`)** [0ms Instant Silent Copy]
   Check if a matching skill or named mention (e.g., `"use apple-design"`, `"3d-web-experience"`, `"cinematic-gsap-lenis"`) matches any skill in `so_skills_registry.json` / cold vault. If found, silently copy directly into `<ProjectRoot>/.agents/skills/<skill-name>/` and activate immediately with zero user friction.
2. **Step 2: `find-skills` Ecosystem Discovery (`npx skills find [query]`)** [Primary Ecosystem Search]
   If missing locally, deduce keywords and query `find-skills` to search the open agent skills ecosystem (`skills.sh` / Vercel Registry).
   * **`find-skills` Auto-Installation Commands** (if missing):
     - **Global Installation (Recommended)**: `npx -y skills add vercel-labs/agent-skills@find-skills -g`
     - **Alternative Package**: `npx -y skills add find-skills -g`
3. **Step 3: Open Web & GitHub Repository Search (`search_web` / GitHub)** [Extended Source Search]
   If `find-skills` returns no match, search GitHub repositories (`owner/repo`) or Upskill registry for relevant open skills.
4. **Step 4: 5-Registry Cascade Pull & Assembly (`npx skill-orchestrator infer`)** [Zero-Token Orchestration]
   Pass the resolved skill repo/package to `skill-orchestrator` to execute 5-Registry Cascade Resolution, inject cache anchors, and print token telemetry.

## Lifecycle Rules

1. **`init`**: Run `npx skill-orchestrator init` to move non-core global skills into unified shared archive vault (`~/.agents/skills_archive/`).
2. **`infer`**: Run `npx skill-orchestrator infer` when project scope locks or dependencies change. Print Telemetry Report.
3. **`sync`**: Run `npx skill-orchestrator sync` (or `npx skill-orchestrator sync --ide=<target>`) to capture manual `npx` skills into unified shared archive vault.
4. **`cleanup`**: Run `npx skill-orchestrator cleanup` upon project completion.
5. **`eject`**: Run `npx skill-orchestrator eject` to restore all archived skills back to global directory and uninstall cleanly (0 data loss).
