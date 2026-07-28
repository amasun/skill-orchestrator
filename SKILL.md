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

## 🏛️ Orchestration Protocol & Workflow

When this skill is active, the AI Agent adheres to the following lifecycle workflow:

1. **Initialization (`init`)**:
   - Creates a local cold archive repository (`skills_archive/`).
   - Moves non-core global skills into archive, reducing global base tokens by 90%+.
2. **Requirements Alignment Phase**:
   - 0 extra skills loaded in the project directory. Rapid, lightweight product requirement discussion.
3. **Requirements Finalization Phase (`auto-match`)**:
   - AI automatically matches project tech stack against cold archive (or Vercel cloud registry).
   - Copies matching 2-3 skills into `./.agents/skills/`.
4. **Development Execution Phase (`Incremental Addition`)**:
   - Single-directional addition. Never deletes active skills mid-development to prevent context fragmentation.
5. **Project Offboarding Phase (`cleanup`)**:
   - Cleans project-level skills after project completion.

---

## 🛠️ CLI Operations

- `node scripts/orchestrate.js init` - Setup archive vault and optimize global skills.
- `node scripts/orchestrate.js auto-match` - Match and copy skills to project.
- `node scripts/orchestrate.js cleanup` - Clean project-level skills upon completion.
- `node scripts/orchestrate.js status` - Display active vs archived skills status.
