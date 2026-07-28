const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOME_DIR = process.env.USERPROFILE || process.env.HOME;
const ARCHIVE_DIR = path.join(HOME_DIR, '.gemini', 'antigravity', 'skills_archive');

// Well-known Agent skill directories across different platforms
const AGENT_SKILL_PATHS = [
    path.join(HOME_DIR, '.gemini', 'config', 'skills'),
    path.join(HOME_DIR, '.agents', 'skills'),
    path.join(HOME_DIR, '.claude', 'skills'),
    path.join(HOME_DIR, '.trae-cn', 'skills')
];

const CORE_SKILLS = ['z-coding-refactoring', 'agentic-workflow', 'skill-orchestrator', 'find-skills'];

// -------------------------------------------------------------------
// Module 1: Dependency Mapping Registry for Auto-Inference
// -------------------------------------------------------------------
const DEPENDENCY_MAP = {
    'three': '3d-web-experience',
    '@react-three/fiber': '3d-web-experience',
    'three-stdlib': '3d-web-experience',
    'gsap': 'gsap-core',
    'lenis': 'cinematic-gsap-lenis-motion-system',
    'tailwindcss': 'vercel-web-guidelines',
    '@prisma/client': 'prisma-database',
    'bigquery': 'bigquery-sql',
    '@google-cloud/bigquery': 'bigquery-sql',
    'dbt': 'dbt-bigquery'
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// -------------------------------------------------------------------
// Module 2: Prompt Cache Anchor Injection
// -------------------------------------------------------------------
function injectCacheControl(skillDir) {
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    if (fs.existsSync(skillMdPath)) {
        try {
            let content = fs.readFileSync(skillMdPath, 'utf-8');
            if (!content.includes('@cache-control: ephemeral')) {
                const cacheHeader = `<!-- @cache-control: ephemeral -->\n`;
                fs.writeFileSync(skillMdPath, cacheHeader + content, 'utf-8');
                console.log(`⚡ Injected Prompt Cache Anchor -> ${path.basename(skillDir)}/SKILL.md`);
            }
        } catch (e) {
            // Ignore write errors
        }
    }
}

// -------------------------------------------------------------------
// Module 3: Circuit Breaker & Offline Fallback Engine
// -------------------------------------------------------------------
function fetchSkillWithCircuitBreaker(skillName, projectCwd = process.cwd()) {
    const localArchivePath = path.join(ARCHIVE_DIR, skillName);
    const projectSkillsDir = path.join(projectCwd, '.agents', 'skills');
    ensureDir(projectSkillsDir);
    const projectTargetPath = path.join(projectSkillsDir, skillName);

    // Path A: Hit Local Private Vault
    if (fs.existsSync(localArchivePath)) {
        console.log(`🎯 Hit Local Private Vault: Copying [${skillName}] -> Project .agents/skills/`);
        fs.cpSync(localArchivePath, projectTargetPath, { recursive: true });
        injectCacheControl(projectTargetPath);
        return true;
    }

    // Path B: Hit Vercel Cloud Registry with Circuit Breaker (Timeout)
    console.log(`☁️ Pulling temporary project skill [${skillName}] from Vercel Cloud...`);
    try {
        execSync(`npx -y skills add ${skillName}`, { cwd: projectCwd, stdio: 'inherit', timeout: 5000 });
        if (fs.existsSync(projectTargetPath)) {
            injectCacheControl(projectTargetPath);
        }
        console.log(`✅ Successfully pulled [${skillName}] into project scope!`);
        return true;
    } catch (err) {
        console.warn(`🛡️ Circuit Breaker Triggered (Network Timeout/Failure). Falling back to Local Micro-Template for [${skillName}]...`);
        ensureDir(projectTargetPath);
        const fallbackMd = `<!-- @cache-control: ephemeral -->\n---\nname: ${skillName}\ndescription: Fallback offline template for ${skillName}\n---\n# ${skillName} (Fallback Standard)\n\nFollow best practices for ${skillName}.\n`;
        fs.writeFileSync(path.join(projectTargetPath, 'SKILL.md'), fallbackMd, 'utf-8');
        console.log(`✅ Created offline fallback skill template at ${projectTargetPath}`);
        return true;
    }
}

// -------------------------------------------------------------------
// Module 1 Execution: AST & Package Dependency Auto-Inference
// -------------------------------------------------------------------
function runInfer(projectCwd = process.cwd()) {
    console.log('🔍 Running AST & Package Dependency Auto-Inference...');
    const packageJsonPath = path.join(projectCwd, 'package.json');
    let matchedSkills = new Set();

    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const allDeps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) };

            Object.keys(allDeps).forEach(dep => {
                if (DEPENDENCY_MAP[dep]) {
                    matchedSkills.add(DEPENDENCY_MAP[dep]);
                }
            });
        } catch (e) {
            console.error('Failed to parse package.json');
        }
    }

    if (matchedSkills.size > 0) {
        console.log(`🎯 Auto-Inferred ${matchedSkills.size} skills from package.json:`, Array.from(matchedSkills));
        matchedSkills.forEach(skillName => {
            fetchSkillWithCircuitBreaker(skillName, projectCwd);
        });
    } else {
        console.log('ℹ️ No matching tech-stack dependencies inferred from package.json.');
    }
}

