# Skill Orchestrator (v3.8.0)

> 面向 AI Coding Agent 的多源技能按需调度与 0 开局 Token 管理引擎。

[English](README.md) | [简体中文](README_CN.md)

---

## 🌟 用户核心功能与优势 (User Features & Benefits)

1. **⚡ 0 开局 Token 预算释放**：
   将数十个领域技能归档入全局冷库，开局上下文降低 95%+，对话速度提升 4 倍，大幅节省 Token 费用。

2. **🌐 全平台跨 IDE 资产共享**：
   在 Antigravity、Trae、Claude Code、Cursor、Windsurf 之间共享同一个私有冷库 (`~/.agents/skills_archive/`)，一次积累，全端通用。

3. **💬 直呼技能名 0ms 热激活**：
   无需敲繁琐命令行！在对话里直接说出技能名字（如 `apple-design` 或 `3d-web-experience`），AI 自动在后台秒级激活使用。

4. **🎨 分类可视化操控面板**：
   打开用户目录下的控制面板 [so_skills_registry.md](file:///C:/Users/Amasun-PC/.agents/so_skills_registry.md)，支持按领域（动效、Figma、工程、大数据、文档）直接打勾 `[x]` 或取消 `[ ]` 切换技能开关。

5. **⚡ 快捷指令系统 (`so-xxx`)**：
   提供 `so-status`（查 Token 健康卡）、`so-infer`（依赖匹配）、`so-sync`（同步冷库）、`so-cleanup`（结项清理）、`so-eject`（安全还原卸载）等极简交互。

---

## 🚀 安装与快捷指令 (Quick Start & Commands)

### 1. 通过 NPM 官方注册表安装
```bash
npx skills add skill-orchestrator
```

### 2. 通过 GitHub 仓库直接安装
```bash
npx skills add amasun/skill-orchestrator
```

### 快捷指令 (`so-xxx`)
```bash
# 1. 查阅 Token 诊断卡与技能控制面板
so-status  # 或 npx skill-orchestrator status

# 2. 多源依赖自动推断 (零沟通匹配代码与技能)
so-infer   # 或 npx skill-orchestrator infer

# 3. 自动同步冷库与更新可视化控制面板
so-sync    # 或 npx skill-orchestrator sync

# 4. 技能合并与去重引擎 (清理重复技能副本)
so-merge   # 或 npx skill-orchestrator merge

# 5. 项目结项一键清理 (退回 0-Token 共享冷库，恢复干净状态)
so-cleanup # 或 npx skill-orchestrator cleanup

# 6. 退出机制 (彻底还原所有技能并安全卸载，数据 0 丢失)
so-eject   # 或 npx skill-orchestrator eject
```

---

## 📊 Token 诊断汇报卡 (Token Telemetry Card)

使用 `so-status` 随时唤醒透明的健康卡片：

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

## ❓ 用户常见使用问答 (User Usage Q&A)

### Q1: 我平时开发代码时，需要手动去输入命令行吗？
**答**：不需要！你只需要像平时一样正常给 AI 发对话需求（例如：“*用 3D 效果做个页面*” 或 “*帮我重构这段代码*”），AI 会自动帮你推演匹配并按需装载技能，全程无需手动敲命令行。

### Q2: 如果我知道冷库里某个技能的名字，如何在对话中快速调用它？
**答**：直接在对话里说出技能名字（如 `apple-design` 或 `3d-web-experience`），AI Agent 会静默在后台 0ms 秒级激活并使用该技能，无需手动复制任何文件。

### Q3: 统一共享冷库支持跨 IDE（Antigravity, Trae, Claude Code, Cursor）无缝复用吗？
**答**：支持！系统默认将全平台统一共享冷库设置在 `~/.agents/skills_archive/`。你在 Antigravity 中积累归档的技能，打开 Trae、Claude Code 或 Cursor 可实现 0ms 无缝共享使用。

### Q4: 在 IDE 聊天框打出 `$` 键时，为什么有些技能没有出现在下拉自动补全菜单里？
**答**：常驻 Base 技能依然完美支持 `$` 键快捷补全；未在下拉菜单里的技能已被存入 0-Token 全局冷库（平时不占用开局内存），你只需在对话中**直接提及技能名字**即可直接唤醒。

### Q5: 除了配置文件之外，Skill Orchestrator 还能自动识别哪些代码特征？
**答**：能自动感知 5 大维度：1. 依赖配置文件（`package.json` / `requirements.txt` / `Cargo.toml`）；2. 代码特征后缀（如 `.glsl` / `.swift` / `.sqlx`）；3. 对话语义意图；4. 显式斜杠指令；5. 项目 `package.json` 历史技能清单。

### Q6: 我该如何查看当前项目装了哪些技能，以及它们消耗了多少 Token？
**答**：在对话框直接发送 `so-status`（或 `/so-status` / 对 AI 说“查看 Token 占用”），系统会立刻回复一份透明的 Token Telemetry 健康卡片。

### Q7: 如果我清理了项目临时技能 (`so-cleanup`)，后续重新打开项目如何找回原来使用过的技能？
**答**：项目使用过的技能会自动持久化记录在 `package.json` 的依赖清单中。后续重开项目只需发送一次 `so-infer`，推演引擎会自动读取清单并在 0ms 内从本地冷库一键精准还原！

### Q8: 从 Vercel 或 GitHub 云端临时拉取的技能，会自动污染我的个人私有冷库吗？
**答**：绝对不会！云端拉取的技能属于当前项目的“临时依赖”，仅存在于当前项目的临时目录中。运行 `so-cleanup` 结项清理时会自动随项目清理抹除，确保您的私有冷库 100% 纯净。

### Q9: 我想手动禁用或开启某些技能，应该在哪里勾选或修改？
**答**：打开用户全局目录下的控制面板 [so_skills_registry.md](file:///C:/Users/Amasun-PC/.agents/so_skills_registry.md)，直接在对应技能前的复选框勾选 `[x]` 或取消打勾 `[ ]`，保存文件即可直接生效。

### Q10: 如果我自己用 `npx skills add` 安装了新技能，系统能自动帮我收纳管理吗？
**答**：能！当你手动安装了新技能后，发送 `so-sync`（或 `/so-sync`），系统会自动捕获新技能并将其移入共享冷库，同时自动进行领域分类排版。

### Q11: 如果我想彻底卸载该工具并把所有技能还原回原始目录，该怎么做？
**答**：发送 `so-eject`（或 `/so-eject`），系统会将私有冷库中的所有技能 100% 原路还原恢复移动回各大 IDE 的原始目录并安全卸载，数据 0 丢失！
