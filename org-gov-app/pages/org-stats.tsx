import { useState, useEffect } from 'react';
import Head from 'next/head';
import PageHeader from '../components/PageHeader';
import config from '../config';
import { useData } from '../contexts/DataContext';
import styles from '../styles/OrgStats.module.css';
import { formatCount } from '../data/fund15';
import manualContributors from '../data/manual-contributors.json';
import { readOrgRepos, formatDate, formatDateTime, type OrgSnapshot } from '../lib/github';

const ORG = 'BlockPrintio';

export default function OrgStatsPage() {
    const { contributorStats } = useData();
    const namedContributors = manualContributors.length;
    const [snapshot, setSnapshot] = useState<OrgSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await readOrgRepos(ORG);
                if (!cancelled) setSnapshot(data);
            } catch (err) {
                // The reader gets a sentence; the console gets the cause.
                // Surfacing err.message put strings like "Failed to fetch" in
                // front of someone auditing a treasury record.
                console.error('Could not read the organisation from GitHub:', err);
                if (!cancelled) {
                    setError('The repository list could not be read from GitHub. This sheet reads live, so it is usually a temporary outage — reloading in a minute normally fixes it.');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="sheet">
            <Head>
                <title>Repositories — BlockPrint Governance Record</title>
            </Head>
            <PageHeader
                eyebrow="Sheet 05 · Repositories"
                title={<>BlockPrint <span>Statistics</span></>}
                subtitle={`Comprehensive statistics and metrics for the ${config.mainOrganization.displayName} organization`}
                meta={
                    snapshot
                        ? <><strong>{snapshot.repositories.length} repositories</strong>Read {formatDateTime(snapshot.readAt)}</>
                        : undefined
                }
            />

            {isLoading && <p className={styles.status} role="status">Reading the organisation from GitHub…</p>}

            {/* Read live in the browser, so without JavaScript the line above
                would claim to be loading forever. State the truth and link the
                source. */}
            <noscript>
                <p className={styles.status}>
                    This sheet reads the repository list from GitHub in your browser, so
                    it needs JavaScript to fill in. The same record is public at{' '}
                    <a href={`https://github.com/${ORG}`} target="_blank" rel="noopener noreferrer">
                        github.com/{ORG}
                    </a>.
                </p>
            </noscript>

            {!isLoading && error && (
                <p className={`${styles.notice} sheet-section`} role="status">
                    <span className={styles.noticeLabel}>Unavailable</span>
                    {error}
                </p>
            )}

            {snapshot && (
                <>
                    <dl className={`${styles.totals} sheet-section`}>
                        <div className={styles.total}>
                            <dt>Repositories</dt>
                            <dd>{formatCount(snapshot.repositories.length)}</dd>
                        </div>
                        <div className={styles.total}>
                            <dt>Stars</dt>
                            <dd>{formatCount(snapshot.totalStars)}</dd>
                        </div>
                        <div className={styles.total}>
                            <dt>Forks</dt>
                            <dd>{formatCount(snapshot.totalForks)}</dd>
                        </div>
                        <div className={styles.total}>
                            <dt>Languages</dt>
                            <dd>{formatCount(snapshot.languages.length)}</dd>
                        </div>
                        {/* Carried on the deployed sheet too. The aggregation
                            is lazy and only the contributors sheet triggers it,
                            so this states the named team until it arrives
                            rather than showing a bare 0 the way the deployed
                            version does. */}
                        <div className={styles.total}>
                            <dt>Contributors</dt>
                            <dd>{formatCount(contributorStats?.unique_count ?? namedContributors)}</dd>
                        </div>
                    </dl>

                    {snapshot.languages.length > 0 && (
                        <section className="sheet-section" aria-labelledby="lang-heading">
                            <h2 className={styles.sectionTitle} id="lang-heading">Languages</h2>
                            <ul className={styles.languages}>
                                {snapshot.languages.map(([language, count]) => (
                                    <li key={language} className={styles.language}>
                                        <span className={styles.languageName}>{language}</span>
                                        <span className={styles.languageCount}>
                                            {count} {count === 1 ? 'repo' : 'repos'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="sheet-section" aria-labelledby="repos-heading">
                        <h2 className={styles.sectionTitle} id="repos-heading">Repositories</h2>

                        {/* The table scrolls inside its own container rather than
                            pushing the page sideways at narrow widths. */}
                        <div className={styles.tableScroll}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th scope="col">Repository</th>
                                        <th scope="col">Language</th>
                                        <th scope="col" className={styles.numeric}>Stars</th>
                                        <th scope="col" className={styles.numeric}>Forks</th>
                                        <th scope="col" className={styles.numeric}>Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {snapshot.repositories.map((repo) => (
                                        <tr key={repo.name}>
                                            <th scope="row" className={styles.repoCell}>
                                                <a
                                                    className={styles.repoLink}
                                                    href={repo.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {repo.name}
                                                </a>
                                                {repo.description && (
                                                    <span className={styles.repoDescription}>{repo.description}</span>
                                                )}
                                            </th>
                                            <td className={styles.languageCell}>{repo.language || '—'}</td>
                                            <td className={styles.numeric}>{repo.stars}</td>
                                            <td className={styles.numeric}>{repo.forks}</td>
                                            <td className={styles.numeric}>{formatDate(repo.updatedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {snapshot.repositories.length === 0 && (
                            <p className={styles.status}>No public repositories under this organisation.</p>
                        )}
                    </section>

                    <p className={styles.footnote}>
                        <a
                            href={`https://github.com/${ORG}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.footnoteLink}
                        >
                            View the organisation on GitHub
                        </a>
                    </p>
                </>
            )}
        </div>
    );
}