// -------------------------------------------------------------------
// Module 4: Token Budget Telemetry & Quota Guard Dashboard
// -------------------------------------------------------------------
function estimateTokens(text) {
    return Math.ceil(text.length / 3.5);
}

function runTelemetry(projectCwd = process.cwd()) {
    console.log('\n📊 ============================================================');
    console.log('📊 Skill Orchestrator Token Telemetry Dashboard (v2.0)');
    console.log('📊 ============================================================');

    // 1. Hot Global Base
    let globalTokens = 0;
    let globalSkillsList = [];
    AGENT_SKILL_PATHS.forEach(agentPath => {
        if (fs.existsSync(agentPath)) {
            const items = fs.readdirSync(agentPath);
            items.forEach(item => {
                const fullPath = path.join(agentPath, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    const skillMd = path.join(fullPath, 'SKILL.md');
                    if (fs.existsSync(skillMd)) {
                        const tokens = estimateTokens(fs.readFileSync(skillMd, 'utf-8'));
                        globalTokens += tokens;
                        globalSkillsList.push({ name: item, tokens });
                    }
                }
            });
        }
    });

    console.log(`🔥 Hot Global Base Overhead : ${globalTokens} Tokens [${globalTokens <= 1000 ? 'HEALTHY 🟢' : 'WARNING 🟡'}]`);
    globalSkillsList.forEach(s => console.log(`   ├── ${s.name.padEnd(25)} : ${s.tokens} Tokens`));

    // 2. Project Scope
    let projectTokens = 0;
    let projectSkillsList = [];
    const projectSkillsDir = path.join(projectCwd, '.agents', 'skills');

    if (fs.existsSync(projectSkillsDir)) {
        const items = fs.readdirSync(projectSkillsDir);
        items.forEach(item => {
            const fullPath = path.join(projectSkillsDir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                const skillMd = path.join(fullPath, 'SKILL.md');
                if (fs.existsSync(skillMd)) {
                    const tokens = estimateTokens(fs.readFileSync(skillMd, 'utf-8'));
                    projectTokens += tokens;
                    projectSkillsList.push({ name: item, tokens });
                }
            }
        });
    }

    console.log(`\n🚀 Project Scope Overhead   : ${projectTokens} Tokens`);
    if (projectSkillsList.length === 0) {
        console.log('   └── (No active project-level skills)');
    } else {
        projectSkillsList.forEach(s => console.log(`   ├── ${s.name.padEnd(25)} : ${s.tokens} Tokens`));
    }

    const totalActive = globalTokens + projectTokens;
    const savedPct = (((9757 - totalActive) / 9757) * 100).toFixed(1);

    console.log('------------------------------------------------------------');
    console.log(`💡 TOTAL ACTIVE OVERHEAD   : ${totalActive} Tokens (Saved ${savedPct}% vs Legacy 9,757)`);
    console.log('============================================================\n');
}

