# Skill Orchestrator (v3.8.0)

> Dynamic Project Skill Orchestrator & 0 Base Token Budget Management Engine for AI Coding Agents.

[English](README.md) | [简体中文](README_CN.md)

---

## 🌟 User Features & Key Benefits

1. **⚡ Zero Base Token Context Release**:
   Archives 66+ domain skills into a shared cold vault, reducing base context overhead by 95%+ and accelerating response speeds by 4x.

2. **🌐 Unified Cross-IDE Shared Asset Vault**:
   Shares a single private cold vault (`~/.agents/skills_archive/`) across Antigravity, Trae, Claude Code, Cursor, and Windsurf. Collect once, use everywhere.

3. **💬 Direct Skill Name Mention Auto-Activation**:
   No manual CLI commands needed! Simply mention a skill name in chat (e.g. `apple-design` or `3d-web-experience`), and the AI silently activates it in 0ms.

4. **🎨 Categorized Visual Control Panel**:
   Open [so_skills_registry.md](file:///C:/Users/Amasun-PC/.agents/so_skills_registry.md) to toggle skills on `[x]` or off `[ ]` across domain categories (UI/UX, Figma, Engineering, BigData, Docs).

5. **⚡ Short Aliases & Directives (`so-xxx`)**:
   Provides simple directives: `so-status` (Health Card), `so-infer` (Dependency Matching), `so-sync` (Vault Sync), `so-cleanup` (Project Cleanup), and `so-eject` (Safe Restore).

---

## 🚀 Quick Start & Commands

### 1. Install via Official NPM Registry
```bash
npx skills add skill-orchestrator
```

### 2. Install via GitHub Repository
```bash
npx skills add amasun/skill-orchestrator
```

### Quick Directives (`so-xxx`)
```bash
# 1. Inspect Token budget health card & control panel
so-status  # or npx skill-orchestrator status

# 2. Auto-infer dependencies based on project code & stack
so-infer   # or npx skill-orchestrator infer

# 3. Synchronize cold vault & update visual control panel
so-sync    # or npx skill-orchestrator sync

# 4. Merge & deduplicate cold archive skills
so-merge   # or npx skill-orchestrator merge

# 5. Project milestone cleanup (Return to 0-Token cold state)
so-cleanup # or npx skill-orchestrator cleanup

# 6. Eject & safely restore all skills to original IDE paths
so-eject   # or npx skill-orchestrator eject
```

---

## 📊 Token Telemetry Health Card

Use `so-status` to display the transparent Token health report:

```text
------------------------------------------------------------
[Project Skills & Token Telemetry]
------------------------------------------------------------
Global Base Overhead : ~420 Tokens [Status: Healthy 🟢]
Project-Scoped Skills: 
   ├── 3d-web-experience   : 450 Tokens (Origin: Cold Archive)
   ├── web-shader-extractor: 380 Tokens (Origin: Code Feature [.glsl])
   └── stripe/agent-skills : 510 Tokens (Origin: GitHub Org)
------------------------------------------------------------
Total Project Token Overhead : 1,760 Tokens (Save 82% vs Preload All)
Prompt Cache Anchor          : Injected (4x Speedup)
============================================================
```

---

## ❓ User Usage FAQ (Q&A)

### Q1: Do I need to manually run CLI commands during normal coding?
**A**: No! Simply chat with your AI agent as usual (e.g., *"Build a 3D portfolio"* or *"Refactor this code"*). The AI automatically infers, matches, and hot-loads skills on-demand without manual CLI commands.

### Q2: How can I invoke a specific skill from the cold vault by name?
**A**: Simply mention the skill name in your prompt (e.g., `apple-design` or `3d-web-experience`). The AI agent silently hot-loads the skill into the project in 0ms with zero manual file copying.

### Q3: Does the shared cold vault support cross-IDE reuse (Antigravity, Trae, Claude, Cursor)?
**A**: Yes! The shared cold vault lives at `~/.agents/skills_archive/`. Skills archived in Antigravity are 0ms shared across Trae, Claude Code, Cursor, Windsurf, etc.

### Q4: Why don't some skills show up in the IDE `$` autocomplete dropdown menu?
**A**: Base Meta-Skills fully support `$` autocomplete. Cold Archive Skills are kept in 0-Token cold storage (to save budget); mentioning their name directly in chat instantly triggers 0ms hot loading.

### Q5: What code features can Skill Orchestrator automatically detect beyond package.json?
**A**: Detects 5 dimensions: 1. Dependency config files (`package.json`, `requirements.txt`, `Cargo.toml`); 2. Code file extensions (`.glsl`, `.swift`, `.sqlx`); 3. Dialogue intent; 4. Explicit slash directives; 5. Historic project skill manifests.

### Q6: How do I check active skills and Token overhead for my current project?
**A**: Send `so-status` (or `/so-status` / ask the AI *"Check token overhead"*). The orchestrator returns a transparent Token Telemetry card.

### Q7: If I clean project skills (`so-cleanup`), how do I recover used skills when re-opening a project?
**A**: Used skills are persisted in `package.json`. Re-opening a project and sending `so-infer` automatically reads the manifest and restores skills from the cold vault in 0ms!

### Q8: Will cloud skills pulled from Vercel/GitHub pollute my private cold vault?
**A**: Never! Cloud skills are treated as temporary project dependencies. Running `so-cleanup` wipes them with project teardown, keeping your private cold vault 100% clean.

### Q9: How can I manually disable or enable specific skills?
**A**: Open [so_skills_registry.md](file:///C:/Users/Amasun-PC/.agents/so_skills_registry.md) and check `[x]` or uncheck `[ ]` next to any skill. Save the file to apply immediately.

### Q10: If I manually install a new skill with `npx skills add`, will it be auto-archived?
**A**: Yes! Send `so-sync` (or `/so-sync`). The orchestrator automatically detects the new skill, moves it to the cold archive, and categorizes it in the Markdown panel.

### Q11: How can I safely uninstall and restore all skills to original IDE paths?
**A**: Send `so-eject` (or `/so-eject`). The system restores 100% of archived skills back to their original IDE folders with 0 data loss and uninstalls safely.
