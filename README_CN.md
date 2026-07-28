# Skill Orchestrator

> 面向 AI Coding Agent 的多源技能动态推断、按需装载与 0 开局 Token 调度引擎。

[English](README.md) | [简体中文](README_CN.md)

---

## 🔥 核心痛点与功能特点 (Pain Points & Core Capabilities)

在传统模式下，所有的 AI Agent 技能（Skills）都会在开局对话中被一次性预加载，导致极其严重的上下文浪费与私有资产碎片化。`skill-orchestrator` 通过建立全平台统一共享冷库与代码级动态推断，彻底解决了这一问题：

| 痛点问题 (Pain Point) | 传统模式 (All Preloaded) | 本策略架构 (Skill Orchestrator) | 核心功能特点 (Key Capability) |
| :--- | :--- | :--- | :--- |
| **开局 Token 占用** | ~9,757 Tokens (占用近 50% 预算槽) | **~0 - 500 Tokens** (降低 95%+) | **0 开局底座空间释放**：极简热底座与本地私有冷库隔离 |
| **私有技能碎片化** | 各 Agent / IDE 目录独立分散、重复拷贝 | **全平台统一共享冷库** (`~/.agents/skills_archive/`) | **全平台统一资产库**：在 Antigravity/Trae/Claude 全端 0ms 共享 |
| **技能调度与收拢** | 全局污染，项目间乱拉乱装 | **分优先级按需调度装载** (项目 > 共享冷库 > 云端) | **项目局部精准收拢**：所有项目技能精准收拢在 `./.agents/skills/` |
| **技能推断维度** | 依赖人类口语描述与 LLM 语义猜测 | **代码层 5 维自动推断** (扫 `package.json`/后缀/意图) | **零沟通代码依赖推断**：自动扫配置文件与 `.glsl`/`.swift` 等后缀 |
| **云端源覆盖度** | 单一依赖 Vercel 注册表 | **全网多云端源级联支持** (Vercel, Upskill, Orgs, CDN) | **全网注册表级联**：支持 Vercel / Upskill / GitHub / 国内 CDN |
| **响应速度与费用** | 每轮对话重复计算 10k Token 提示词 | **Prompt Cache 缓存锚点** (闪电提速 4x，费用降 90%) | **Prompt Cache 缓存注入**：自动注入 `<!-- @cache-control -->` 锚点 |
| **可观察性与监控** | 无法感知技能占用的具体 Token 权重 | **Token Telemetry 诊断仪表盘** (健康度柱状卡片) | **透明 Token 汇报卡**：随时使用 `/status` 查看健康卡片与来源追溯 |

---

## 📂 技能存储路径与加载优先级对照表 (Directory Paths & Priorities)

使用本插件后，技能资产在磁盘上的分布定位与优先级匹配关系如下：

| 目录路径 (Directory Path) | 目录角色与定位 | 加载与匹配优先级 | Token 空间影响 | 生命周期与清理 |
| :--- | :--- | :---: | :---: | :--- |
| **`<项目根目录>/.agents/skills/`** | **本项目专属动态技能目录** (Project Scope) | **第 1 优先级** (优先复用当前项目内已装载技能) | 仅在当前项目占用 (~300-500 Tokens) | 项目结项使用 `/cleanup` 一键清理 |
| **`~/.agents/skills_archive/`** | **全平台统一共享私有冷库** (Unified Shared Cold Vault) | **第 2 优先级** (命中即 0ms 复制入项目，跨 IDE 全端共享) | **0 Tokens** (完全冷冻，开局 0 占用) | 永久私有保存，绝对不随项目清理 |
| **`~/.<ide-or-agent>/skills/`** | **当前 IDE / Agent 全局热底座目录** (Hot Core Base) | **第 3 优先级** (仅常驻 2-3 个通用核心 Core Skill) | 保持极低开销 (&le; 500 Tokens) | 常驻热加载 |
| **`~/.gemini/config/skills/`**<br>**`~/.claude/skills/`**<br>**`~/.trae-cn/skills/`** | **各大 IDE 公共技能目录** (Public Skill Folders) | **自动巡检捕获** (检测用户手动 `npx` 安装的新技能) | 触发 `runSync` 后恢复极简 | 自动巡检移入统一共享冷库 `~/.agents/skills_archive/` |

---

## 🔍 5 维多源自动推断逻辑 (5-Layer Multi-Dimensional Inference Pipeline)

系统通过代码层与语义层的 5 维智能推断管道，零沟通精准判别并装载项目所需的技能：

