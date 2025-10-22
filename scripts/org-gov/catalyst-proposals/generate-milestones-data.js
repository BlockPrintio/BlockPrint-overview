import fs from 'fs';
import path from 'path';
import { getConfig, getRepoRoot } from '../org-stats/config-loader.js';

// Initialize constants
const config = getConfig();
const repoRoot = getRepoRoot();

// Hardcoded output paths
const BASE_DIR = 'org-gov-updates';
const CATALYST_PROPOSALS_DIR = 'catalyst-proposals';

const CATALYST_PROPOSALS_PATH = path.join(repoRoot, 'catalyst-proposals');
const OUTPUT_PATH = path.join(repoRoot, BASE_DIR, CATALYST_PROPOSALS_DIR, 'milestones-data.json');

// Get allowed project IDs from config
const allowedProjectIds = config.catalystProjectIds.split(',').map(id => id.trim());
console.log('Allowed project IDs from config:', allowedProjectIds);

/**
 * @typedef {Object} MilestoneData
 * @property {string} projectId
 * @property {number} milestoneNumber
 * @property {string} link
 * @property {string} challenge
 * @property {string} budget
 * @property {string} deliveredDate
 * @property {string} title
 * @property {string} content
 * @property {string[]} outcomes
 * @property {string[]} evidence
 */

/**
 * @typedef {Object} ParsedMilestoneHeader
 * @property {string} projectId
 * @property {string} link
 * @property {string} milestone
 * @property {string} challenge
 * @property {string} budget
 * @property {string} delivered
 */

function parseMilestoneHeader(content) {
    const lines = content.split('\n');
    const header = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('|') && !line.startsWith('|---')) {
            const parts = line.split('|').map(part => part.trim()).filter(part => part);
            if (parts.length === 2) {
                const key = parts[0].toLowerCase().replace(' ', '');
                header[key] = parts[1];
            }
        }
        // Stop parsing header when we reach the markdown title
        if (line.startsWith('#')) {
            break;
        }
    }

    return {
        projectId: header.projectid || '',
        link: header.link || '',
        milestone: header.milestone || '',
        challenge: header.challenge || '',
        budget: header.milestonebudget || header.budget || '',
        delivered: header.milestonedelivered || header.delivered || ''
    };
}

function extractMilestoneContent(content) {
    const lines = content.split('\n');
    let title = '';
    let contentStartIndex = 0;
    let outcomes = [];
    let evidence = [];

    // Find the main title (first # heading after the header table)
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#') && !line.startsWith('##')) {
            title = line.replace(/^#+\s*/, '');
            contentStartIndex = i + 1;
            break;
        }
    }

    // Extract content and look for outcomes/evidence
    const contentLines = lines.slice(contentStartIndex);
    let currentSection = '';

    for (const line of contentLines) {
        const trimmedLine = line.trim();

        // Check for section headers
        if (trimmedLine.toLowerCase().includes('outcome') ||
            trimmedLine.toLowerCase().includes('acceptance criteria') ||
            trimmedLine.toLowerCase().includes('milestone outcomes')) {
            currentSection = 'outcomes';
            continue;
        }

        if (trimmedLine.toLowerCase().includes('evidence') ||
            trimmedLine.toLowerCase().includes('completion') ||
            trimmedLine.toLowerCase().includes('deliverable')) {
            currentSection = 'evidence';
            continue;
        }

        // Extract bullet points or numbered items
        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || /^\d+\./.test(trimmedLine)) {
            const item = trimmedLine.replace(/^[-*\d.]\s*/, '');
            if (currentSection === 'outcomes') {
                outcomes.push(item);
            } else if (currentSection === 'evidence') {
                evidence.push(item);
            }
        }

        // Extract links from evidence
        if (trimmedLine.includes('http') && currentSection === 'evidence') {
            const urlMatch = trimmedLine.match(/https?:\/\/[^\s\)]+/);
            if (urlMatch) {
                evidence.push(urlMatch[0]);
            }
        }
    }

    return {
        title,
        content: contentLines.join('\n'),
        outcomes,
        evidence
    };
}

