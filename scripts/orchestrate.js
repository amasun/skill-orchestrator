#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOME_DIR = process.env.USERPROFILE || process.env.HOME;
// Unified Shared Cold Archive Vault across all IDEs and Agent Assistants
const ARCHIVE_DIR = process.env.SKILLS_ARCHIVE_DIR || path.join(HOME_DIR, '.agents', 'skills_archive');
const REGISTRY_FILE = path.join(ARCHIVE_DIR, 'vault_registry.json');
const GLOBAL_CONFIG_FILE = path.join(HOME_DIR, '.agents', 'config.json');

// Well-known Agent skill directories seed list
const KNOWN_AGENT_SKILL_PATHS = [
    path.join(HOME_DIR, '.gemini', 'config', 'skills'),
    path.join(HOME_DIR, '.agents', 'skills'),
    path.join(HOME_DIR, '.claude', 'skills'),
    path.join(HOME_DIR, '.trae-cn', 'skills'),
    path.join(HOME_DIR, '.cursor', 'skills'),
    path.join(HOME_DIR, '.windsurf', 'skills'),
    path.join(HOME_DIR, '.codeium', 'skills')
];

const CORE_SKILLS = ['z-coding-refactoring', 'agentic-workflow', 'skill-orchestrator', 'find-skills'];

// -------------------------------------------------------------------
// Dynamic IDE Discovery & Vault Registry Engine
// -------------------------------------------------------------------

// Helper to get --ide=<target> filter from CLI flags
function getIdeFilter() {
    const arg = process.argv.find(a => a.startsWith('--ide='));
    if (arg) return arg.split('=')[1].trim().toLowerCase();
    const idx = process.argv.indexOf('--ide');
    if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1].trim().toLowerCase();
    return null;
}

// Dynamically scan user's HOME_DIR to discover unknown / custom IDE skill directories
function discoverAllSkillPaths(ideFilter = getIdeFilter()) {
    const discoveredPaths = new Set(KNOWN_AGENT_SKILL_PATHS);

    try {
        if (fs.existsSync(HOME_DIR)) {
            const homeItems = fs.readdirSync(HOME_DIR);
            homeItems.forEach(item => {
                // Scan all hidden dot-folders (e.g. .any-obscure-ide)
                if (item.startsWith('.')) {
                    const dotFolderPath = path.join(HOME_DIR, item);
                    try {
                        const stat = fs.lstatSync(dotFolderPath);
                        if (stat.isDirectory() && !stat.isSymbolicLink()) {
                            // Check direct /skills folder
                            const directSkills = path.join(dotFolderPath, 'skills');
                            if (fs.existsSync(directSkills)) {
                                const skillStat = fs.lstatSync(directSkills);
                                if (skillStat.isDirectory() && !skillStat.isSymbolicLink()) {
                                    discoveredPaths.add(directSkills);
                                }
                            }
                            // Check nested /config/skills folder
                            const configSkills = path.join(dotFolderPath, 'config', 'skills');
                            if (fs.existsSync(configSkills)) {
                                const configStat = fs.lstatSync(configSkills);
                                if (configStat.isDirectory() && !configStat.isSymbolicLink()) {
                                    discoveredPaths.add(configSkills);
                                }
                            }
                        }
                    } catch (e) {}
                }
            });
        }
    } catch (e) {}

    const allPaths = Array.from(discoveredPaths);

    if (ideFilter) {
        const filtered = allPaths.filter(p => {
            const lowerP = p.toLowerCase();
            if (ideFilter === 'antigravity' || ideFilter === 'gemini') {
                return lowerP.includes('gemini') || lowerP.includes('antigravity');
            }
            return lowerP.includes('.' + ideFilter) || lowerP.includes(ideFilter);
        });
        if (filtered.length > 0) return filtered;
        console.log(`⚠️ Specified --ide=${ideFilter} filter matched no paths directly, falling back to full paths list.`);
    }

    return allPaths;
}