```text
项目源码 / 配置 / 对话
 ├── 1. 包配置文件扫描 (package.json / requirements.txt / Cargo.toml / go.mod)
 ├── 2. 代码特征与后缀扫描 (.glsl / .swift / .sqlx / .figma.ts)
 ├── 3. 用户对话意图与语义匹配 ("做个磨砂玻璃 UI" / "检查 API 安全头")
 ├── 4. 显式斜杠快捷唤醒 (/solidity, /gsap-core)
 └── 5. 三级级联查找与去重锁 (项目局部 -> 共享冷库 -> 多云端源)
```

| 推断维度 | 触发探测源 | 典型匹配示例 |
| :--- | :--- | :--- |
| **1. 依赖配置文件** | `package.json`, `requirements.txt`, `Cargo.toml` | 扫到 `"three"` ➔ `3d-web-experience`；扫到 `"torch"` ➔ `ml-best-practices` |
| **2. 代码后缀特征** | `.glsl`, `.vert`, `.frag`, `.swift`, `.sqlx` | 发现 `.glsl` ➔ `web-shader-extractor`；发现 `.swift` ➔ `figma-swiftui` |
| **3. 对话语义意图** | 自然语言需求描述 | 提到“毛玻璃暗黑 UI” ➔ `ditther-dark-glass`；提到“SQL 注入审计” ➔ `upskill/sec-header` |
| **4. 显式斜杠唤醒** | 斜杠指令或唤醒词 | 输入 `/solidity` ➔ 显式精确装载 `solidity` 智能合约技能 |
| **5. 级联去重查找** | 磁盘目录锁 & 网络 API | 命中项目目录 (0ms) ➔ 命中共享冷库 (0ms) ➔ 级联多云端源 |

---

## 全网多云端源与本地注册表级联支持表 (Multi-Registry Universal Engine)

系统全面适配并内置实现了全网多云端与本地注册表源的按需匹配与精准拉取：

| 云端/本地来源 | 维护主体 | 核心差异化领域 | 自动化匹配/拉取逻辑 |
| :--- | :--- | :--- | :--- |
| **1. Vercel (`vercel-labs`)** | Vercel & 开源社区 | Web 前端、Next.js、UI/UX 规范 | `npx skills add <name>` |
| **2. Upskill (`upskill.dev`)** | 安全团队 | 恶意代码防御、安全审计、合规重构 | `npx upskill add <name>` |
| **3. 巨头官方 (`Stripe/Cloudflare`)**| 各大 Tech 巨头 | 官方 API、Serverless 边缘计算、数据库 | `npx skills add owner/repo` |
| **4. 国内 Gitee / CDN 节点** | Gitee / jsDelivr | 国内秒级响应 (Ping < 30ms) | `npx skills add vercel-labs/skills/<name>` |
| **5. 您的私有 GitHub 组织** | 您的团队 | 团队内部私有架构、商业护城河规范 | `npx skills add your-org/repo` |

---

## 四大工业级核心模块 (Four Core Modules)

```text
skill-orchestrator
 ├── 1. 依赖自动推断引擎 (Package/AST-Based Dependency Injection)
 ├── 2. Prompt 上下文缓存锚点 (Semantic Prompt Caching)
 ├── 3. 极速容错降级保障 (Fallback Engine)
 └── 4. Token 预算实时诊断仪表盘 (Token Budget Telemetry & Guard)
```

---

## 1. 三级混合拓扑架构图 (3-Tier Hybrid Architecture)

```mermaid
flowchart TD
    classDef hotStyle fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef coldStyle fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef cloudStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef phaseStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px;

    subgraph STORAGE["三级存储与技能源"]
        direction TB
        HotCore["1. 全局热存储 (Hot Core)<br>config/skills/<br>仅 2-3 个通用基础 Skill<br>(占用 Tokens &le; 500)"]:::hotStyle
        ColdArchive["2. 全平台统一共享私有冷库 (Unified Shared Cold Vault)<br>~/.agents/skills_archive/<br>跨 IDE 共享私有定制 Skill<br>(占用 Tokens = 0)"]:::coldStyle
        VercelCloud["3. Vercel 云端插件库 (Vercel Cloud Registry)<br>vercel-labs/skills API<br>海量开源社区 Skill 资源库<br>(占用 Tokens = 0)"]:::cloudStyle
    end

    subgraph LIFECYCLE["项目生命周期全流程"]
        direction TB
        P1["Phase 1: 需求讨论期<br>・项目目录 0 技能<br>・极速沟通产品文档/架构<br>・Tokens 0 额外开销"]:::phaseStyle
        P2["Phase 2: 级联匹配与多源依赖推断<br>・Auto-Infer: 自动扫配置文件/后缀<br>・1st 优先检索: 共享私有冷库<br>・2nd 云端拉取: Vercel 云端库<br>・首轮自动输出多源标注与 Token 健康卡"]:::phaseStyle
        P3["Phase 3: 核心开发与单向增量<br>・常驻项目专属技能<br>・中途新需求: 增量补充<br>・严禁中途频繁删除 (防废料)"]:::phaseStyle
        P4["Phase 4: 大版本交付与清理<br>・项目大版本完结<br>・统一清理项目下 .agents/skills/<br>・恢复项目干净状态"]:::phaseStyle

        P1 --> P2 --> P3 --> P4
    end

    ColdArchive -.->|优先级 1: 私有匹配| P2
    VercelCloud -.->|优先级 2: 云端拉取| P2
```

