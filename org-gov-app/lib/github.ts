/**
 * One reader for the organisation's public repositories.
 *
 * Both Sheet 04 (Projects) and Sheet 05 (Repositories) render from this. The
 * call is unauthenticated, which GitHub rate limits to 60 requests an hour per
 * address, so a module-level cache means moving between the two sheets costs
 * one request rather than one per visit. The cache lives for the tab's
 * lifetime and survives client-side navigation; a full reload refills it.
 */

export interface Repo {
    name: string;
    description: string;
    language: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    topics: string[];
    url: string;
    homepage: string | null;
    license: string | null;
    isFork: boolean;
    isArchived: boolean;
    /** Last commit pushed. Distinct from updated_at, which also moves on
     *  metadata edits like renaming or changing the description. */
    pushedAt: string;
    updatedAt: string;
}

export interface OrgSnapshot {
    repositories: Repo[];
    languages: [string, number][];
    totalStars: number;
    totalForks: number;
    readAt: Date;
}

export class GitHubUnavailable extends Error {}

const TTL_MS = 5 * 60 * 1000;

let cached: { snapshot: OrgSnapshot; at: number } | null = null;
let inFlight: Promise<OrgSnapshot> | null = null;

interface RawRepo {
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    topics?: string[];
    html_url: string;
    homepage: string | null;
    license: { spdx_id?: string; name?: string } | null;
    fork: boolean;
    archived: boolean;
    pushed_at: string;
    updated_at: string;
}

function toSnapshot(raw: RawRepo[]): OrgSnapshot {
    const languages = new Map<string, number>();
    let totalStars = 0;
    let totalForks = 0;

    const repositories: Repo[] = raw.map((repo) => {
        if (repo.language) {
            languages.set(repo.language, (languages.get(repo.language) || 0) + 1);
        }
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;

        return {
            name: repo.name,
            description: repo.description || '',
            language: repo.language,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            openIssues: repo.open_issues_count || 0,
            topics: Array.isArray(repo.topics) ? repo.topics : [],
            url: repo.html_url,
            homepage: repo.homepage && repo.homepage.trim() ? repo.homepage.trim() : null,
            license: repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION'
                ? repo.license.spdx_id
                : null,
            isFork: Boolean(repo.fork),
            isArchived: Boolean(repo.archived),
            pushedAt: repo.pushed_at,
            updatedAt: repo.updated_at,
        };
    });

    return {
        repositories,
        languages: [...languages.entries()].sort((a, b) => b[1] - a[1]),
        totalStars,
        totalForks,
        readAt: new Date(),
    };
}

export async function readOrgRepos(org: string): Promise<OrgSnapshot> {
    if (cached && Date.now() - cached.at < TTL_MS) return cached.snapshot;
    if (inFlight) return inFlight;

    inFlight = (async () => {
        const response = await fetch(
            `https://api.github.com/orgs/${org}/repos?per_page=100&sort=pushed`
        );

        if (!response.ok) {
            // Naming the actual failure beats a generic "try again later" —
            // a rate limit clears on its own and the reader should know that.
            throw new GitHubUnavailable(
                response.status === 403 || response.status === 429
                    ? 'GitHub is rate limiting this address. The list should return within the hour.'
                    : `GitHub returned ${response.status}.`
            );
        }

        const raw = await response.json();
        if (!Array.isArray(raw)) {
            throw new GitHubUnavailable('GitHub returned an unexpected response.');
        }

        const snapshot = toSnapshot(raw as RawRepo[]);
        cached = { snapshot, at: Date.now() };
        return snapshot;
    })().finally(() => {
        inFlight = null;
    });

    return inFlight;
}

/** Most recently pushed first. */
export const byRecentActivity = (a: Repo, b: Repo) =>
    new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();

export const formatDate = (value: string | Date): string => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    }).format(date);
};

export const formatDateTime = (value: Date): string =>
    new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(value);

/** "3 days ago" — relative time carries recency better than a bare date. */
export const formatRelative = (value: string): string => {
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return '—';
    const seconds = Math.round((then - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });
    const steps: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 31536000], ['month', 2592000], ['week', 604800],
        ['day', 86400], ['hour', 3600], ['minute', 60],
    ];
    for (const [unit, size] of steps) {
        if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
    }
    return 'just now';
};