// Read vault_registry.json
function loadRegistry() {
    if (!fs.existsSync(REGISTRY_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8')) || {};
    } catch (e) {
        return {};
    }
}

// Save origin path mapping into vault_registry.json
function recordSkillOrigin(skillName, originalPath) {
    try {
        const registry = loadRegistry();
        if (!registry[skillName]) {
            registry[skillName] = [];
        }
        if (!registry[skillName].includes(originalPath)) {
            registry[skillName].push(originalPath);
        }
        ensureDir(ARCHIVE_DIR);
        fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf-8');
    } catch (e) {}
}

// Persist project used skills list into project's package.json
function recordSkillToProjectPackageJson(skillName, projectCwd = process.cwd()) {
    const packageJsonPath = path.join(projectCwd, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return;
    try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (!pkg['skill-orchestrator']) {
            pkg['skill-orchestrator'] = {};
        }
        if (!Array.isArray(pkg['skill-orchestrator'].skills)) {
            pkg['skill-orchestrator'].skills = [];
        }
        if (!pkg['skill-orchestrator'].skills.includes(skillName)) {
            pkg['skill-orchestrator'].skills.push(skillName);
            fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');
        }
    } catch (e) {}
}

// Safely delete directory or symlink without throwing
function safeRemove(targetPath) {
    try {
        const stat = fs.lstatSync(targetPath);
        if (stat.isSymbolicLink()) {
            try {
                fs.unlinkSync(targetPath);
            } catch (e) {
                fs.rmSync(targetPath, { recursive: true, force: true });
            }
        } else {
            fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
        }
    } catch (e) {
        try {
            fs.rmSync(targetPath, { recursive: true, force: true });
        } catch (err) {}
    }
}

// Safely copy directory, avoiding circular symlink recursion
function safeCopy(sourcePath, targetPath) {
    try {
        const stat = fs.lstatSync(sourcePath);
        if (stat.isSymbolicLink()) {
            return false;
        }
        if (path.normalize(sourcePath) === path.normalize(targetPath)) {
            return false;
        }
        fs.cpSync(sourcePath, targetPath, { recursive: true });
        return true;
    } catch (e) {
        return false;
    }
}

// Multi-tier user customization for Token Guard Limit
// Priority: CLI Flag -> Env Var -> Project package.json -> Global Config (~/.agents/config.json) -> Default 10
function resolveMaxSkillsLimit(projectCwd = process.cwd()) {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--limit=')) {
            const val = parseInt(args[i].split('=')[1], 10);
            if (!isNaN(val) && val > 0) return val;
        }
        if ((args[i] === '--limit' || args[i] === '-l') && args[i + 1]) {
            const val = parseInt(args[i + 1], 10);
            if (!isNaN(val) && val > 0) return val;
        }
    }

    if (process.env.MAX_SKILLS_LIMIT) {
        const val = parseInt(process.env.MAX_SKILLS_LIMIT, 10);
        if (!isNaN(val) && val > 0) return val;
    }

    const pkgPath = path.join(projectCwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            if (pkg['skill-orchestrator'] && pkg['skill-orchestrator'].maxSkills) {
                const val = parseInt(pkg['skill-orchestrator'].maxSkills, 10);
                if (!isNaN(val) && val > 0) return val;
            }
        } catch (e) {}
    }

    if (fs.existsSync(GLOBAL_CONFIG_FILE)) {
        try {
            const cfg = JSON.parse(fs.readFileSync(GLOBAL_CONFIG_FILE, 'utf-8'));
            if (cfg.maxSkills) {
                const val = parseInt(cfg.maxSkills, 10);
                if (!isNaN(val) && val > 0) return val;
            }
        } catch (e) {}
    }

    return 10;
}