---

## 2. 手动 `npx` 安装自动捕获巡检图 (Manual Skill Auto-Sync)

```mermaid
flowchart TD
    UserAction["用户手动在终端执行:<br>npx skills add (新技能名)"] --> PublicFolder["放置于公共目录:<br>config/skills/"]
    PublicFolder --> Trigger["AI 开启新对话 或 运行 npm run sync"]
    Trigger --> Detect["runSync() 自动差异比对:<br>发现非 Core 的新增技能文件夹"]
    Detect --> Migrate["自动迁移到共享私有冷库:<br>Move 新技能 到 ~/.agents/skills_archive/"]
    Migrate --> Result["全局开局 Token 瞬间恢复极简状态 (&le; 500 Tokens)!"]
```

---

## 汇报卡触发与手动唤醒规范 (Telemetry Report Protocol)

### 唤醒/触发的四种方式：
1. **首轮自动触发**：新项目需求定稿 / 中途新增大模块技能时，AI 在回复末尾自动呈现。
2. **斜杠指令唤醒（最推荐）**：在对话框输入 `/status`（利用 IDE 的 Tab 键自动补全）。
3. **自然语言唤醒**：对 AI 说“查看 Token 占用”、“技能诊断”、“当前项目装了哪些技能”。
4. **命令行唤醒（开发者）**：在项目终端运行 `npm run status`（等价于执行 `node scripts/orchestrate.js status`）。

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

---

## Node.js 环境自愈与静默安装 (Node.js Environment Self-Healing)

如果用户的电脑尚未安装 Node.js 环境，AI Agent 在执行任何调度指令前会自动检测并**利用操作系统内置包管理器后台静默安装 Node.js**，无需用户手动去官网下载配置：

```bash
# Windows (利用系统内置 winget 静默后台安装，0 弹窗)
winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements

# macOS (利用 Homebrew 自动静默安装)
brew install node

# Linux (Debian/Ubuntu 静默安装)
sudo apt-get update -y && sudo apt-get install -y nodejs npm
```

---

## 安装与使用

### 一键安装 (Distribution)
```bash
npx skills add amasun/skill-orchestrator
```

### 命令行工具操作（开发者备用）
```bash
# 1. 多源依赖自动推断 (自动读取配置文件/代码后缀零沟通匹配技能)
node scripts/orchestrate.js infer   # 或 npm run infer

# 2. 自动巡检检测用户手动 npx 安装的新技能并移入共享冷库
node scripts/orchestrate.js sync    # 或 npm run sync

# 3. Token 预算诊断仪表盘 / 汇报卡手动唤醒 (查看精确 Token 占用与健康度)
node scripts/orchestrate.js status  # 或 npm run status

# 4. 项目结项一键清理
node scripts/orchestrate.js cleanup # 或 npm run cleanup

# 5. 退出机制 (还原所有归档技能至全局目录并彻底卸载，0 数据丢失)
node scripts/orchestrate.js eject   # 或 npm run eject
```

---

## 斜杠指令与自然语言触发 (Triggers & Shortcuts)

在 AI 对话框中，无需输入命令行，直接使用**斜杠指令**或**自然语言**即可自动触发后台操作：