function getMilestoneNumber(filename) {
    const match = filename.match(/milestone(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
}

function generateMilestonesData() {
    try {
        if (!fs.existsSync(CATALYST_PROPOSALS_PATH)) {
            console.error('Catalyst proposals directory not found:', CATALYST_PROPOSALS_PATH);
            return {};
        }

        const allMilestones = {};
        const processedProjects = [];
        const skippedProjects = [];

        // Search through all fund directories
        const fundDirs = fs.readdirSync(CATALYST_PROPOSALS_PATH, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        console.log('Found fund directories:', fundDirs);

        for (const fundDir of fundDirs) {
            const fundPath = path.join(CATALYST_PROPOSALS_PATH, fundDir);

            const projectDirs = fs.readdirSync(fundPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            console.log(`Processing projects in ${fundDir}:`, projectDirs);

            for (const projectDir of projectDirs) {
                const projectPath = path.join(fundPath, projectDir);
                const files = fs.readdirSync(projectPath);

                // Extract project ID from directory name (e.g., "1300036-cardano-buidlerfest" -> "1300036")
                const projectIdMatch = projectDir.match(/^(\d+)/);
                if (!projectIdMatch) {
                    console.warn(`Skipping project directory with no ID: ${projectDir}`);
                    continue;
                }

                const projectId = projectIdMatch[1];

                // Check if project ID is in the allowed list from config
                if (!allowedProjectIds.includes(projectId)) {
                    console.log(`Skipping project ${projectId} - not in allowed project IDs list`);
                    skippedProjects.push(projectId);
                    continue;
                }

                console.log(`Processing project ${projectId} from directory ${projectDir}`);
                processedProjects.push(projectId);

                // Find all milestone files
                const milestoneFiles = files
                    .filter(file => file.includes('milestone') && file.endsWith('.md'))
                    .sort((a, b) => getMilestoneNumber(a) - getMilestoneNumber(b));

                console.log(`Found milestone files for project ${projectId}:`, milestoneFiles);

                if (milestoneFiles.length > 0) {
                    allMilestones[projectId] = [];

                    for (const file of milestoneFiles) {
                        const filePath = path.join(projectPath, file);
                        const content = fs.readFileSync(filePath, 'utf-8');
                        const header = parseMilestoneHeader(content);
                        const { title, content: milestoneContent, outcomes, evidence } = extractMilestoneContent(content);

                        if (header) {
                            const milestoneData = {
                                projectId: projectId, // Use the extracted project ID
                                milestoneNumber: getMilestoneNumber(file),
                                link: header.link,
                                challenge: header.challenge,
                                budget: header.budget,
                                deliveredDate: header.delivered,
                                title,
                                content: milestoneContent,
                                outcomes,
                                evidence
                            };

                            allMilestones[projectId].push(milestoneData);
                            console.log(`Added milestone ${milestoneData.milestoneNumber} for project ${projectId}`);
                        }
                    }
                }
            }
        }

        // Log processing summary
        console.log('\n=== Processing Summary ===');
        console.log(`Allowed project IDs: ${allowedProjectIds.join(', ')}`);
        console.log(`Processed projects: ${processedProjects.join(', ')}`);
        console.log(`Skipped projects: ${skippedProjects.join(', ')}`);
        console.log(`Total processed: ${processedProjects.length}`);
        console.log(`Total skipped: ${skippedProjects.length}`);
        console.log('========================\n');

        return allMilestones;
    } catch (error) {
        console.error('Error generating milestones data:', error);
        return {};
    }
}

async function main() {
    try {
        console.log('Starting milestone data generation...');
        console.log('Catalyst proposals path:', CATALYST_PROPOSALS_PATH);
        console.log('Output path:', OUTPUT_PATH);

        const milestonesData = generateMilestonesData();

        // Ensure the output directory exists
        const outputDir = path.dirname(OUTPUT_PATH);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write the data to JSON file
        const jsonData = {
            timestamp: new Date().toISOString(),
            milestones: milestonesData
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(jsonData, null, 2));

        console.log('Milestone data generated successfully!');
        console.log(`Total projects with milestones: ${Object.keys(milestonesData).length}`);

        // Log summary
        for (const [projectId, milestones] of Object.entries(milestonesData)) {
            console.log(`Project ${projectId}: ${milestones.length} milestones`);
        }

    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
}

// Run the script
main(); 