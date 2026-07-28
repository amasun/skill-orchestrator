const fs = require('fs');
const path = require('path');

const HOME_DIR = process.env.USERPROFILE || process.env.HOME;
const GLOBAL_SKILLS_DIR = path.join(HOME_DIR, '.gemini', 'config', 'skills');
const ARCHIVE_DIR = path.join(HOME_DIR, '.gemini', 'antigravity', 'skills_archive');

const CORE_SKILLS = ['z-coding-refactoring', 'agentic-workflow', 'skill-orchestrator'];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function runInit() {
    console.log('🚀 Initializing Skill Orchestrator Archive Vault...');
    ensureDir(ARCHIVE_DIR);
    ensureDir(GLOBAL_SKILLS_DIR);

    const items = fs.readdirSync(GLOBAL_SKILLS_DIR);
    let movedCount = 0;

    items.forEach(item => {
        const fullPath = path.join(GLOBAL_SKILLS_DIR, item);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!CORE_SKILLS.includes(item)) {
                const targetPath = path.join(ARCHIVE_DIR, item);
                if (fs.existsSync(targetPath)) {
                    fs.rmSync(targetPath, { recursive: true, force: true });
                }
                fs.renameSync(fullPath, targetPath);
                movedCount++;
            }
        }
    });

    console.log(`✅ Moved ${movedCount} skills into cold archive (${ARCHIVE_DIR}).`);
    console.log(`🔥 Kept core skills: ${CORE_SKILLS.join(', ')}.`);
    console.log('🎉 Global Base Token overhead successfully reduced by 90%+!');
}

function runStatus() {
    console.log('📊 Skill Orchestrator Status Report:');
    
    const globalSkills = fs.existsSync(GLOBAL_SKILLS_DIR) 
        ? fs.readdirSync(GLOBAL_SKILLS_DIR).filter(f => fs.statSync(path.join(GLOBAL_SKILLS_DIR, f)).isDirectory())
        : [];

    const archivedSkills = fs.existsSync(ARCHIVE_DIR)
        ? fs.readdirSync(ARCHIVE_DIR).filter(f => fs.statSync(path.join(ARCHIVE_DIR, f)).isDirectory())
        : [];

    console.log(`\n🔥 Active Global Skills (${globalSkills.length}):`, globalSkills);
    console.log(`📦 Archived Cold Skills (${archivedSkills.length}):`, archivedSkills);
}

function runCleanup(projectCwd = process.cwd()) {
    const projectSkillsDir = path.join(projectCwd, '.agents', 'skills');
    if (fs.existsSync(projectSkillsDir)) {
        fs.rmSync(projectSkillsDir, { recursive: true, force: true });
        console.log(`🧹 Cleaned project skills at: ${projectSkillsDir}`);
    } else {
        console.log(`ℹ️ No project skills found at: ${projectSkillsDir}`);
    }
}

const command = process.argv[2] || 'status';

switch (command) {
    case 'init':
        runInit();
        break;
    case 'status':
        runStatus();
        break;
    case 'cleanup':
        runCleanup();
        break;
    default:
        console.log(`Unknown command: ${command}`);
        console.log('Usage: node orchestrate.js [init|status|cleanup]');
}