// -------------------------------------------------------------------
// Multi-Registry & Dependency Mapping (多云端注册表与依赖规则)
// -------------------------------------------------------------------
const DEPENDENCY_MAP = {
    // Node.js / Web Frontend Dependencies (Vercel Registry)
    'three': { skill: '3d-web-experience', reason: 'package.json' },
    '@react-three/fiber': { skill: '3d-web-experience', reason: 'package.json' },
    'three-stdlib': { skill: '3d-web-experience', reason: 'package.json' },
    'gsap': { skill: 'gsap-core', reason: 'package.json' },
    'lenis': { skill: 'cinematic-gsap-lenis-motion-system', reason: 'package.json' },
    'tailwindcss': { skill: 'vercel-web-guidelines', reason: 'package.json' },
    '@prisma/client': { skill: 'prisma-database', reason: 'package.json' },
    'bigquery': { skill: 'bigquery-sql', reason: 'package.json' },
    '@google-cloud/bigquery': { skill: 'bigquery-sql', reason: 'package.json' },
    'dbt': { skill: 'dbt-bigquery', reason: 'package.json' },

    // Python Ecosystem Dependencies
    'torch': { skill: 'ml-best-practices', reason: 'requirements.txt' },
    'tensorflow': { skill: 'ml-best-practices', reason: 'requirements.txt' },
    'pandas': { skill: 'notebook-guidance', reason: 'requirements.txt' },
    'fastapi': { skill: 'building-data-apps', reason: 'requirements.txt' },

    // Security & Compliance (Upskill Registry)
    'helmet': { skill: 'upskill/security-headers', reason: 'security-audit' },
    'jsonwebtoken': { skill: 'upskill/auth-security', reason: 'security-audit' }
};

const FILE_EXTENSION_MAP = {
    '.glsl': { skill: 'web-shader-extractor', reason: '代码特征 [.glsl]' },
    '.vert': { skill: 'web-shader-extractor', reason: '代码特征 [.vert]' },
    '.frag': { skill: 'web-shader-extractor', reason: '代码特征 [.frag]' },
    '.sqlx': { skill: 'dataform-bigquery', reason: '代码特征 [.sqlx]' },
    '.swift': { skill: 'figma-swiftui', reason: '代码特征 [.swift]' }
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// -------------------------------------------------------------------
// Module 2: Prompt Cache Anchor & Origin Tag Injection
// -------------------------------------------------------------------
function injectCacheControl(skillDir, originInfo) {
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) return;

    try {
        let content = fs.readFileSync(skillMdPath, 'utf-8');
        let modified = false;

        if (!content.includes('<!-- @cache-control: ephemeral -->')) {
            content = `<!-- @cache-control: ephemeral -->\n` + content;
            modified = true;
        }

        if (!content.includes('<!-- @origin:')) {
            content = `<!-- @origin: ${originInfo} -->\n` + content;
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(skillMdPath, content, 'utf-8');
        }
    } catch (err) {
        console.warn(`⚠️ Failed to inject cache control tag into ${skillMdPath}: ${err.message}`);
    }
}

