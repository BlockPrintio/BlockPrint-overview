import axios from 'axios';
import { PROJECTS_INFO } from './mockData.js';
import { saveCatalystData } from './save-catalyst-data.js';
import { getProposalMetrics } from './lidApi.js'; // NEW: import our Lido helper
import fs from 'fs';
import path from 'path';
import { getConfig, getRepoRoot } from '../org-stats/config-loader.js';

// Hardcoded output paths
const BASE_DIR = 'org-gov-updates';
const CATALYST_PROPOSALS_DIR = 'catalyst-proposals';

// Initialize constants
const config = getConfig();
// Get the repository root directory using the utility function
const repoRoot = getRepoRoot();
const CATALYST_DATA_PATH = path.join(repoRoot, BASE_DIR, CATALYST_PROPOSALS_DIR, 'catalyst-data.json');

// Lido CSRF token for lidonation API calls
const LIDO_CSRF_TOKEN = process.env.LIDO_CSRF_TOKEN;

// Validate that LIDO_CSRF_TOKEN is available
if (!LIDO_CSRF_TOKEN) {
    console.error('LIDO_CSRF_TOKEN environment variable is required but not set');
    process.exit(1);
}

// Get project IDs from config file
const ORG_PROJECT_IDS = config.catalystProjectIds;
console.log('Project IDs from config:', ORG_PROJECT_IDS);

// Supabase credentials check - we'll use mock data if they're missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USE_MOCK_DATA = !supabaseUrl || !supabaseKey;

let supabase;
if (!USE_MOCK_DATA) {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseKey);
}

// Extract just the project IDs
const PROJECT_IDS = ORG_PROJECT_IDS
    ? ORG_PROJECT_IDS.split(',').map(id => id.trim())
    : PROJECTS_INFO.map(project => project.id);

/**
 * Generates a URL-friendly slug from a project title.
 * @param {string} title - The project title
 * @returns {string} - The URL slug
 */
function generateUrlFromTitle(title) {
    if (!title) return '';

    return title
        // Replace '&' with 'and'
        .replace(/&/g, 'and')
        // Replace '|' with 'or'
        .replace(/\|/g, 'or')
        // Replace '[' and ']' with empty string
        .replace(/[\[\]]/g, '')
        // Replace multiple spaces, hyphens, or underscores with single space
        .replace(/[\s\-_]+/g, ' ')
        // Remove special characters except spaces and alphanumeric
        .replace(/[^a-zA-Z0-9\s]/g, '')
        // Replace multiple spaces with single space
        .replace(/\s+/g, ' ')
        // Trim whitespace
        .trim()
        // Replace spaces with hyphens
        .replace(/\s/g, '-')
        // Convert to lowercase
        .toLowerCase();
}

/**
 * Extracts category slug from challenges data.
 * @param {Object} challenges - The challenges object from the database
 * @returns {string|null} - The category slug or null if not available
 */
function extractCategoryFromChallenges(challenges) {
    if (!challenges || !challenges.title) {
        return null;
    }

    // Remove the fund prefix (e.g., "F11: ") and clean up the title
    const categoryMatch = challenges.title.match(/^F\d+:\s*(.+)$/i);
    if (categoryMatch) {
        return generateUrlFromTitle(categoryMatch[1]);
    }

    return null;
}

/**
 * Extracts fund number from challenges data.
 * @param {Object} challenges - The challenges object from the database
 * @returns {string|null} - The fund number or null if not available
 */
function extractFundNumberFromChallenges(challenges) {
    if (!challenges || !challenges.title) {
        return null;
    }

    // Extract fund number from challenge title (e.g., "F11: OSDE: ...")
    const fundMatch = challenges.title.match(/^F(\d+):/i);
    if (fundMatch) {
        return fundMatch[1];
    }

    return null;
}

/**
 * Generates the full Catalyst URL for a project.
 * @param {string} title - The project title
 * @param {string} fundNumber - The fund number
 * @param {string} categorySlug - The category slug (required)
 * @returns {string} - The full URL
 */
function generateCatalystUrl(title, fundNumber, categorySlug) {
    if (!title || !fundNumber || !categorySlug) return '';

    const slug = generateUrlFromTitle(title);
    return `https://projectcatalyst.io/funds/${fundNumber}/${categorySlug}/${slug}`;
}

