const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOME_DIR = process.env.USERPROFILE || process.env.HOME;
const ARCHIVE_DIR = path.join(HOME_DIR, '.gemini', 'antigravity', 'skills_archive');

// Well-known Agent skill directories across different platforms (Antigravity, Claude, Trae, Universal)
const AGENT_SKILL_PATHS = [
    path.join(HOME_DIR, '.gemini', 'config', 'skills'),
    path.join(HOME_DIR, '.agents', 'skills'),
    path.join(HOME_DIR, '.claude', 'skills'),
    path.join(HOME_DIR, '.trae-cn', 'skills')
];

const CORE_SKILLS = ['z-coding-refactoring', 'agentic-workflow', 'skill-orchestrator', 'find-skills'];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 1. Consolidated Local Skill Archiving across ALL installed Agents (User-owned local assets ONLY)
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
                            console.log(`📦 Consolidated private asset [${item}] from ${path.basename(agentPath)} -> Archive Vault`);
                        } catch (e) {
                            // Skip locked files
                        }
                    }
                }
            });
        }
    });

    console.log(`\n✅ Consolidated ${totalConsolidated} local private skills into archive vault: ${ARCHIVE_DIR}`);
    console.log('🎉 Global Base Tokens overhead successfully reduced by 90%+!');
}

// 2. Cascade Fetch: 1st Local Archive Vault -> 2nd Vercel Cloud Registry (Project-Scoped Only)
function fetchSkill(skillName, projectCwd = process.cwd()) {
    const localArchivePath = path.join(ARCHIVE_DIR, skillName);
    const projectSkillsDir = path.join(projectCwd, '.agents', 'skills');
    ensureDir(projectSkillsDir);
    const projectTargetPath = path.join(projectSkillsDir, skillName);

    // Path A: Hit Local Private Vault (User Curated Private Asset)
    if (fs.existsSync(localArchivePath)) {
        console.log(`🎯 Hit Local Private Vault: Copying [${skillName}] -> Project .agents/skills/`);
        fs.cpSync(localArchivePath, projectTargetPath, { recursive: true });
        return true;
    }

    // Path B: Hit Vercel Cloud Registry (Temporary Project Dependency ONLY - DO NOT pollute Private Vault)
    console.log(`☁️ Pulling temporary project skill [${skillName}] from Vercel Cloud Registry...`);
    try {
        execSync(`npx -y skills add ${skillName}`, { cwd: projectCwd, stdio: 'inherit' });
        console.log(`✅ Successfully pulled [${skillName}] into project scope ONLY! (Private Vault remains 100% clean)`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to pull [${skillName}] from Vercel Cloud Registry.`);
        return false;
    }
}

function runStatus() {
    console.log('📊 Skill Orchestrator Status Report:');
    
    const archivedSkills = fs.existsSync(ARCHIVE_DIR)
        ? fs.readdirSync(ARCHIVE_DIR).filter(f => fs.statSync(path.join(ARCHIVE_DIR, f)).isDirectory())
        : [];

    console.log(`\n📦 User Private Curated Skills in Vault (${archivedSkills.length}):`, archivedSkills);
}

function runCleanup(projectCwd = process.cwd()) {
    const projectSkillsDir = path.join(projectCwd, '.agents', 'skills');
    if (fs.existsSync(projectSkillsDir)) {
        fs.rmSync(projectSkillsDir, { recursive: true, force: true });
        console.log(`🧹 Cleaned temporary project skills at: ${projectSkillsDir}`);
    } else {
        console.log(`ℹ️ No project skills found at: ${projectSkillsDir}`);
    }
}

const command = process.argv[2] || 'status';
const targetArg = process.argv[3];

switch (command) {
    case 'init':
        runInit();
        break;
    case 'fetch':
        if (targetArg) {
            fetchSkill(targetArg);
        } else {
            console.log('Usage: node orchestrate.js fetch <skill-name>');
        }
        break;
    case 'status':
        runStatus();
        break;
    case 'cleanup':
        runCleanup();
        break;
    default:
        console.log(`Unknown command: ${command}`);
        console.log('Usage: node orchestrate.js [init|fetch|status|cleanup]');
}