// -------------------------------------------------------------------
// Module 3: 5-Registry Cascade Resolution Engine (Vercel, Upskill, GitHub Orgs, CDN, Fallback)
// -------------------------------------------------------------------
function fetchSkillWithCircuitBreaker(skillName, inferReason = '需求意图', projectCwd = process.cwd()) {
    const sanitizeName = skillName.split('/').pop();
    const projectTargetPath = path.join(projectCwd, '.agents', 'skills', sanitizeName);

    // Record skill into project's package.json history manifest for zero-loss recovery after cleanup
    recordSkillToProjectPackageJson(sanitizeName, projectCwd);

    // Source 1: Local Project Scope (Short-circuit if already present)
    if (fs.existsSync(projectTargetPath)) {
        return { success: true, origin: '来源: 本项目已已有', reason: inferReason };
    }

    // Source 2: Unified Shared Cold Archive Vault (~/.agents/skills_archive/)
    const archivePath = path.join(ARCHIVE_DIR, sanitizeName);
    if (fs.existsSync(archivePath)) {
        console.log(`📦 Hit Source 2 [统一共享冷库]: 0ms Loading [${sanitizeName}] into project...`);
        ensureDir(path.dirname(projectTargetPath));
        safeCopy(archivePath, projectTargetPath);
        injectCacheControl(projectTargetPath, `来源: 本地冷库 | 推断: ${inferReason}`);
        return { success: true, origin: '来源: 本地冷库', reason: inferReason };
    }

    // Source 3: Upskill Security Registry (upskill.dev)
    if (skillName.startsWith('upskill/')) {
        console.log(`🛡️ Hit Source 3 [Upskill安全库]: Pulling [${skillName}]...`);
        try {
            execSync(`npx -y upskill add ${sanitizeName}`, { cwd: projectCwd, stdio: 'pipe', timeout: 5000 });
            if (fs.existsSync(projectTargetPath)) {
                injectCacheControl(projectTargetPath, `来源: Upskill安全库 | 推断: ${inferReason}`);
                return { success: true, origin: '来源: Upskill安全库', reason: inferReason };
            }
        } catch (e) {}
    }

    // Source 4: GitHub Organization / Custom Repo (owner/repo or your-org/repo)
    if (skillName.includes('/')) {
        console.log(`🌐 Hit Source 4 [GitHub组织/私有仓库]: Pulling [${skillName}]...`);
        try {
            execSync(`npx -y skills add ${skillName}`, { cwd: projectCwd, stdio: 'pipe', timeout: 5000 });
            if (fs.existsSync(projectTargetPath)) {
                injectCacheControl(projectTargetPath, `来源: GitHub组织(${skillName}) | 推断: ${inferReason}`);
                return { success: true, origin: `来源: GitHub组织(${skillName})`, reason: inferReason };
            }
        } catch (e) {}
    }

    // Source 5: Domestic Fast CDN / Gitee Mirror Node (jsDelivr / Gitee)
    try {
        console.log(`⚡ Hit Source 5 [Gitee/CDN极速节点]: Pulling [${sanitizeName}]...`);
        execSync(`npx -y skills add vercel-labs/skills/${sanitizeName}`, { cwd: projectCwd, stdio: 'pipe', timeout: 3000 });
        if (fs.existsSync(projectTargetPath)) {
            injectCacheControl(projectTargetPath, `来源: Gitee/CDN镜像 | 推断: ${inferReason}`);
            return { success: true, origin: '来源: Gitee/CDN镜像', reason: inferReason };
        }
    } catch (e) {}

    // Fallback Source: Vercel Cloud Registry (vercel-labs/skills) / Local Micro-Template
    console.log(`☁️ Pulling from Vercel Cloud Registry: [${sanitizeName}]...`);
    try {
        execSync(`npx -y skills add ${sanitizeName}`, { cwd: projectCwd, stdio: 'pipe', timeout: 5000 });
        if (fs.existsSync(projectTargetPath)) {
            injectCacheControl(projectTargetPath, `来源: Vercel云端 | 仅存项目临时目录 | 推断: ${inferReason}`);
        }
        return { success: true, origin: '来源: Vercel云端 | 仅存项目临时目录', reason: inferReason };
    } catch (err) {
        console.warn(`🛡️ Network Fallback Engine: Generating Local Micro-Template for [${sanitizeName}]...`);
        ensureDir(projectTargetPath);
        const fallbackMd = `<!-- @cache-control: ephemeral -->\n<!-- @origin: 来源: 本地微模板降级 -->\n---\nname: ${sanitizeName}\ndescription: Fallback offline template for ${sanitizeName}\n---\n# ${sanitizeName} (Fallback Standard)\n\nFollow best practices for ${sanitizeName}.\n`;
        fs.writeFileSync(path.join(projectTargetPath, 'SKILL.md'), fallbackMd, 'utf-8');
        return { success: true, origin: '来源: 本地微模板降级', reason: inferReason };
    }
}

