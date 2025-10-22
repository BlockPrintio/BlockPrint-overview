import path from 'path';
import fs from 'fs';
import { processYearlyStats } from './process-yearly-stats.js';
import { getConfig, getRepoRoot } from './config-loader.js';

// Hardcoded output paths
const BASE_DIR = 'org-gov-updates';
const STATS_DIR = 'org-stats';

export function generateYearlyStatsJson(year, monthlyDownloads, githubStats) {
    const processedData = processYearlyStats(year, monthlyDownloads, githubStats);
    return processedData;
}

export function saveStatsJson(statsData) {
    const config = getConfig();
    const repoRoot = getRepoRoot();
    const year = statsData.year;
    const jsonPath = path.join(repoRoot, BASE_DIR, STATS_DIR, `org-yearly-stats-${year}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(statsData, null, 2));
    console.log(`Saved stats JSON to ${jsonPath}`);
} 