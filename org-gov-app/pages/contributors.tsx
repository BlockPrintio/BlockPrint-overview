import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useData } from '../contexts/DataContext';
import styles from '../styles/Contributors.module.css';
import PageHeader from '../components/PageHeader';
import ContributorModal from '../components/ContributorModal';
import ContributionTimeline from '../components/ContributionTimeline';
import ManualContributorCard, { ManualContributor } from '../components/ManualContributorCard';
import manualContributorsData from '../data/manual-contributors.json';
import { Contributor } from '../types';
import { formatCount } from '../data/fund15';

export default function Contributors() {
    const {
        contributorStats,
        isLoadingContributors,
        contributorsError,
        loadContributorStats
    } = useData();
    const [selected, setSelected] = useState<Contributor | null>(null);

    // The GitHub aggregation is lazy — nothing fetches it until this sheet is
    // opened, which is the only page that reads it.
    useEffect(() => {
        void loadContributorStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const team = manualContributorsData as ManualContributor[];
    const githubContributors = contributorStats?.contributors ?? [];

    const uniqueRepos = new Set<string>();
    githubContributors.forEach((c) => c.repoNames.forEach((r) => uniqueRepos.add(r)));

    return (
        <div className="sheet">
            <Head>
                <title>Contributors — BlockPrint Governance Record</title>
            </Head>
            <PageHeader
                eyebrow="Sheet 03 · People"
                title={<>BlockPrint <span>Contributors</span></>}
                subtitle="BlockPrint is build by many minds and hands, here our Contributors"
                meta={<><strong>{team.length} on the team</strong>Listed as filed</>}
            />

            {team.length > 0 && (
                <section className="sheet-section" aria-labelledby="team-heading">
                    <h2 className={styles.sectionTitle} id="team-heading">Community Contributors</h2>
                    <p className={styles.sectionNote}>Members of our community who contribute to BlockPrint</p>
                    <ul className={styles.teamGrid}>
                        {team.map((contributor) => (
                            <li key={contributor.github}>
                                <ManualContributorCard contributor={contributor} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className="sheet-section" aria-labelledby="github-heading">
                <h2 className={styles.sectionTitle} id="github-heading">Counted from GitHub</h2>

                {isLoadingContributors && (
                    <p className={styles.status} role="status">Counting commits and pull requests…</p>
                )}

                {!isLoadingContributors && contributorsError && (
                    <p className={styles.notice} role="status">
                        <span className={styles.noticeLabel}>Unavailable</span>
                        The GitHub aggregation could not be read, so no counted figures are
                        shown. The team above is unaffected.
                    </p>
                )}

                {!isLoadingContributors && !contributorsError && githubContributors.length === 0 && (
                    <p className={styles.status} role="status">
                        No counted contributions recorded yet.
                    </p>
                )}

                {contributorStats && githubContributors.length > 0 && (
                    <>
                        <dl className={styles.totals}>
                            <div className={styles.total}>
                                <dt>Contributors</dt>
                                <dd>{formatCount(contributorStats.unique_count)}</dd>
                            </div>
                            <div className={styles.total}>
                                <dt>Repositories</dt>
                                <dd>{formatCount(uniqueRepos.size)}</dd>
                            </div>
                            <div className={styles.total}>
                                <dt>Commits</dt>
                                <dd>{formatCount(contributorStats.total_commits || 0)}</dd>
                            </div>
                            <div className={styles.total}>
                                <dt>Pull requests</dt>
                                <dd>{formatCount(contributorStats.total_pull_requests || 0)}</dd>
                            </div>
                        </dl>

                        <ul className={styles.contributorGrid}>
                            {githubContributors.map((contributor) => (
                                <li key={contributor.login}>
                                    {/* A real button. This was a div with
                                        role="button" and a keydown handler,
                                        which is the long way round to something
                                        the platform already does correctly. */}
                                    <button
                                        type="button"
                                        className={styles.contributorCard}
                                        onClick={() => setSelected(contributor)}
                                    >
                                        <span className={styles.contributorHead}>
                                            <Image
                                                src={contributor.avatar_url}
                                                alt=""
                                                width={40}
                                                height={40}
                                                className={styles.avatar}
                                            />
                                            <span className={styles.login}>{contributor.login}</span>
                                        </span>

                                        <span className={styles.figures}>
                                            <span className={styles.figure}>
                                                <span className={styles.figureKey}>Commits</span>
                                                <span className={styles.figureValue}>{contributor.commits}</span>
                                            </span>
                                            <span className={styles.figure}>
                                                <span className={styles.figureKey}>PRs</span>
                                                <span className={styles.figureValue}>{contributor.pull_requests}</span>
                                            </span>
                                            <span className={styles.figure}>
                                                <span className={styles.figureKey}>Repos</span>
                                                <span className={styles.figureValue}>{contributor.repoNames.length}</span>
                                            </span>
                                        </span>

                                        <span className={styles.timeline}>
                                            <ContributionTimeline
                                                commitTimestamps={contributor.repositories.flatMap((r) => r.commit_timestamps)}
                                                prTimestamps={contributor.repositories.flatMap((r) => r.pr_timestamps)}
                                                height={48}
                                            />
                                        </span>

                                        {/* Repository names, set in mono. The
                                            previous build gave each one a colour
                                            hashed from its name — twelve hues
                                            that encoded nothing. */}
                                        <span className={styles.repos}>
                                            {[...contributor.repositories]
                                                .sort((a, b) => b.contributions - a.contributions)
                                                .slice(0, 3)
                                                .map((repo) => (
                                                    <span key={repo.name} className={styles.repo}>{repo.name}</span>
                                                ))}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </section>

            {selected && (
                <ContributorModal contributor={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}
