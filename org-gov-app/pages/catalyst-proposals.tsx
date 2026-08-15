import { useState, useMemo, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PageHeader from '../components/PageHeader';
import SearchFilterBar, { SearchFilterConfig } from '../components/SearchFilterBar';
import ProposalRegister from '../components/CatalystProposalsList';
import { filterProposals, generateCatalystProposalsFilterConfig } from '../config/filterConfig';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { CatalystProject, CatalystData } from '../types';
import { FUND_15_PROPOSALS, formatAda, formatCount } from '../data/fund15';
import styles from '../styles/Proposals.module.css';

const formatTimestamp = (timestamp?: string): string | null => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
    }).format(date) + ' UTC';
};

export default function CatalystProposals() {
    const router = useRouter();
    const [catalystData, setCatalystData] = useState<CatalystData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [filteredProjects, setFilteredProjects] = useState<CatalystProject[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [filterConfig, setFilterConfig] = useState<SearchFilterConfig>({
        placeholder: 'Search proposals…',
        filters: []
    });

    useScrollRestoration();

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await fetch('/api/catalyst/data');
                if (!response.ok) throw new Error(`Request failed: ${response.status}`);
                const data = await response.json();
                if (!cancelled) setCatalystData(data);
            } catch (err) {
                console.error('Error fetching catalyst data:', err);
                // The filed proposals are known locally, so a failed fetch
                // degrades to a smaller record rather than to an empty page.
                if (!cancelled) setLoadError('Could not reach the funded-proposal record.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, []);

    // One list. Locally-known Fund 15 filings first, then anything the record
    // adds, with duplicates by project ID dropped.
    const allProjects = useMemo(() => {
        const fetched = catalystData?.projects ?? [];
        const seen = new Set(fetched.map((p) => p.projectDetails.project_id));
        const localOnly = FUND_15_PROPOSALS.filter((p) => !seen.has(p.projectDetails.project_id));
        return [...localOnly, ...fetched];
    }, [catalystData]);

    const totals = useMemo(() => {
        const sum = allProjects.reduce(
            (acc, p) => ({
                requested: acc.requested + p.projectDetails.budget,
                distributed: acc.distributed + p.projectDetails.funds_distributed,
                milestones: acc.milestones + p.projectDetails.milestones_qty,
                delivered: acc.delivered + p.milestonesCompleted,
                yesVotes: acc.yesVotes + (p.projectDetails.voting?.yes_votes_count ?? 0),
                uniqueVoters: acc.uniqueVoters + (p.projectDetails.voting?.unique_wallets ?? 0),
            }),
            { requested: 0, distributed: 0, milestones: 0, delivered: 0, yesVotes: 0, uniqueVoters: 0 }
        );
        // The counterpart halves: what is left, and how far along. Derived from
        // the same sums so the two can never disagree.
        return {
            ...sum,
            milestonesRemaining: sum.milestones - sum.delivered,
            remaining: sum.requested - sum.distributed,
            percentComplete: sum.milestones === 0 ? 0 : Math.round((sum.delivered / sum.milestones) * 100),
            percentDistributed: sum.requested === 0 ? 0 : Math.round((sum.distributed / sum.requested) * 100),
        };
    }, [allProjects]);

    useEffect(() => {
        if (allProjects.length) {
            setFilterConfig(generateCatalystProposalsFilterConfig(allProjects));
        }
    }, [allProjects]);

    const handleSearch = useCallback((searchTerm: string, activeFilters: Record<string, string>) => {
        const active = Boolean(searchTerm) || Object.keys(activeFilters).length > 0;
        setIsSearching(active);
        setFilteredProjects(active ? filterProposals(allProjects, searchTerm, activeFilters) : []);
    }, [allProjects]);

    const visible = isSearching ? filteredProjects : allProjects;

    // A timestamp is only meaningful if it came with records.
    const recordTimestamp = catalystData?.projects?.length
        ? formatTimestamp(catalystData.timestamp)
        : null;

    // No loading gate. The filed Fund 15 proposals are known locally, so the
    // register renders immediately and the fetch only ever adds funded
    // proposals to it. Gating on isLoading meant that with JavaScript off the
    // effect never ran, the flag never cleared, and the sheet showed "Reading
    // the record…" permanently — with the filings sitting unrendered in the
    // bundle the whole time. A record that needs JavaScript to state what was
    // filed is not a record.

    return (
        <div className="sheet">
            <Head>
                <title>Proposals — BlockPrint Governance Record</title>
            </Head>
            <PageHeader
                eyebrow="Sheet 02 · Catalyst"
                title={<>Catalyst Proposal <span>Dashboard</span></>}
                subtitle="BlockPrint has submitted proposals to Cardano's Project Catalyst Fund 15. These proposals need community support and votes. We are grateful for every supporter and want to make sure that our community has easy overview and insights on our proposals."
                meta={
                    <>
                        <strong>{allProjects.length} on record</strong>
                        {/* Only claim a fetch date when something was actually
                            fetched. The empty-record API stamps today's date on
                            an empty payload, which would read as "checked today,
                            all current" when nothing was retrieved at all. */}
                        {recordTimestamp
                            ? `Record read ${recordTimestamp}`
                            : 'From local filings'}
                    </>
                }
            />

            {/* Announced, not blocking. The register below is already correct
                for the filed proposals; this only says that funded ones are
                still being looked for. */}
            {isLoading && !loadError && (
                <p className={styles.notice} role="status">
                    <span className={styles.noticeLabel}>Reading</span>
                    Filed proposals are shown below. Checking the record for funded
                    proposals…
                </p>
            )}

            {loadError && (
                <p className={styles.notice} role="status">
                    <span className={styles.noticeLabel}>Incomplete</span>
                    {loadError} Filed Fund 15 proposals are shown from local records; any
                    funded proposals are missing from this view.
                </p>
            )}

            {/* Totals as a spec block. These replaced three donut charts that,
                with nothing yet funded, drew empty rings — and in the case of
                the votes chart, divided by a zero total. Exact figures serve a
                governance record better than a ring does anyway. */}
            <section className={`${styles.totals} sheet-section`} aria-label="Register totals">
                <div className={styles.total}>
                    <p className={styles.totalKey}>Requested</p>
                    <p className={styles.totalValue}>{formatAda(totals.requested)}</p>
                </div>
                <div className={styles.total}>
                    <p className={styles.totalKey}>Distributed</p>
                    <p className={styles.totalValue}>{formatAda(totals.distributed)}</p>
                </div>
                <div className={styles.total}>
                    <p className={styles.totalKey}>Milestones delivered</p>
                    <p className={styles.totalValue}>
                        {totals.delivered}<span className={styles.totalOf}>/{totals.milestones}</span>
                    </p>
                </div>
                <div className={styles.total}>
                    <p className={styles.totalKey}>Proposals</p>
                    <p className={styles.totalValue}>{allProjects.length}</p>
                </div>
            </section>

            {/* Progress against the filing. The deployed site carries these as
                two donuts — completed against remaining milestones, and
                distributed against remaining funds, each with a percentage.
                Same six figures, stated rather than drawn, because with
                nothing yet funded every one of them is zero and an empty ring
                communicates less than the word "0" does. */}
            <section className="sheet-section" aria-labelledby="progress-heading">
                <h2 className={styles.sectionTitle} id="progress-heading">Project Milestones Progress</h2>
                <dl className={styles.progress}>
                    <div className={styles.progressGroup}>
                        <p className={styles.progressTitle}>Milestones</p>
                        <div className={styles.progressPair}>
                            <dt>Completed</dt>
                            <dd>{formatCount(totals.delivered)}</dd>
                        </div>
                        <div className={styles.progressPair}>
                            <dt>Remaining</dt>
                            <dd>{formatCount(totals.milestonesRemaining)}</dd>
                        </div>
                        <div className={styles.progressPair}>
                            <dt>Complete</dt>
                            <dd>{totals.percentComplete}%</dd>
                        </div>
                    </div>
                    <div className={styles.progressGroup}>
                        <p className={styles.progressTitle}>Funds</p>
                        <div className={styles.progressPair}>
                            <dt>Distributed</dt>
                            <dd>{formatAda(totals.distributed)}</dd>
                        </div>
                        <div className={styles.progressPair}>
                            <dt>Remaining</dt>
                            <dd>{formatAda(totals.remaining)}</dd>
                        </div>
                        <div className={styles.progressPair}>
                            <dt>Distributed</dt>
                            <dd>{totals.percentDistributed}%</dd>
                        </div>
                    </div>
                    <div className={styles.progressGroup}>
                        <p className={styles.progressTitle}>Votes</p>
                        <div className={styles.progressPair}>
                            <dt>Yes votes</dt>
                            <dd>{formatAda(totals.yesVotes)}</dd>
                        </div>
                        <div className={styles.progressPair}>
                            <dt>Unique voters</dt>
                            <dd>{formatCount(totals.uniqueVoters)}</dd>
                        </div>
                        <div className={styles.progressPair}>
                            <dt>Counted</dt>
                            <dd>{totals.uniqueVoters === 0 ? 'Not yet' : 'Yes'}</dd>
                        </div>
                    </div>
                </dl>
            </section>

            <SearchFilterBar
                config={filterConfig}
                onSearch={handleSearch}
                initialSearchTerm={router.query.search as string}
            />

            {isSearching && (
                <p className={styles.resultCount} role="status">
                    {visible.length === 0
                        ? 'No proposals match that search.'
                        : `${visible.length} of ${allProjects.length} proposals match.`}
                </p>
            )}

            <ProposalRegister projects={visible} />
        </div>
    );
}