/**
 * Retrieves the proposal details.
 */
async function getProposalDetails(projectId) {
    console.log(`Getting proposal details for project ${projectId}`);

    if (USE_MOCK_DATA) {
        const mockProject = PROJECTS_INFO.find(p => p.id === projectId);
        if (mockProject) {
            console.log(`Using mock data for project ${projectId}`);
            return {
                id: mockProject.id,
                title: mockProject.name,
                budget: mockProject.budget,
                milestones_qty: mockProject.milestones_qty,
                funds_distributed: mockProject.funds_distributed,
                project_id: mockProject.id,
                name: mockProject.name,
                category: mockProject.category,
                url: mockProject.url || '', // Preserve existing URL from mock data
                status: mockProject.status,
                finished: mockProject.finished,
                voting: null // ensure voting field exists
            };
        }
        return null;
    }

    // Real data from Supabase
    const { data, error } = await supabase
        .from('proposals')
        .select(`
      id,
      title,
      budget,
      milestones_qty,
      funds_distributed,
      challenges(*),
      project_id
    `)
        .eq('project_id', projectId)
        .single();

    if (error) {
        console.error(`Error fetching proposal details for project ${projectId}:`, error);
        return null;
    }

    const supplementaryInfo = PROJECTS_INFO.find(p => p.id === projectId);
    const enhancedData = {
        ...data,
        name: supplementaryInfo?.name || data.title,
        category: data.challenges?.title || supplementaryInfo?.category || '',
        url: supplementaryInfo?.url || data.url || '', // Preserve existing URL from supplementary info or database
        status: supplementaryInfo?.status || 'In Progress',
        finished: supplementaryInfo?.finished || '',
        voting: null // placeholder for voting metrics
    };

    console.log(`Found proposal details for project ${projectId}:`, enhancedData);
    return enhancedData;
}

/**
 * Fetches milestone snapshot data.
 */