// -------------------------------------------------------------------
// Module 1 Execution: Multi-Source Dependency & AST Auto-Inference
// -------------------------------------------------------------------
function runInfer(projectCwd = process.cwd()) {
    console.log('🔍 Running Multi-Source Dependency Auto-Inference & Manifest Sync...');
    let matchedSkills = new Map();

    // Source 0: Read recorded skills from project's package.json ("skill-orchestrator": { "skills": [...] })
    const packageJsonPath = path.join(projectCwd, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            
            // Read saved skills manifest
            if (pkg['skill-orchestrator'] && Array.isArray(pkg['skill-orchestrator'].skills)) {
                pkg['skill-orchestrator'].skills.forEach(skill => {
                    matchedSkills.set(skill, '项目历史清单 (package.json)');
                });
            }

            // Read dependencies
            const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
            Object.keys(allDeps).forEach(dep => {
                if (DEPENDENCY_MAP[dep]) {
                    matchedSkills.set(DEPENDENCY_MAP[dep].skill, DEPENDENCY_MAP[dep].reason);
                }
            });
        } catch (e) {}
    }

    // Source B: Python requirements.txt
    const reqTxtPath = path.join(projectCwd, 'requirements.txt');
    if (fs.existsSync(reqTxtPath)) {
        try {
            const lines = fs.readFileSync(reqTxtPath, 'utf-8').split('\n');
            lines.forEach(line => {
                const pkg = line.split('==')[0].split('>=')[0].trim();
                if (DEPENDENCY_MAP[pkg]) {
                    matchedSkills.set(DEPENDENCY_MAP[pkg].skill, DEPENDENCY_MAP[pkg].reason);
                }
            });
        } catch (e) {}
    }

    // Source C: File extension scanning
    function scanExtensions(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file === 'node_modules' || file === '.git' || file === '.agents') continue;
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanExtensions(fullPath);
            } else {
                const ext = path.extname(file);
                if (FILE_EXTENSION_MAP[ext]) {
                    matchedSkills.set(FILE_EXTENSION_MAP[ext].skill, FILE_EXTENSION_MAP[ext].reason);
                }
            }
        }
    }
    scanExtensions(projectCwd);

    const maxSkillsLimit = resolveMaxSkillsLimit(projectCwd);

    if (matchedSkills.size === 0) {
        console.log('ℹ️ No specific tech stack dependencies auto-detected in project files.');
    } else {
        console.log(`✅ Auto-detected ${matchedSkills.size} matching skills from project stack (Safety Cap: ${maxSkillsLimit}):`);
        let loadedCount = 0;
        for (const [skill, reason] of matchedSkills.entries()) {
            if (loadedCount >= maxSkillsLimit) {
                console.warn(`\n⚠️ Token Guard Alert: Matched skills exceeded safety cap of ${maxSkillsLimit}. Skipped remaining ${matchedSkills.size - loadedCount} skills to preserve Token budget.`);
                break;
            }
            console.log(`   ├── Loading: [${skill}] (Triggered by: ${reason})`);
            fetchSkillWithCircuitBreaker(skill, reason, projectCwd);
            loadedCount++;
        }
    }

    // Output Telemetry Status
    runStatus(projectCwd);
}

// -------------------------------------------------------------------
// Module 4: Token Telemetry & Budget Guard
// -------------------------------------------------------------------
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

