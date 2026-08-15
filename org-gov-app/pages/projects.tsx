import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import styles from '../styles/Projects.module.css';
import config from '../config';
import { formatCount } from '../data/fund15';
import {
    readOrgRepos,
    byRecentActivity,
    formatDate,
    formatDateTime,
    formatRelative,
    type OrgSnapshot,
} from '../lib/github';

interface HighlightedProject {
    id: string;
    name: string;
    description: string;
    icon?: string;
    url: string;
    category?: string;
}

const org = config.mainOrganization.displayName;
const ORG = 'BlockPrintio';

/* How many repositories get the full treatment. The rest are listed compactly
   below — a drawing sheet details what is current and indexes the remainder. */
const DETAILED = 6;

export default function Projects() {
    const highlighted: HighlightedProject[] = config.highlightedProjects ?? [];
    const builders = config.builderProjects ?? [];
    const showcase = config.showcaseRepos ?? [];

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
                console.error('Could not read recent work from GitHub:', err);
                if (!cancelled) {
                    setError('Recent work could not be read from GitHub. This sheet reads live, so it is usually a temporary outage — reloading in a minute normally fixes it.');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const { recent, rest, activeCount, lastPush } = useMemo(() => {
        if (!snapshot) return { recent: [], rest: [], activeCount: 0, lastPush: null as string | null };

        // Archived repositories are not current work, so they drop out of the
        // detailed set rather than occupying a slot that a live project needs.
        const live = snapshot.repositories.filter((r) => !r.isArchived);
        const ordered = [...live].sort(byRecentActivity);
        const yearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

        return {
            recent: ordered.slice(0, DETAILED),
            rest: ordered.slice(DETAILED),
            activeCount: ordered.filter((r) => new Date(r.pushedAt).getTime() > yearAgo).length,
            lastPush: ordered[0]?.pushedAt ?? null,
        };
    }, [snapshot]);

    return (
        <div className="sheet">
            <Head>
                <title>Projects — BlockPrint Governance Record</title>
            </Head>
            <PageHeader
                eyebrow="Sheet 04 · Projects"
                title={<>BlockPrint <span>Projects</span></>}
                subtitle={`Projects using ${org} in their GitHub repositories`}
                meta={
                    snapshot
                        ? <><strong>{activeCount} active this year</strong>Read {formatDateTime(snapshot.readAt)}</>
                        : undefined
                }
            />

            {isLoading && (
                <p className={styles.status} role="status">Reading recent work from GitHub…</p>
            )}

            {/* This sheet is read live from GitHub in the browser, so with
                JavaScript off the line above would sit there forever claiming to
                be loading. Say what is actually true and point at the source
                instead. */}
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

            {snapshot && recent.length > 0 && (
                <section className="sheet-section" aria-labelledby="recent-heading">
                    <div className={styles.sectionHead}>
                        <h2 className={styles.sectionTitle} id="recent-heading">Recent work</h2>
                        {lastPush && (
                            <p className={styles.sectionNote}>
                                Most recent commit {formatRelative(lastPush)}
                            </p>
                        )}
                    </div>

                    <ul className={styles.grid}>
                        {recent.map((repo) => (
                            <li key={repo.name} className={styles.card}>
                                <div className={styles.cardHead}>
                                    <h3 className={styles.cardTitle}>
                                        <a
                                            className={styles.cardTitleLink}
                                            href={repo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {repo.name}
                                        </a>
                                    </h3>
                                    <span className={styles.cardPushed}>{formatDate(repo.pushedAt)}</span>
                                </div>

                                <p className={styles.cardBody}>
                                    {repo.description || <span className={styles.cardBodyEmpty}>No description on GitHub.</span>}
                                </p>

                                {repo.topics.length > 0 && (
                                    <ul className={styles.topics}>
                                        {repo.topics.slice(0, 4).map((topic) => (
                                            <li key={topic} className={styles.topic}>{topic}</li>
                                        ))}
                                    </ul>
                                )}

                                {/* Spec block, set like a drawing's callout: label
                                    above value, mono throughout, figures aligned. */}
                                <dl className={styles.spec}>
                                    <div className={styles.specPair}>
                                        <dt>Language</dt>
                                        <dd>{repo.language || '—'}</dd>
                                    </div>
                                    <div className={styles.specPair}>
                                        <dt>Stars</dt>
                                        <dd>{repo.stars}</dd>
                                    </div>
                                    <div className={styles.specPair}>
                                        <dt>Forks</dt>
                                        <dd>{repo.forks}</dd>
                                    </div>
                                    <div className={styles.specPair}>
                                        <dt>Open issues</dt>
                                        <dd>{repo.openIssues}</dd>
                                    </div>
                                    {repo.license && (
                                        <div className={styles.specPair}>
                                            <dt>Licence</dt>
                                            <dd>{repo.license}</dd>
                                        </div>
                                    )}
                                </dl>

                                <div className={styles.cardActions}>
                                    <a
                                        className={styles.cardLink}
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Open repository
                                    </a>
                                    {repo.homepage && (
                                        <a
                                            className={styles.cardLinkQuiet}
                                            href={repo.homepage}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Live site
                                        </a>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {snapshot && rest.length > 0 && (
                <section className="sheet-section" aria-labelledby="rest-heading">
                    <div className={styles.sectionHead}>
                        <h2 className={styles.sectionTitle} id="rest-heading">Also published</h2>
                    </div>
                    {/* Labelled, because this sheet dates by last COMMIT while
                        sheet 05 dates by last update — two different facts that
                        would otherwise look like the same column disagreeing. */}
                    <ul className={styles.compact}>
                        <li className={`${styles.compactRow} ${styles.compactHead}`} aria-hidden="true">
                            <span>Repository</span>
                            <span>Language</span>
                            <span>Last commit</span>
                        </li>
                        {rest.map((repo) => (
                            <li key={repo.name} className={styles.compactRow}>
                                <a
                                    className={styles.compactName}
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {repo.name}
                                </a>
                                <span className={styles.compactLanguage}>
                                    <span className="visually-hidden">Language: </span>
                                    {repo.language || '—'}
                                </span>
                                <span className={styles.compactDate}>
                                    <span className="visually-hidden">Last commit: </span>
                                    {formatDate(repo.pushedAt)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className={styles.footnote}>
                        <Link href="/org-stats" className={styles.footnoteLink}>
                            See every repository with counts on sheet 05
                        </Link>
                    </p>
                </section>
            )}

            {snapshot && snapshot.repositories.length === 0 && (
                <p className={`${styles.status} sheet-section`}>
                    No public repositories under this organisation.
                </p>
            )}

            {/* The showcase the deployed sheet carries. Its entries come from
                showcaseRepos in org-stats-config.json — one today. The two
                counters beside it are on the deployed sheet as "Total repos
                using Mesh" and "Total references"; Mesh is a leftover from the
                template this was forked from, so they are named for the
                organisation that actually owns this record. Both are zero
                because nothing populates them yet, which is what the deployed
                sheet shows too. */}
            {showcase.length > 0 && (
                <section className="sheet-section" aria-labelledby="showcase-heading">
                    <div className={styles.sectionHead}>
                        <h2 className={styles.sectionTitle} id="showcase-heading">
                            {org} Lab Open Source Showcase
                        </h2>
                        <p className={styles.sectionNote}>
                            Featured open source projects from {org} Lab
                        </p>
                    </div>

                    <dl className={styles.counters}>
                        <div className={styles.counter}>
                            <dt>Repositories using {org}</dt>
                            <dd>{formatCount(0)}</dd>
                        </div>
                        <div className={styles.counter}>
                            <dt>Total references</dt>
                            <dd>{formatCount(0)}</dd>
                        </div>
                    </dl>

                    <ul className={styles.grid}>
                        {showcase.map((repo) => (
                            <li key={repo.name} className={styles.card}>
                                <div className={styles.cardHead}>
                                    <h3 className={styles.cardTitle}>{repo.name}</h3>
                                </div>
                                <p className={styles.cardBody}>{repo.description}</p>
                                <div className={styles.cardActions}>
                                    <a
                                        className={styles.cardLink}
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Open repository
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Spotlight and Trusted by Builders are both on the deployed
                sheet with nothing under them. Kept, and each says plainly that
                it is empty rather than rendering a heading over blank paper. */}
            <section className="sheet-section" aria-labelledby="spotlight-heading">
                <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle} id="spotlight-heading">Spotlight</h2>
                </div>
                <p className={styles.sectionBody}>
                    Highlighting a few innovative projects using {org} at their projects.
                    Give it a look, maybe get inspired...
                </p>
            </section>

            <section className="sheet-section" aria-labelledby="builders-heading-2">
                <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle} id="builders-heading-2">Trusted by Builders</h2>
                </div>
                <p className={styles.sectionBody}>
                    Awesome projects and organizations building with {org}
                </p>
            </section>

            {/* Config-driven sections. Both are empty today, so neither renders;
                they stay because populating the config should light them up
                without a code change. */}
            {highlighted.length > 0 && (
                <section className="sheet-section" aria-labelledby="highlight-heading">
                    <div className={styles.sectionHead}>
                        <h2 className={styles.sectionTitle} id="highlight-heading">Built with {org}</h2>
                    </div>
                    <ul className={styles.grid}>
                        {highlighted.map((project) => (
                            <li key={project.id} className={styles.card}>
                                <div className={styles.cardHead}>
                                    <h3 className={styles.cardTitle}>{project.name}</h3>
                                </div>
                                <p className={styles.cardBody}>{project.description}</p>
                                <div className={styles.cardActions}>
                                    <a
                                        className={styles.cardLink}
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Open project
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {builders.length > 0 && (
                <section className="sheet-section" aria-labelledby="builders-heading">
                    <div className={styles.sectionHead}>
                        <h2 className={styles.sectionTitle} id="builders-heading">Organisations building with {org}</h2>
                    </div>
                    <ul className={styles.builders}>
                        {builders.map((project) => (
                            <li key={project.id}>
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.builder}
                                >
                                    {project.icon
                                        ? <Image src={project.icon} alt={project.id} width={100} height={40} />
                                        : <span className={styles.builderName}>{project.id}</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