async function fetchSnapshotData(projectId) {
    if (USE_MOCK_DATA) return [];

    try {
        const response = await axios.post(
            `${supabaseUrl}/rest/v1/rpc/getproposalsnapshot`,
            { _project_id: projectId },
            {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Content-Profile': 'public',
                    'x-client-info': 'supabase-js/2.2.3'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching snapshot data for project ${projectId}:`, error);
        return [];
    }
}

/**
 * Main function.
 */
async function main() {
    console.log('Processing Catalyst data...');
    console.log('Using mock data:', USE_MOCK_DATA);

    // Load existing catalyst data
    let existingData = { projects: [] };
    try {
        const data = fs.readFileSync(CATALYST_DATA_PATH, 'utf8');
        existingData = JSON.parse(data);
    } catch {
        console.log('No existing catalyst data found, will create new file');
    }

    const projectsByFund = { '10': [], '11': [], '12': [], '13': [] };

    for (const projectId of PROJECT_IDS) {
        const projectDetails = await getProposalDetails(projectId);
        if (!projectDetails) continue;

        // === UPDATED: determine fund number from challenges, category, URL, or project_id ===
        let fundNumber = null;

        // First, try to get fund number from challenges data
        if (projectDetails.challenges) {
            fundNumber = extractFundNumberFromChallenges(projectDetails.challenges);
            if (fundNumber) {
                console.log(`[Fund] Extracted fund number ${fundNumber} from challenges: ${projectDetails.challenges.title}`);
            }
        }

        // If not found in challenges, try to get fund number from category (e.g., "F10: OSDE: ...")
        if (!fundNumber) {
            const catMatch = projectDetails.category.match(/^F(\d+)/i);
            if (catMatch) {
                fundNumber = catMatch[1];
                console.log(`[Fund] Extracted fund number ${fundNumber} from category: ${projectDetails.category}`);
            }
        }

        // If still not found, try to get fund number from existing URL if available
        if (!fundNumber && projectDetails.url && projectDetails.url.includes('/funds/')) {
            const urlMatch = projectDetails.url.match(/\/funds\/(\d+)\//i);
            if (urlMatch) {
                fundNumber = urlMatch[1];
                console.log(`[Fund] Extracted fund number ${fundNumber} from URL: ${projectDetails.url}`);
            }
        }

        // Last fallback: use all digits to the left of the last 5 digits of project_id
        if (!fundNumber && projectDetails.project_id) {
            const pidStr = String(projectDetails.project_id);
            if (pidStr.length > 5) {
                fundNumber = pidStr.substring(0, pidStr.length - 5);
                console.log(`[Fund] Extracted fund number ${fundNumber} from project_id: ${projectDetails.project_id}`);
            }
        }

        if (!fundNumber) {
            console.log(`[Fund] Could not determine fund number for project ${projectId}`);
        }

        // Extract category from challenges data
        let categorySlug = null;
        if (projectDetails.challenges) {
            categorySlug = extractCategoryFromChallenges(projectDetails.challenges);
            if (categorySlug) {
                console.log(`[Category] Extracted category slug "${categorySlug}" from challenges: ${projectDetails.challenges.title}`);
            } else {
                console.log(`[Category] Could not extract category from challenges: ${projectDetails.challenges.title}`);
            }
        } else {
            console.log(`[Category] No challenges data available for project ${projectId}`);
        }

        // Generate the proper Catalyst URL with fund number and category
        if (fundNumber && projectDetails.title && categorySlug) {
            projectDetails.url = generateCatalystUrl(projectDetails.title, fundNumber, categorySlug);
            console.log(`[URL] Generated Catalyst URL for "${projectDetails.title}": ${projectDetails.url}`);
        } else {
            console.log(`[URL] Cannot generate URL for "${projectDetails.title}" - missing fund number or category`);
            projectDetails.url = ''; // Clear URL if we can't generate a proper one
        }

        // Check if proposal already exists in catalyst-data.json
        const existingProject = existingData.projects.find(
            p => p.projectDetails.project_id === projectDetails.project_id
        );

        if (fundNumber && projectDetails.title && !existingProject?.projectDetails.voting) {
            console.log(`[Metrics] Fetching new metrics for project "${projectDetails.title}" (ID: ${projectId})`);
            try {
                const metrics = await getProposalMetrics({
                    fundNumber,
                    title: projectDetails.title,
                    csrfToken: LIDO_CSRF_TOKEN
                });
                projectDetails.voting = metrics;
                console.log(`[Metrics] Successfully fetched metrics for project "${projectDetails.title}"`);
            } catch (err) {
                console.error(`[Metrics] Failed to fetch voting metrics for "${projectDetails.title}":`, err);
                projectDetails.voting = null;
            }
        } else if (existingProject?.projectDetails.voting) {
            // Use existing voting data if available
            console.log(`[Metrics] Using existing metrics for project "${projectDetails.title}" (ID: ${projectId})`);
            projectDetails.voting = existingProject.projectDetails.voting;
        } else {
            console.log(`[Metrics] No metrics available for project "${projectDetails.title}" (ID: ${projectId})`);
        }
        // === end updated section ===

        const snapshotData = await fetchSnapshotData(projectId);

        let milestonesCompleted;
        if (USE_MOCK_DATA) {
            const mockProject = PROJECTS_INFO.find(p => p.id === projectId);
            milestonesCompleted = mockProject?.milestonesCompleted || 0;
        } else {
            milestonesCompleted = snapshotData.filter(
                m => m.som_signoff_count > 0 && m.poa_signoff_count > 0
            ).length;
        }

        const fundKey = fundNumber || String(projectId).substring(0, 2);
        if (projectsByFund[fundKey]) {
            projectsByFund[fundKey].push({ projectDetails, milestonesCompleted });
        }
    }

    const allProjects = Object.values(projectsByFund).flat();

    // Merge existing voting data with new data
    const mergedProjects = allProjects.map(newProject => {
        const existingProject = existingData.projects.find(
            p => p.projectDetails.project_id === newProject.projectDetails.project_id
        );

        if (existingProject?.projectDetails.voting && !newProject.projectDetails.voting) {
            console.log(`[Metrics] Preserving existing voting data for project "${newProject.projectDetails.title}"`);
            newProject.projectDetails.voting = existingProject.projectDetails.voting;
        }
        return newProject;
    });

    await saveCatalystData(mergedProjects);

    console.log('Catalyst data has been processed and saved.');
}

main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