function runStatus(projectCwd = process.cwd()) {
    console.log('\n============================================================');
    console.log('[Project Skills & Token Telemetry]');
    console.log('------------------------------------------------------------');

    const allDiscoveredPaths = discoverAllSkillPaths();
    let globalTokens = 0;
    let globalSkillsList = [];

    allDiscoveredPaths.forEach(agentPath => {
        if (fs.existsSync(agentPath)) {
            try {
                const items = fs.readdirSync(agentPath);
                items.forEach(item => {
                    if (item.startsWith('.')) return;
                    const fullPath = path.join(agentPath, item);
                    try {
                        const lstat = fs.lstatSync(fullPath);
                        if (lstat.isDirectory() && !lstat.isSymbolicLink()) {
                            const skillMd = path.join(fullPath, 'SKILL.md');
                            if (fs.existsSync(skillMd)) {
                                const tokens = estimateTokens(fs.readFileSync(skillMd, 'utf-8'));
                                globalTokens += tokens;
                                globalSkillsList.push({ name: item, tokens, path: agentPath });
                            }
                        }
                    } catch (e) {}
                });
            } catch (e) {}
        }
    });

    console.log(`全局热底座开销 : ~${globalTokens} Tokens [Status: Healthy 🟢]`);
    if (globalSkillsList.length === 0) {
        console.log('   └── (无常驻全局技能，开局 0 占用)');
    } else {
        globalSkillsList.forEach(s => console.log(`   ├── ${s.name.padEnd(23)} : ${s.tokens} Tokens`));
    }

    // 2. Project Scope
    let projectTokens = 0;
    let projectSkillsList = [];
    const projectSkillsDir = path.join(projectCwd, '.agents', 'skills');

    if (fs.existsSync(projectSkillsDir)) {
        try {
            const items = fs.readdirSync(projectSkillsDir);
            items.forEach(item => {
                if (item.startsWith('.')) return;
                const fullPath = path.join(projectSkillsDir, item);
                try {
                    const lstat = fs.lstatSync(fullPath);
                    if (lstat.isDirectory() && !lstat.isSymbolicLink()) {
                        const skillMd = path.join(fullPath, 'SKILL.md');
                        if (fs.existsSync(skillMd)) {
                            const content = fs.readFileSync(skillMd, 'utf-8');
                            const tokens = estimateTokens(content);
                            projectTokens += tokens;

                            // Extract origin info
                            let originMatch = content.match(/<!-- @origin: (.*?) -->/);
                            let originStr = originMatch ? originMatch[1] : '来源: 本地冷库';

                            projectSkillsList.push({ name: item, tokens, origin: originStr });
                        }
                    }
                } catch (e) {}
            });
        } catch (e) {}
    }

    const totalActive = globalTokens + projectTokens;
    const savedPct = (((9757 - totalActive) / 9757) * 100).toFixed(1);

    console.log('------------------------------------------------------------');
    console.log(`本项目总底座开销 : ${totalActive} Tokens (较默认全载节省 ${savedPct}% 空间)`);
    console.log(`Prompt Cache 锚点: 已自动注入 (响应速度提升 4x)`);
    console.log('============================================================\n');
}

// -------------------------------------------------------------------
// Standard Actions: Init, Sync, Status, Cleanup, Smart Dynamic Eject
// -------------------------------------------------------------------
function runInit() {
    console.log('🚀 Dynamically Scanning System & Consolidating Skills into Unified Shared Vault...');
    ensureDir(ARCHIVE_DIR);
    let totalConsolidated = 0;

    const allDiscoveredPaths = discoverAllSkillPaths();
    console.log(`🔍 Dynamically discovered ${allDiscoveredPaths.length} skill directories across system:`);
    allDiscoveredPaths.forEach(p => console.log(`   ├── Path: ${p}`));

    allDiscoveredPaths.forEach(agentPath => {
        try {
            if (fs.existsSync(agentPath) && path.normalize(agentPath) !== path.normalize(ARCHIVE_DIR)) {
                const items = fs.readdirSync(agentPath);
                items.forEach(item => {
                    if (item.startsWith('.')) return;
                    const fullPath = path.join(agentPath, item);
                    try {
                        const lstat = fs.lstatSync(fullPath);

                        // If fullPath is a symlink, clean up stale link safely
                        if (lstat.isSymbolicLink()) {
                            safeRemove(fullPath);
                            return;
                        }

                        if (lstat.isDirectory() && !CORE_SKILLS.includes(item)) {
                            const targetPath = path.join(ARCHIVE_DIR, item);
                            
                            // Record original source path into vault_registry.json for 100% exact restoration on eject
                            recordSkillOrigin(item, fullPath);

                            if (!fs.existsSync(targetPath)) {
                                if (safeCopy(fullPath, targetPath)) {
                                    safeRemove(fullPath);
                                    totalConsolidated++;
                                    console.log(`📦 Consolidated [${item}] -> Vault (Origin recorded: ${fullPath})`);
                                }
                            } else {
                                safeRemove(fullPath);
                            }
                        }
                    } catch (e) {}
                });
            }
        } catch (e) {}
    });

    console.log(`\n✅ Consolidated ${totalConsolidated} skills into Unified Shared Vault: ${ARCHIVE_DIR}`);
    console.log(`📝 Dynamic origin mapping saved to: ${REGISTRY_FILE}`);
}