| 斜杠指令 (最推荐 - 支持 IDE 敲 / 自动补全) | 替代语法 | 自然语言口语表述 | 后台自动执行 |
| :---: | :---: | :--- | :--- |
| **`/status`** | `$status` / `status` | **“查看 Token 占用”、“技能诊断”** | `node scripts/orchestrate.js status` (`npm run status`) |
| **`/init`** | `$init` / `init` | **“初始化技能库”、“清空开局占用”** | `node scripts/orchestrate.js init` (`npm run init`) |
| **`/infer`** | `$infer` / `infer` | **“检查依赖”、“自动匹配技能”** | `node scripts/orchestrate.js infer` (`npm run infer`) |
| **`/sync`** | `$sync` / `sync` | **“刚才 npx 装了新技能，整理一下”** | `node scripts/orchestrate.js sync` (`npm run sync`) |
| **`/cleanup`** | `$cleanup` / `cleanup` | **“项目开发完成了”、“清理临时技能”** | `node scripts/orchestrate.js cleanup` (`npm run cleanup`) |
| **`/eject`** | `$eject` / `eject` / `uninstall` | **“恢复技能并卸载”、“退出调度管理”** | `node scripts/orchestrate.js eject` (`npm run eject`) |

---

## 常见问题解答 (Q&A)

### Q1: 为什么我的 AI 工具一开启对话就会占用近 10,000 个 Tokens？
**答**：默认模式会将所有安装的技能简介全部预载入开局提示词。`skill-orchestrator` 通过建立全平台统一共享私有冷库（`~/.agents/skills_archive/`），将开局占用直接从 9,757 压降到 500 个 Tokens 以内（降低 95%+）。

### Q2: 统一共享私有冷库支持跨 IDE（Antigravity, Trae, Claude Code）复用吗？
**答**：是的！系统默认将全平台统一共享私有冷库设置在 `~/.agents/skills_archive/`。在 Antigravity 中积累归档的技能，打开 Trae 或 Claude Code 可实现 0ms 无缝共享使用。

### Q3: 除了 package.json 之外，AI 还能从哪些地方自动推断技能？
**答**：支持 5 大维度推断：1. Node 的 `package.json`；2. Python 的 `requirements.txt` / Rust 的 `Cargo.toml` / Go 的 `go.mod`；3. 代码特征后缀（如 `.glsl` / `.swift` / `.sqlx`）；4. 自然语言对话意图；5. 显式输入 `/技能名` 唤醒。

### Q4: 在多源检索拉取时，如何保证技能绝不重复、绝不冲突？
**答**：采用“1st 优先命中即短路截断”原则（本地冷库 > CDN 镜像 > 云端库）与“本地文件锁幂等校验”，确保相同技能有且仅有一份装载，0 冲突 0 重复。

### Q5: 技能只在项目本地装载，会随着对话轮数变长而越来越占 Token 吗？
**答**：不会。项目本地技能属于固定的开局静态上下文，在整个项目开发期间只占用一次固定的额度 (约 300~500 Tokens)，绝不会随对话轮数翻倍。

### Q6: 汇报卡可以通过哪些方式手动唤醒查看？/status 会和 IDE 内置命令冲突吗？
**答**：支持四种方式：1. 对话框直接发斜杠指令 `/status`（支持 Tab 键补全）；2. 发送 `$status` 或 `status`；3. 对 AI 说“查看 Token 占用”；4. 在终端运行 `npm run status`。不会冲突，亦支持 100% 独占具名指令 `/skill-status`。

### Q7: 为什么开发过程中采用“单向增量追加 (只增不删)”策略？
**答**：如果中途删掉技能，当再次需要该技能时，AI 必须重新发起搜索并重新拷贝，这产生的重复工具调用和对话废料比技能占用的 Token 昂贵得多。“只增不删”能保证逻辑连贯且最省 Token。

### Q8: 从 Vercel / Upskill 等云端临时拉取的技能，会自动存入我的个人私有冷库吗？
**答**：绝对不会。云端拉取的技能被视为“临时项目依赖”，仅保存在当前项目的临时目录中。项目结项清理 (`cleanup`) 时会自动随项目删除，确保您的个人私有冷库始终 100% 纯净。

### Q9: 如果我自己手动在终端敲 `npx skills add` 安装了新技能，系统能感知吗？
**答**：能。系统内置 `runSync` 自动巡检机制。在新会话开启或运行 `npm run sync` 时，会自动捕获手动安装的公有技能并将其迁移移入共享冷库，防止开局 Token 再次膨胀。

### Q10: 如果我不想用了，如何彻底退出并还原所有技能？(Eject 机制)
**答**：只需在对话框发送 `/eject`（或在终端运行 `npm run eject`），系统会**自动将私有冷库中的所有技能 100% 还原移动回全局目录**，并安全删除冷库与相关配置，系统瞬间恢复至默认原始状态，**保证 0 数据丢失！**


