# Skill Orchestrator

> 开源 Agent 技能动态调度与 **0 底座 Token 优化** 工业级系统 (v2.2)。

---

## 项目生命周期技能动态调度架构规范 (Project Skill Orchestration Strategy)

> **版本**：v2.2.0 (工业级 5 大云端源全适配版)  
> **核心原则**：多源依赖自动推断 · 5 大云端源级联匹配 · 首轮自动透明汇报(极简来源标注) · Prompt 缓存锚点 · 熔断降级保障 · Token 预算实时诊断仪表盘  

---

## 📢 汇报卡触发与手动唤醒规范 (Telemetry Report Protocol)

### 唤醒/触发的四种方式：
1. **首轮自动触发**：新项目需求定稿 / 中途新增大模块技能时，AI 在回复末尾自动呈现。
2. **斜杠指令唤醒（最推荐）**：在对话框输入 `/status`（利用 IDE 的 Tab 键自动补全）。
3. **自然语言唤醒**：对 AI 说“查看 Token 占用”、“技能诊断”、“当前项目装了哪些技能”。
4. **命令行唤醒（开发者）**：在项目终端运行 `npm run status`。

```text
------------------------------------------------------------
[Project Skills & Token Telemetry]
------------------------------------------------------------
全局热底座开销 : ~420 Tokens [Status: Healthy 🟢]
本项目专属装载 : 
   ├── 3d-web-experience   : 450 Tokens (来源: 本地冷库 | 推断: package.json)
   ├── gsap-core           : 320 Tokens (来源: 本地冷库 | 推断: package.json)
   ├── ml-best-practices   : 580 Tokens (来源: 本地冷库 | 推断: requirements.txt)
   ├── web-shader-extractor: 380 Tokens (来源: 本地冷库 | 推断: 代码特征 [.glsl])
   ├── dataform-bigquery   : 410 Tokens (来源: 本地冷库 | 推断: 代码特征 [.sqlx])
   ├── figma-swiftui       : 520 Tokens (来源: 本地冷库 | 推断: 代码特征 [.swift])
   ├── ditther-dark-glass  : 390 Tokens (来源: 本地冷库 | 推断: 需求意图)
   ├── upskill/sec-header  : 460 Tokens (来源: Upskill安全库 | 推断: 安全审计)
   ├── stripe/agent-skills : 510 Tokens (来源: GitHub组织(stripe) | 推断: 依赖匹配)
   ├── solidity            : 490 Tokens (来源: Gitee/CDN镜像 | 推断: 需求意图)
   ├── svelte-kit          : 470 Tokens (来源: Vercel云端 | 仅存项目临时目录 | 推断: 需求意图)
   └── custom-auth-gate    : 310 Tokens (来源: 本地微模板降级 | 推断: 离线兜底)
------------------------------------------------------------
本项目总底座开销 : 5,710 Tokens (较默认全载节省 41.5% 空间)
Prompt Cache 锚点: 已自动注入 (响应速度提升 4x)
============================================================
```

---

## 🌐 5 大云端/本地注册表级联支持表 (5-Registry Universal Engine)

系统全面适配并内置实现了全网 5 大云端与本地注册表源的按需匹配与精准拉取：

| 云端/本地来源 | 维护主体 | 核心差异化领域 | 自动化匹配/拉取逻辑 |
| :--- | :--- | :--- | :--- |
| **1. Vercel (`vercel-labs`)** | Vercel & 开源社区 | Web 前端、Next.js、UI/UX 规范 | `npx skills add <name>` |
| **2. Upskill (`upskill.dev`)** | 安全团队 | 恶意代码防御、安全审计、合规重构 | `npx upskill add <name>` |
| **3. 巨头官方 (`Stripe/Cloudflare`)**| 各大 Tech 巨头 | 官方 API、Serverless 边缘计算、数据库 | `npx skills add owner/repo` |
| **4. 国内 Gitee / CDN 节点** | Gitee / jsDelivr | 国内秒级响应 (Ping < 30ms) | `npx skills add vercel-labs/skills/<name>` |
| **5. 您的私有 GitHub 组织** | 您的团队 | 团队内部私有架构、商业护城河规范 | `npx skills add your-org/repo` |

---

## 架构背景与核心痛点