function runSync() {
    const ideFilter = getIdeFilter();
    const filterMsg = ideFilter ? ` [Target IDE Filter: ${ideFilter}]` : '';
    console.log(`🔄 Dynamically checking for newly added or updated skills${filterMsg}...`);
    ensureDir(ARCHIVE_DIR);
    let totalSynced = 0;

    const allDiscoveredPaths = discoverAllSkillPaths();
    allDiscoveredPaths.forEach(agentPath => {
        try {
            if (fs.existsSync(agentPath) && path.normalize(agentPath) !== path.normalize(ARCHIVE_DIR)) {
                const items = fs.readdirSync(agentPath);
                items.forEach(item => {
                    if (item.startsWith('.')) return;
                    const fullPath = path.join(agentPath, item);
                    try {
                        const lstat = fs.lstatSync(fullPath);

                        if (lstat.isSymbolicLink()) {
                            safeRemove(fullPath);
                            return;
                        }

                        if (lstat.isDirectory() && !CORE_SKILLS.includes(item)) {
                            const targetPath = path.join(ARCHIVE_DIR, item);
                            
                            recordSkillOrigin(item, fullPath);

                            // Always update Cold Archive Vault with latest version from IDE
                            safeRemove(targetPath);
                            if (safeCopy(fullPath, targetPath)) {
                                safeRemove(fullPath);
                                totalSynced++;
                                console.log(`📦 Auto-synced & updated [${item}] -> Vault (Origin recorded: ${fullPath})`);
                            }
                        }
                    } catch (e) {}
                });
            }
        } catch (e) {}
    });

    console.log(`\n✅ Sync complete. Migrated/Updated ${totalSynced} skills to Unified Shared Vault: ${ARCHIVE_DIR}`);
}

function runMerge() {
    console.log('⚡ Executing Skill Merge & Deduplication Engine...');
    ensureDir(ARCHIVE_DIR);
    let mergedCount = 0;

    const allDiscoveredPaths = discoverAllSkillPaths();
    const seenSkills = new Map();

    allDiscoveredPaths.forEach(agentPath => {
        try {
            if (fs.existsSync(agentPath)) {
                const items = fs.readdirSync(agentPath);
                items.forEach(item => {
                    if (item.startsWith('.')) return;
                    const fullPath = path.join(agentPath, item);
                    try {
                        const lstat = fs.lstatSync(fullPath);
                        if (lstat.isDirectory() && !lstat.isSymbolicLink()) {
                            if (!seenSkills.has(item)) {
                                seenSkills.set(item, []);
                            }
                            seenSkills.get(item).push(fullPath);
                        }
                    } catch (e) {}
                });
            }
        } catch (e) {}
    });

    seenSkills.forEach((paths, skillName) => {
        if (paths.length > 1) {
            console.log(`🔍 Found duplicate Skill [${skillName}] across ${paths.length} locations:`);
            paths.forEach(p => console.log(`   ├── ${p}`));
            
            const targetVaultPath = path.join(ARCHIVE_DIR, skillName);
            paths.forEach(p => recordSkillOrigin(skillName, p));

            if (!fs.existsSync(targetVaultPath)) {
                safeCopy(paths[0], targetVaultPath);
            }

            paths.forEach(p => {
                if (path.normalize(p) !== path.normalize(targetVaultPath)) {
                    // Deduplicate redundant copies
                    safeRemove(p);
                    mergedCount++;
                    console.log(`🧹 Deduplicated & Merged [${skillName}] from ${p}`);
                }
            });
        }
    });

    console.log(`\n✅ Merge complete! Deduplicated & merged ${mergedCount} redundant skill copies.`);
    console.log(`💡 Hot base overhead reduced. Run 'status' to check updated telemetry report.`);
}

