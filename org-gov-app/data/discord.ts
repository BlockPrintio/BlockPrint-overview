import stats from '../../org-gov-updates/discord-stats/stats.json';

/**
 * Discord membership, read from the figures committed to this repository by
 * the monthly stats workflow.
 *
 * The deployed site states 56 members. That number is hardcoded in the old
 * overview page and is not in the record anywhere — the collected data says
 * 824 as of September 2025. Stating a figure the repository contradicts is
 * the one thing a governance record cannot do, so this reads the file.
 */

interface MonthlyDiscordStats {
    memberCount: number;
    totalMessages: number;
    uniquePosters: number;
}

const byMonth = stats as Record<string, MonthlyDiscordStats>;

// Keys are YYYY-MM, so lexical sort is chronological.
const months = Object.keys(byMonth).sort();
const latestMonth = months[months.length - 1] ?? null;

export const DISCORD = latestMonth
    ? {
        month: latestMonth,
        memberCount: byMonth[latestMonth].memberCount,
        /** "September 2025" — the as-of date belongs next to the figure. */
        asOf: new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
            .format(new Date(`${latestMonth}-01T00:00:00Z`)),
    }
    : null;