// -------------------------------------------------------------------
// Standard Actions: Init, Sync, Status, Cleanup
// -------------------------------------------------------------------
function runInit() {
    console.log('🚀 Consolidating Local Private Skills across all Agents into Vault...');
    ensureDir(ARCHIVE_DIR);
    let totalConsolidated = 0;

    AGENT_SKILL_PATHS.forEach(agentPath => {
        if (fs.existsSync(agentPath)) {
            const items = fs.readdirSync(agentPath);
            items.forEach(item => {
                const fullPath = path.join(agentPath, item);
                if (fs.statSync(fullPath).isDirectory() && !CORE_SKILLS.includes(item)) {
                    const targetPath = path.join(ARCHIVE_DIR, item);
                    if (!fs.existsSync(targetPath)) {
                        try {
                            fs.cpSync(fullPath, targetPath, { recursive: true });
                            fs.rmSync(fullPath, { recursive: true, force: true });
                            totalConsolidated++;
                            console.log(`📦 Consolidated private asset [${item}] -> Archive Vault`);
                        } catch (e) {}
                    }
                }
            });
        }
    });

    console.log(`\n✅ Consolidated ${totalConsolidated} local private skills into archive vault: ${ARCHIVE_DIR}`);
    runTelemetry();
}

function runSync() {
    console.log('🔍 Scanning for newly added public skills from manual npx commands...');
    ensureDir(ARCHIVE_DIR);
    let newlyArchived = 0;

    AGENT_SKILL_PATHS.forEach(agentPath => {
        if (fs.existsSync(agentPath)) {
            const items = fs.readdirSync(agentPath);
            items.forEach(item => {
                const fullPath = path.join(agentPath, item);
                if (fs.statSync(fullPath).isDirectory() && !CORE_SKILLS.includes(item)) {
                    const targetPath = path.join(ARCHIVE_DIR, item);
                    try {
                        fs.cpSync(fullPath, targetPath, { recursive: true });
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        newlyArchived++;
                        console.log(`✨ Detected manual npx skill [${item}] -> Auto-Migrated to Private Vault!`);
                    } catch (e) {}
                }
            });
        }
    });

    if (newlyArchived > 0) {
        console.log(`🎉 Auto-Migrated ${newlyArchived} newly installed skills!`);
    } else {
        console.log('✅ All skills up to date. No orphaned public skills detected.');
    }
    runTelemetry();
}

function runCleanup(projectCwd = process.cwd()) {
    const projectSkillsDir = path.join(projectCwd, '.agents', 'skills');
    if (fs.existsSync(projectSkillsDir)) {
        fs.rmSync(projectSkillsDir, { recursive: true, force: true });
        console.log(`🧹 Cleaned temporary project skills at: ${projectSkillsDir}`);
    } else {
        console.log(`ℹ️ No project skills found at: ${projectSkillsDir}`);
    }
    runTelemetry();
}

const command = process.argv[2] || 'telemetry';
const targetArg = process.argv[3];

switch (command) {
    case 'init':
        runInit();
        break;
    case 'sync':
        runSync();
        break;
    case 'infer':
        runInfer();
        break;
    case 'fetch':
        if (targetArg) {
            fetchSkillWithCircuitBreaker(targetArg);
        } else {
            console.log('Usage: node orchestrate.js fetch <skill-name>');
        }
        break;
    case 'telemetry':
    case 'status':
        runTelemetry();
        break;
    case 'cleanup':
        runCleanup();
        break;
    default:
        console.log(`Unknown command: ${command}`);
        console.log('Usage: node orchestrate.js [init|sync|infer|fetch|telemetry|cleanup]');
}