| 痛点问题 | 传统模式 (All Preloaded) | 本策略架构 (v2.2.0 工业级全模块架构) |
| :--- | :--- | :--- |
| **开局 Token 占用** | ~9,757 Tokens (占用近 50% 预算槽) | **~0 - 500 Tokens** (节省 95%+) |
| **技能推断维度** | 依赖人类口头语言描述与 LLM 语义猜测 | **代码层多源自动推断** (读 `package.json`/语言配置文件/代码后缀 + 语义) |
| **云端源覆盖度** | 单一依赖 Vercel 注册表 | **全网 5 大云端源级联支持** (Vercel, Upskill, GitHub Orgs, CDN, 私有Org) |
| **响应速度与费用** | 每轮对话重复计算 10k Token 提示词 | **Prompt Cache 缓存锚点** (闪电提速 4x，费用降低 90%) |
| **网络离线高可用** | 网络超时断网导致云端拉取崩溃中断 | **熔断降级引擎** (自动生成 Local Micro-Template 降级兜底) |
| **可观察性与监控** | 无法感知技能占用的具体 Token 权重 | **Token Telemetry 诊断仪表盘** (可视健康度柱状输出 + 多源标注) |

---

## 安装与使用

### 一键安装 (Distribution)
```bash
npx skills add amasun/skill-orchestrator
```

### 命令行工具操作（开发者备用）
```bash
# 1. 多源依赖自动推断 (自动读取配置文件/代码后缀零沟通匹配技能)
npm run infer

# 2. 自动巡检检测用户手动 npx 安装的新技能并移入私有冷库
npm run sync

# 3. Token 预算诊断仪表盘 / 汇报卡手动唤醒 (查看精确 Token 占用与健康度)
npm run status

# 4. 项目结项一键清理
npm run cleanup
```

---

## 🗣️ 斜杠指令与自然语言触发 (Triggers & Shortcuts)

在 AI 对话框中，无需输入命令行，直接使用**斜杠指令**或**自然语言**即可自动触发后台操作：

| 斜杠指令 (支持 Tab 补全) | 替代语法 | 自然语言口语表述 | 后台自动执行 |
| :---: | :---: | :--- | :--- |
| **`/status`** | `$status` / `status` | **“查看 Token 占用”、“技能诊断”** | `npm run status` |
| **`/init`** | `$init` / `init` | **“初始化技能库”、“清空开局占用”** | `npm run init` |
| **`/infer`** | `$infer` / `infer` | **“检查依赖”、“自动匹配技能”** | `npm run infer` |
| **`/sync`** | `$sync` / `sync` | **“刚才 npx 装了新技能，整理一下”** | `npm run sync` |
| **`/cleanup`** | `$cleanup` / `cleanup` | **“项目开发完成了”、“清理临时技能”** | `npm run cleanup` |

---

## ❓ 常见问题解答 (Q&A)

### Q1: 为什么我的 AI 工具一开启对话就会占用近 10,000 个 Tokens？
**答**：默认模式会将所有安装的技能简介预载入开局提示词。`skill-orchestrator` 通过建立私有冷库，将开局占用直接从 9,757 压降到 500 个 Tokens 以内（降低 95%+）。

### Q2: 真的支持全部 5 大云端/本地注册表源吗？
**答**：是的！系统底层原生支持 Vercel、Upskill 安全库、GitHub 巨头 Org 仓库 (`owner/repo`)、Gitee/jsDelivr CDN 镜像以及团队私有组织仓库。

### Q3: 汇报卡可以通过哪些方式手动唤醒查看？
**答**：支持四种方式：1. 对话框直接发斜杠指令 `/status`；2. 发送 `$status` 或 `status`；3. 对 AI 说“查看 Token 占用”；4. 在项目终端运行 `npm run status`。

---

## 变更与迭代历史 (Changelog)

- **v2.2.0 (2026-07-28)**：全盘在底层代码实现 5 大云端/本地注册表源的自动匹配与精准拉取，汇报卡包含最全数据类型展示。
- **v2.0.2 (2026-07-28)**：重构文档排版逻辑，将对话框触发指引收拢放置于开发者命令行工具之后。
- **v2.0.0 (2026-07-28)**：全面实现 v2.0 工业级四大核心模块。
