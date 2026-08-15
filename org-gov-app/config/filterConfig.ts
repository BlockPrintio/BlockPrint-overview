import { SearchFilterConfig } from '../components/SearchFilterBar';
import { CatalystProject } from '../types';

/**
 * The funding round a proposal was filed in.
 *
 * This used to be `category.substring(0, 3)`, which turns
 * "Fund 15 - Cardano Use Cases…" into "Fun" — so the round filter offered a
 * single option labelled "Fun" and matched every proposal. Reading the round
 * properly makes the filter mean something.
 */
export const getFundingRound = (category: string): string => {
    const match = category.match(/Fund\s*\d+/i);
    return match ? match[0].replace(/\s+/g, ' ') : category;
};

export const extractFundingRounds = (projects: CatalystProject[]): string[] =>
    [...new Set(projects.map((project) => getFundingRound(project.projectDetails.category)))];

export const generateCatalystProposalsFilterConfig = (
    projects: CatalystProject[]
): SearchFilterConfig => {
    const statuses = [...new Set(projects.map((p) => p.projectDetails.status))];
    const fundingRounds = extractFundingRounds(projects);

    return {
        placeholder: 'Search by title, project ID or funding round…',
        filters: [
            {
                id: 'status',
                label: 'Status',
                options: statuses.map((status) => ({ label: status, value: status }))
            },
            {
                id: 'fundingRound',
                label: 'Funding round',
                options: fundingRounds.map((round) => ({ label: round, value: round }))
            }
        ]
    };
};

export const filterProposals = (
    projects: CatalystProject[],
    searchTerm: string,
    filters: Record<string, string>
): CatalystProject[] => {
    if (!searchTerm && Object.keys(filters).length === 0) return projects;

    const term = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
        const { title, category, project_id, status } = project.projectDetails;

        const searchMatch = !term
            || title.toLowerCase().includes(term)
            || category.toLowerCase().includes(term)
            || String(project_id).includes(term);

        const statusMatch = !filters.status || status === filters.status;
        const roundMatch = !filters.fundingRound
            || getFundingRound(category) === filters.fundingRound;

        return searchMatch && statusMatch && roundMatch;
    });
};
