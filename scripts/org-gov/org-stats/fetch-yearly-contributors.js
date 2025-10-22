import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { getConfig, getRepoRoot, getAllOrganizations, isRepoExcluded } from './config-loader.js';

// Hardcoded output paths
const BASE_DIR = 'org-gov-updates';
const STATS_DIR = 'org-stats';
const CONTRIBUTIONS_DIR = 'contributions';

export async function fetchYearlyContributors(githubToken) {
    const config = getConfig();
    const repoRoot = getRepoRoot();
    console.log('\nFetching repository contributors...');

    // Create contributions directory if it doesn't exist
    const contributionsDir = path.join(repoRoot, BASE_DIR, STATS_DIR, CONTRIBUTIONS_DIR);
    if (!fs.existsSync(contributionsDir)) {
        fs.mkdirSync(contributionsDir, { recursive: true });
    }

    // Get all organizations (main + extended)
    const allOrganizations = getAllOrganizations();
    console.log(`Processing ${allOrganizations.length} organization(s): ${allOrganizations.map(org => org.name).join(', ')}`);

    // Get all repositories from all organizations with pagination
    let allRepos = [];
    let earliestYear = new Date().getFullYear(); // Initialize with current year

    for (const org of allOrganizations) {
        console.log(`\nFetching repositories for organization: ${org.name} (${org.displayName})`);

        let page = 1;
        let hasMoreRepos = true;
        let orgRepos = [];

        while (hasMoreRepos) {
            try {
                console.log(`Fetching repositories page ${page} for ${org.name}...`);
                const reposResponse = await axios.get(`https://api.github.com/orgs/${org.name}/repos`, {
                    params: {
                        type: 'all',
                        per_page: 100,
                        page: page
                    },
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${githubToken}`
                    }
                });

                if (reposResponse.data.length === 0) {
                    hasMoreRepos = false;
                } else {
                    // Find the earliest repository creation date
                    reposResponse.data.forEach(repo => {
                        const createdYear = new Date(repo.created_at).getFullYear();
                        if (createdYear < earliestYear) {
                            earliestYear = createdYear;
                        }
                    });

                    // Filter out excluded repositories and add organization info
                    const filteredRepos = reposResponse.data
                        .filter(repo => !isRepoExcluded(org.name, repo.name))
                        .map(repo => ({
                            ...repo,
                            organization: org.name
                        }));

                    orgRepos = orgRepos.concat(filteredRepos);
                    page++;
                }
            } catch (error) {
                console.error(`Error fetching repositories page ${page} for ${org.name}:`, error.message);
                hasMoreRepos = false;
            }
        }

        console.log(`Found ${orgRepos.length} repositories in ${org.name} (after exclusions):`);
        orgRepos.forEach(repo => {
            console.log(`- ${repo.name} (${repo.private ? 'private' : 'public'}${repo.fork ? ', fork' : ''})`);
        });

        allRepos = allRepos.concat(orgRepos);
    }

    console.log(`\nTotal repositories across all organizations: ${allRepos.length}`);
    console.log(`Earliest repository creation year: ${earliestYear}`);

    // Get existing yearly files
    const existingYears = new Set();
    if (fs.existsSync(contributionsDir)) {
        const files = fs.readdirSync(contributionsDir);
        files.forEach(file => {
            const match = file.match(/contributors-(\d{4})\.json/);
            if (match) {
                existingYears.add(parseInt(match[1]));
            }
        });
    }

    const currentYear = new Date().getFullYear();
    // If we have existing years, only update the current year
    // Otherwise, process all years from earliest to current
    const yearsToUpdate = existingYears.size > 0 ?
        [currentYear] :
        Array.from({ length: currentYear - earliestYear + 1 }, (_, i) => earliestYear + i);

    console.log(`Years to process: ${yearsToUpdate.join(', ')}`);

    // Process each year
    for (const year of yearsToUpdate) {
        console.log(`\nProcessing data for year ${year}...`);
        const contributorsMap = new Map();

        for (const repo of allRepos) {
            console.log(`Fetching contributors for ${repo.organization}/${repo.name}...`);
            try {
                // Fetch commits with timestamps
                let commitsPage = 1;
                let hasMoreCommits = true;

                while (hasMoreCommits) {
                    try {
                        const commitsResponse = await axios.get(`https://api.github.com/repos/${repo.organization}/${repo.name}/commits`, {
                            params: {
                                per_page: 100,
                                page: commitsPage
                            },
                            headers: {
                                'Accept': 'application/vnd.github.v3+json',
                                'Authorization': `token ${githubToken}`
                            }
                        });

                        if (commitsResponse.data.length === 0) {
                            hasMoreCommits = false;
                        } else {
                            for (const commit of commitsResponse.data) {
                                if (!commit.author || !commit.author.login) continue;

                                const commitDate = new Date(commit.commit.author.date);
                                if (commitDate.getFullYear() !== year) continue;

                                const login = commit.author.login;
                                const timestamp = commit.commit.author.date;
                                const repoKey = `${repo.organization}/${repo.name}`;

                                if (!contributorsMap.has(login)) {
                                    const repoData = {};
                                    repoData[repoKey] = {
                                        commits: 1,
                                        pull_requests: 0,
                                        contributions: 1,
                                        commit_timestamps: [timestamp],
                                        pr_timestamps: [],
                                        organization: repo.organization
                                    };

                                    contributorsMap.set(login, {
                                        login: login,
                                        avatar_url: commit.author.avatar_url,
                                        commits: 1,
                                        pull_requests: 0,
                                        contributions: 1,
                                        repositories: repoData
                                    });
                                } else {
                                    const existingContributor = contributorsMap.get(login);
                                    existingContributor.commits += 1;
                                    existingContributor.contributions += 1;

                                    if (existingContributor.repositories[repoKey]) {
                                        existingContributor.repositories[repoKey].commits += 1;
                                        existingContributor.repositories[repoKey].contributions += 1;
                                        existingContributor.repositories[repoKey].commit_timestamps.push(timestamp);
                                    } else {
                                        existingContributor.repositories[repoKey] = {
                                            commits: 1,
                                            pull_requests: 0,
                                            contributions: 1,
                                            commit_timestamps: [timestamp],
                                            pr_timestamps: [],
                                            organization: repo.organization
                                        };
                                    }
                                }
                            }
                            commitsPage++;
                        }
                    } catch (error) {
                        if (error.response && error.response.status === 404) {
                            console.warn(`Repository ${repo.organization}/${repo.name} might be private or not exist. Skipping commits.`);
                        } else if (error.response && error.response.status === 403) {
                            console.warn(`API rate limit exceeded or insufficient permissions for ${repo.organization}/${repo.name}. Skipping commits.`);
                        } else {
                            console.error(`Error fetching commits for ${repo.organization}/${repo.name} page ${commitsPage}:`, error.message);
                        }
                        hasMoreCommits = false;
                    }
                }

                // Fetch pull requests from both pulls and issues endpoints
                let page = 1;
                let pullsData = [];
                let hasMorePulls = true;
                let processedPRs = new Set(); // Track processed PRs to avoid duplicates

                while (hasMorePulls) {
                    try {
                        // First try the pulls endpoint
                        const pullsResponse = await axios.get(
                            `https://api.github.com/repos/${repo.organization}/${repo.name}/pulls`,
                            {
                                params: {
                                    state: 'closed',
                                    per_page: 100,
                                    page: page
                                },
                                headers: {
                                    'Accept': 'application/vnd.github.v3+json',
                                    'Authorization': `token ${githubToken}`
                                }
                            }
                        );

                        if (pullsResponse.data.length === 0) {
                            hasMorePulls = false;
                        } else {
                            const mergedPRs = pullsResponse.data.filter(pr => {
                                if (!pr.merged_at) return false;
                                const prDate = new Date(pr.merged_at);
                                return prDate.getFullYear() === year;
                            });

                            // Add to processed set and pulls data
                            mergedPRs.forEach(pr => {
                                if (!processedPRs.has(pr.number)) {
                                    processedPRs.add(pr.number);
                                    pullsData.push(pr);
                                }
                            });

                            console.log(`  - Found ${mergedPRs.length} merged PRs on page ${page}`);
                            page++;
                        }
                    } catch (error) {
                        if (error.response && error.response.status === 404) {
                            console.warn(`Repository ${repo.organization}/${repo.name} might be private or not exist. Skipping pulls.`);
                        } else if (error.response && error.response.status === 403) {
                            console.warn(`API rate limit exceeded or insufficient permissions for ${repo.organization}/${repo.name}. Skipping pulls.`);
                        } else {
                            console.error(`Error fetching pulls for ${repo.organization}/${repo.name} page ${page}:`, error.message);
                        }
                        hasMorePulls = false;
                    }
                }

                // Then try the issues endpoint to catch any PRs missed by the pulls endpoint
                page = 1;
                hasMorePulls = true;

                while (hasMorePulls) {
                    try {
                        const issuesResponse = await axios.get(
                            `https://api.github.com/repos/${repo.organization}/${repo.name}/issues`,
                            {
                                params: {
                                    state: 'closed',
                                    per_page: 100,
                                    page: page
                                },
                                headers: {
                                    'Accept': 'application/vnd.github.v3+json',
                                    'Authorization': `token ${githubToken}`
                                }
                            }
                        );

                        if (issuesResponse.data.length === 0) {
                            hasMorePulls = false;
                        } else {
                            // Filter for pull requests (issues with pull_request field)
                            const prsFromIssues = issuesResponse.data.filter(issue =>
                                issue.pull_request &&
                                !processedPRs.has(issue.number)
                            );

                            // Fetch additional PR details for each PR from issues
                            for (const prIssue of prsFromIssues) {
                                try {
                                    const prDetails = await axios.get(
                                        `https://api.github.com/repos/${repo.organization}/${repo.name}/pulls/${prIssue.number}`,
                                        {
                                            headers: {
                                                'Accept': 'application/vnd.github.v3+json',
                                                'Authorization': `token ${githubToken}`
                                            }
                                        }
                                    );

                                    if (prDetails.data.merged_at) {
                                        const prDate = new Date(prDetails.data.merged_at);
                                        if (prDate.getFullYear() === year) {
                                            processedPRs.add(prIssue.number);
                                            pullsData.push(prDetails.data);
                                        }
                                    }
                                } catch (error) {
                                    console.warn(`Could not fetch details for PR #${prIssue.number}: ${error.message}`);
                                }
                            }
                            page++;
                        }
                    } catch (error) {
                        if (error.response && error.response.status === 404) {
                            console.warn(`Repository ${repo.organization}/${repo.name} might be private or not exist. Skipping issues.`);
                        } else if (error.response && error.response.status === 403) {
                            console.warn(`API rate limit exceeded or insufficient permissions for ${repo.organization}/${repo.name}. Skipping issues.`);
                        } else {
                            console.error(`Error fetching issues for ${repo.organization}/${repo.name} page ${page}:`, error.message);
                        }
                        hasMorePulls = false;
                    }
                }

                console.log(`Total merged PRs found for ${repo.organization}/${repo.name}: ${pullsData.length}`);

                // Count PRs by user and store timestamps
                pullsData.forEach(pr => {
                    if (!pr.user || !pr.user.login) return;
                    if (!pr.merged_at) return;

                    const login = pr.user.login;
                    const timestamp = pr.merged_at;
                    const repoKey = `${repo.organization}/${repo.name}`;

                    if (!contributorsMap.has(login)) {
                        // If this user isn't a contributor yet, add them
                        const repoData = {};
                        repoData[repoKey] = {
                            commits: 0,
                            pull_requests: 1,
                            contributions: 1,
                            commit_timestamps: [],
                            pr_timestamps: [timestamp],
                            organization: repo.organization
                        };

                        contributorsMap.set(login, {
                            login: login,
                            avatar_url: pr.user.avatar_url,
                            commits: 0,
                            pull_requests: 1,
                            contributions: 1,
                            repositories: repoData
                        });
                    } else {
                        // User exists, increment PR count
                        const contributor = contributorsMap.get(login);
                        contributor.pull_requests += 1;
                        contributor.contributions += 1;

                        // Update repository data
                        if (contributor.repositories[repoKey]) {
                            contributor.repositories[repoKey].pull_requests += 1;
                            contributor.repositories[repoKey].contributions += 1;
                            contributor.repositories[repoKey].pr_timestamps.push(timestamp);
                        } else {
                            contributor.repositories[repoKey] = {
                                commits: 0,
                                pull_requests: 1,
                                contributions: 1,
                                commit_timestamps: [],
                                pr_timestamps: [timestamp],
                                organization: repo.organization
                            };
                        }
                    }
                });
            } catch (error) {
                console.error(`Error fetching data for ${repo.organization}/${repo.name}:`, error.message);
            }
        }

        // Convert repositories from object to array for each contributor
        const contributors = Array.from(contributorsMap.values()).map(contributor => {
            // Convert repositories object to array
            const reposArray = Object.entries(contributor.repositories).map(([repoName, repoData]) => {
                return {
                    name: repoName,
                    ...repoData,
                    commit_timestamps: repoData.commit_timestamps.sort((a, b) => new Date(b) - new Date(a)),
                    pr_timestamps: repoData.pr_timestamps.sort((a, b) => new Date(b) - new Date(a))
                };
            });

            // Sort repos by total contributions
            reposArray.sort((a, b) => b.contributions - a.contributions);

            return {
                ...contributor,
                repositories: reposArray
            };
        });

        // Sort contributors by total contributions
        contributors.sort((a, b) => b.contributions - a.contributions);

        // Save yearly data
        const yearlyStats = {
            year: year,
            unique_count: contributors.length,
            contributors,
            total_pull_requests: contributors.reduce((sum, c) => sum + c.pull_requests, 0),
            total_commits: contributors.reduce((sum, c) => sum + c.commits, 0),
            total_contributions: contributors.reduce((sum, c) => sum + c.commits + c.pull_requests, 0)
        };

        const yearlyFilePath = path.join(contributionsDir, `contributors-${year}.json`);
        fs.writeFileSync(yearlyFilePath, JSON.stringify(yearlyStats, null, 2), 'utf8');
        console.log(`Saved contributors data for ${year} to ${yearlyFilePath}`);
    }
} 