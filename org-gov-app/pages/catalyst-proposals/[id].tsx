import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { CatalystProposal } from '../../types';
import { getFundingRound } from '../../config/filterConfig';
import { formatAda, formatCount } from '../../data/fund15';
import MilestoneTrack from '../../components/MilestoneTrack';
import styles from '../../styles/ProposalDetail.module.css';
import config from '../../config';

const formatDate = (timestamp: string): string | null => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    }).format(date);
};

// Catalyst's own form prompts get scraped along with the answers, so the
// extracted text arrives salted with the questions the author was answering.
// These are the prompts, not the proposal.
const FORM_PROMPTS = [
    /^please describe/i,
    /^describe your/i,
    /^what does success look like/i,
    /^how does this/i,
    /^total funds requested/i,
];

/** Paragraph-splits extracted prose, dropping empty lines and form prompts. */
const toParagraphs = (text: string): string[] =>
    text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => !line.endsWith('?'))
        .filter((line) => !FORM_PROMPTS.some((pattern) => pattern.test(line)));

export default function ProposalDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    const [proposal, setProposal] = useState<CatalystProposal | null>(null);
    const [sections, setSections] = useState<Record<string, string> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isContentLoading, setIsContentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

    useEffect(() => {
        if (!id) return;
        const projectId = String(id);
        let cancelled = false;

        const fetchProposal = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`/api/catalyst/proposal/${projectId}`);
                if (!response.ok) {
                    throw new Error(response.status === 404
                        ? 'No proposal is recorded under that project ID.'
                        : `The record could not be read (${response.status}).`);
                }
                const data = await response.json();
                if (!cancelled) setProposal(data);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'The record could not be read.');
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchProposal();
        return () => { cancelled = true; };
    }, [id]);

    useEffect(() => {
        if (!id || !proposal) return;
        const projectId = String(id);
        let cancelled = false;

        const fetchContent = async () => {
            try {
                setIsContentLoading(true);
                const response = await fetch(`/api/proposals/${projectId}/full-content`);
                if (!response.ok) return;

                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    const json = await response.json();
                    if (!cancelled) setSections(json);
                }
            } catch (err) {
                console.error('Error fetching proposal content:', err);
            } finally {
                if (!cancelled) setIsContentLoading(false);
            }
        };

        fetchContent();
        return () => { cancelled = true; };
    }, [id, proposal]);

    const handleShare = async () => {
        if (typeof window === 'undefined' || !proposal) return;
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title: proposal.title, url });
                return;
            } catch {
                // Dismissed, or unavailable — fall through to copying.
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            // The button reports its own outcome instead of firing an alert().
            setShareState('copied');
            setTimeout(() => setShareState('idle'), 2400);
        } catch {
            console.error('Could not copy the link.');
        }
    };

    if (isLoading) {
        return (
            <div className="sheet">
                <p className={styles.status} role="status">Reading the record…</p>
            </div>
        );
    }

    if (error || !proposal) {
        return (
            <>
                <Head>
                    <title>{`Record not found — ${config.mainOrganization.displayName}`}</title>
                </Head>
                <div className="sheet">
                    <div className={styles.notFound}>
                        <p className={styles.notFoundLabel}>Not on the register</p>
                        <h1 className={styles.notFoundTitle}>No record under that ID</h1>
                        <p className={styles.notFoundBody}>
                            {error || 'That proposal is not on the register.'}
                        </p>
                        <Link href="/catalyst-proposals" className={styles.backButton}>
                            Back to the register
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const round = getFundingRound(proposal.category);
    const description = `${proposal.title} — ${round} proposal filed by ${config.mainOrganization.displayName}.`;
    const updated = formatDate(proposal.updated_at);
    const awaitingVote = proposal.milestones_completed === 0 && proposal.funds_distributed === 0;
    const hasVotes = Boolean(proposal.voting && proposal.voting.yes_votes_count > 0);

    return (
        <>
            <Head>
                <title>{`${proposal.title} — ${config.mainOrganization.displayName}`}</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={proposal.title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="article" />
                <meta property="og:image" content="/blockprint-logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={proposal.title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content="/blockprint-logo.png" />
            </Head>

            <div className="sheet">
                <Link href="/catalyst-proposals" className={styles.backLink}>
                    <span aria-hidden="true">←</span> Register
                </Link>

                <header className={styles.header}>
                    <div className={styles.headerMain}>
                        <p className={styles.identifiers}>
                            <span className={styles.fundTag}>{round}</span>
                            <span className={styles.projectId}>{proposal.project_id}</span>
                            <span className={`${styles.state} ${awaitingVote ? styles.stateAwaiting : styles.stateActive}`}>
                                <span className={styles.stateDot} aria-hidden="true" />
                                {awaitingVote ? 'Awaiting vote' : proposal.status}
                            </span>
                        </p>
                        <h1 className={styles.title}>{proposal.title}</h1>
                    </div>

                    <div className={styles.headerActions}>
                        <button type="button" onClick={handleShare} className={styles.shareButton}>
                            {shareState === 'copied' ? 'Link copied' : 'Share'}
                        </button>
                        {proposal.url && (
                            <a
                                href={proposal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.externalLink}
                            >
                                Read it on Catalyst
                            </a>
                        )}
                    </div>
                </header>

                <section className={`${styles.specs} sheet-section`} aria-label="Proposal figures">
                    <div className={styles.spec}>
                        <p className={styles.specKey}>Requested</p>
                        <p className={styles.specValue}>{formatAda(proposal.budget)}</p>
                    </div>
                    <div className={styles.spec}>
                        <p className={styles.specKey}>Distributed</p>
                        <p className={styles.specValue}>{formatAda(proposal.funds_distributed)}</p>
                    </div>
                    {hasVotes && proposal.voting && (
                        <>
                            <div className={styles.spec}>
                                <p className={styles.specKey}>Yes votes</p>
                                <p className={styles.specValue}>{formatCount(proposal.voting.yes_votes_count)}</p>
                            </div>
                            <div className={styles.spec}>
                                <p className={styles.specKey}>Unique wallets</p>
                                <p className={styles.specValue}>{formatCount(proposal.voting.unique_wallets)}</p>
                            </div>
                        </>
                    )}
                    <div className={`${styles.spec} ${styles.specTrack}`}>
                        <p className={styles.specKey}>Milestones</p>
                        <MilestoneTrack
                            completed={proposal.milestones_completed}
                            total={proposal.milestones_qty}
                        />
                    </div>
                </section>

                {isContentLoading && !sections && (
                    <p className={`${styles.status} sheet-section`} role="status">
                        Fetching the proposal text from Catalyst…
                    </p>
                )}

                {sections && (sections.problem || sections.solution || sections.impact) && (
                    <div className="sheet-section">
                        <p className={styles.sourceNote}>
                            The text below is extracted from the proposal page on
                            projectcatalyst.io. Read it there for the authoritative version.
                        </p>

                        {(['problem', 'solution', 'impact'] as const).map((key) => {
                            const value = sections[key];
                            if (!value || !value.trim()) return null;
                            return (
                                <section key={key} className={styles.prose}>
                                    <h2 className={styles.proseTitle}>{key}</h2>
                                    <div className={styles.proseBody}>
                                        {toParagraphs(value).map((paragraph, i) => (
                                            <p key={i}>{paragraph}</p>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}

                {updated && (
                    <footer className={styles.footer}>
                        <p>Record last written {updated}</p>
                    </footer>
                )}
            </div>
        </>
    );
}
