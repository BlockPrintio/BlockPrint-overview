import fs from 'fs';
import path from 'path';
import { getConfig, getRepoRoot } from './config-loader.js';

// Hardcoded output paths
const BASE_DIR = 'org-gov-updates';
const STATS_DIR = 'org-stats';

export function saveJson(stats) {
    const config = getConfig();
    const repoRoot = getRepoRoot();
    const jsonDir = path.join(repoRoot, BASE_DIR, STATS_DIR);
    const jsonPath = path.join(jsonDir, 'org_stats.json');

    // Create directory if it doesn't exist
    if (!fs.existsSync(jsonDir)) {
        fs.mkdirSync(jsonDir, { recursive: true });
    }

    fs.writeFileSync(jsonPath, JSON.stringify(stats, null, 2));
    console.log(`Saved JSON to ${jsonPath}`);
} 