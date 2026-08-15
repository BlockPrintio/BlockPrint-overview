import { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CatalystProject } from '../types';
import { formatAda, FUND_15_SUMMARIES } from '../data/fund15';
import MilestoneTrack from './MilestoneTrack';
import styles from '../styles/Proposals.module.css';

const getFundingRound = (category: string): string => {
    const match = category.match(/Fund \d+/i);
    return match ? match[0] : category;
};

interface ProposalRegisterProps {
    projects: CatalystProject[];
}

/**
 * The register. One row per filed proposal, laid out as a drawing's schedule
 * block: identifier, description, quantities, and the measured run.
 *
 * The previous page rendered every proposal three times — once in a
 * highlight panel, once in a milestone grid, and once as a card — so a
 * reader counting proposals could arrive at any of three answers.
 */
const ProposalRegister: FC<ProposalRegisterProps> = ({ projects }) => {
    const router = useRouter();

    if (projects.length === 0) {
        return (
            <p className={styles.status} role="status">
                Nothing on the register yet. Filed proposals appear here once they are recorded.
            </p>
        );
    }

    return (
        <ol className={`${styles.register} sheet-section`}>
            {projects.map((project) => {
                const {
                    project_id, title, budget, funds_distributed,
                    milestones_qty, category, status, url, voting
                } = project.projectDetails;

                const awaitingVote = project.milestonesCompleted === 0 && funds_distributed === 0;
                const summary = FUND_15_SUMMARIES[project_id];
                const detailHref = `/catalyst-proposals/${project_id}`;

                return (
                    <li key={project_id} className={styles.entry}>
                        <div className={styles.entryHead}>
                            <p className={styles.entryId}>
                                <span className={styles.fundTag}>{getFundingRound(category)}</span>
                                <span className={styles.entryIdValue}>{project_id}</span>
                            </p>

                            {/* Status carries a word, not only a colour, and the
                                dot is redundant reinforcement rather than the
                                sole signal. */}
                            <p className={`${styles.status_} ${awaitingVote ? styles.statusAwaiting : styles.statusActive}`}>
                                <span className={styles.statusDot} aria-hidden="true" />
                                {awaitingVote ? 'Awaiting vote' : status}
                            </p>
                        </div>

                        <h2 className={styles.entryTitle}>
                            {/* The whole row was a click target with no keyboard
                                path and no visible URL. It is a real link now. */}
                            <Link href={detailHref} className={styles.entryLink}>
                                {title}
                            </Link>
                        </h2>

                        {summary && <p className={styles.entrySummary}>{summary}</p>}

                        <div className={styles.entryBody}>
                            <dl className={styles.entrySpec}>
                                <div>
                                    <dt>Requested</dt>
                                    <dd>{formatAda(budget)}</dd>
                                </div>
                                <div>
                                    <dt>Distributed</dt>
                                    <dd>{formatAda(funds_distributed)}</dd>
                                </div>
                                {/* Stated even at zero. Hiding these until a
                                    vote existed meant the register silently
                                    dropped two columns the deployed record
                                    shows, and "no votes counted yet" is itself
                                    the fact a reader came for. */}
                                {voting && (
                                    <>
                                        <div>
                                            <dt>Yes votes</dt>
                                            <dd>{formatAda(voting.yes_votes_count)}</dd>
                                        </div>
                                        <div>
                                            <dt>Unique voters</dt>
                                            <dd>{new Intl.NumberFormat('en-US').format(voting.unique_wallets)}</dd>
                                        </div>
                                    </>
                                )}
                            </dl>

                            <div className={styles.entryTrack}>
                                <MilestoneTrack
                                    completed={project.milestonesCompleted}
                                    total={milestones_qty}
                                />
                            </div>
                        </div>

                        <div className={styles.entryActions}>
                            <button
                                type="button"
                                className={styles.entryDetail}
                                onClick={() => router.push(detailHref)}
                            >
                                Open record
                            </button>
                            {url && (
                                <a
                                    className={styles.entryExternal}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Read it on Catalyst
                                </a>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};

export default ProposalRegister;
