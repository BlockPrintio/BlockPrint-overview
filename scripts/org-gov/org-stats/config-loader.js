import fs from 'fs';
import path from 'path';

let config = null;

export function getRepoRoot() {
    // Get the repository root directory (2 levels up from scripts/org-gov directory)
    return path.resolve(process.cwd(), '..', '..');
}

export function loadConfig() {
    if (config) {
        return config;
    }

    // Try to find the config file in the root of the repository
    const repoRoot = getRepoRoot();
    const possiblePaths = [
        path.join(process.cwd(), 'org-stats-config.json'),
        path.join(process.cwd(), '..', 'org-stats-config.json'),
        path.join(process.cwd(), '..', '..', 'org-stats-config.json'),
        path.join(process.cwd(), '..', '..', '..', 'org-stats-config.json'),
        path.join(repoRoot, 'org-stats-config.json')
    ];

    let configPath = null;
    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            configPath = possiblePath;
            break;
        }
    }

    if (!configPath) {
        throw new Error('Could not find org-stats-config.json in any of the expected locations');
    }

    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(configContent);

        // Validate required fields
        if (!config.mainOrganization?.name) {
            throw new Error('Config must contain mainOrganization.name');
        }

        // Validate extended organizations if present
        if (config.extendedOrganizations) {
            if (!Array.isArray(config.extendedOrganizations)) {
                throw new Error('extendedOrganizations must be an array');
            }

            for (const org of config.extendedOrganizations) {
                if (!org.name) {
                    throw new Error('Each extended organization must have a name');
                }
                if (!org.displayName) {
                    throw new Error(`Extended organization ${org.name} must have a displayName`);
                }
                if (!Array.isArray(org.excludedRepos)) {
                    throw new Error(`Extended organization ${org.name} must have excludedRepos as an array`);
                }
            }
        }

        // Ensure main organization has excludedRepos array
        if (!Array.isArray(config.mainOrganization.excludedRepos)) {
            config.mainOrganization.excludedRepos = [];
        }

        console.log(`Loaded config from: ${configPath}`);
        console.log(`Main Organization: ${config.mainOrganization.name}`);
        if (config.extendedOrganizations && config.extendedOrganizations.length > 0) {
            console.log(`Extended Organizations: ${config.extendedOrganizations.map(org => org.name).join(', ')}`);
        }

        return config;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Invalid JSON in config file: ${error.message}`);
        }
        throw error;
    }
}

export function getConfig() {
    return loadConfig();
}

// Helper function to get all organizations (main + extended)
export function getAllOrganizations() {
    const config = getConfig();
    const organizations = [config.mainOrganization];

    if (config.extendedOrganizations) {
        organizations.push(...config.extendedOrganizations);
    }

    return organizations;
}

// Helper function to check if a repository should be excluded
export function isRepoExcluded(orgName, repoName) {
    const config = getConfig();

    // Check main organization
    if (orgName === config.mainOrganization.name) {
        return config.mainOrganization.excludedRepos.includes(repoName);
    }

    // Check extended organizations
    if (config.extendedOrganizations) {
        const org = config.extendedOrganizations.find(o => o.name === orgName);
        if (org) {
            return org.excludedRepos.includes(repoName);
        }
    }

    return false;
} 