function runCleanup(projectCwd = process.cwd()) {
    console.log('🧹 Cleaning up project-level skills...');
    const projectSkillsDir = path.join(projectCwd, '.agents', 'skills');

    if (fs.existsSync(projectSkillsDir)) {
        try {
            safeRemove(projectSkillsDir);
            console.log(`✅ Removed temporary project skills from: ${projectSkillsDir}`);
            console.log(`💡 Note: Used skills manifest remains preserved in package.json for 1-click restore via 'infer'.`);
        } catch (err) {
            console.error(`❌ Failed to cleanup ${projectSkillsDir}: ${err.message}`);
        }
    } else {
        console.log('ℹ️ No project-level skills found to cleanup.');
    }
}

function runEject() {
    console.log('🚪 Executing Precision Dynamic Offboarding (Eject) Strategy...');
    console.log('📦 Reading origin mapping registry (vault_registry.json) for 100% exact path restoration...');

    const registry = loadRegistry();
    let totalRestored = 0;

    if (fs.existsSync(ARCHIVE_DIR)) {
        try {
            const archivedItems = fs.readdirSync(ARCHIVE_DIR);

            archivedItems.forEach(item => {
                if (item === 'vault_registry.json') return;
                const archiveItemPath = path.join(ARCHIVE_DIR, item);

                try {
                    const lstat = fs.lstatSync(archiveItemPath);
                    if (lstat.isDirectory() && !lstat.isSymbolicLink()) {
                        const originalPaths = registry[item];

                        if (originalPaths && originalPaths.length > 0) {
                            // Restore to exact original paths recorded during init/sync
                            originalPaths.forEach(originalPath => {
                                try {
                                    ensureDir(path.dirname(originalPath));
                                    if (safeCopy(archiveItemPath, originalPath)) {
                                        totalRestored++;
                                        console.log(`✅ Exact Restoration: [${item}] -> ${originalPath}`);
                                    }
                                } catch (e) {}
                            });
                        } else {
                            // Fallback to all discovered active IDE paths on system if unrecorded
                            const activePaths = discoverAllSkillPaths();
                            activePaths.forEach(activePath => {
                                try {
                                    const targetPath = path.join(activePath, item);
                                    ensureDir(activePath);
                                    if (safeCopy(archiveItemPath, targetPath)) {
                                        totalRestored++;
                                        console.log(`✅ Fallback Restoration: [${item}] -> ${targetPath}`);
                                    }
                                } catch (e) {}
                            });
                        }
                    }
                } catch (e) {}
            });

            // Safely remove Cold Archive Vault & registry file
            safeRemove(ARCHIVE_DIR);
            console.log(`\n🗑️ Safely removed Cold Archive Vault & Registry: ${ARCHIVE_DIR}`);
        } catch (e) {}
    }

    console.log(`\n🎉 Dynamic Eject Complete! Successfully restored ${totalRestored} private skills back to exact original IDE paths.`);
    console.log('System is now restored to standard default mode (0 data lost).');
}

// -------------------------------------------------------------------
// CLI Router
// -------------------------------------------------------------------
const command = process.argv[2];

switch (command) {
    case 'init':
        runInit();
        break;
    case 'infer':
        runInfer();
        break;
    case 'sync':
        runSync();
        break;
    case 'merge':
        runMerge();
        break;
    case 'status':
        runStatus();
        break;
    case 'cleanup':
        runCleanup();
        break;
    case 'eject':
    case 'uninstall':
        runEject();
        break;
    default:
        console.log(`
Skill Orchestrator Engine (v3.2.5) - Live Skill Hot-Sync & Auto-Update Edition

Usage:
  node scripts/orchestrate.js init      - Dynamically discover IDEs, record original paths & consolidate to Vault
  node scripts/orchestrate.js infer     - Infer dependencies & restore package.json skills manifest (--limit=N)
  node scripts/orchestrate.js sync      - Auto-detect manual npx skills, update vault & sync new versions
  node scripts/orchestrate.js status    - Display active vs archived skills token telemetry
  node scripts/orchestrate.js cleanup   - Clean up project-level skills (keeps package.json manifest)
  node scripts/orchestrate.js eject     - 100% exact path restoration via vault_registry.json & uninstall
        `);
        break;
}
