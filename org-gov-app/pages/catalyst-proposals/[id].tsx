import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { CatalystProposal } from '../../types';
import { transformCatalystProposalToProject } from '../../utils/catalystDataTransform';
import styles from '../../styles/ProposalDetail.module.css';
import Navigation from '../../components/Navigation';
import config from '../../config';

// Helper functions
const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatAda = (amount: number): string => {
    return `₳ ${formatNumber(amount)}`;
};

const calculateProgress = (completed: number, total: number): number => {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
};

const getFundingRound = (category: string): string => {
    const match = category.match(/Fund \d+/i);
    return match ? match[0] : category;
};

const formatDate = (timestamp: string): string => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export default function ProposalDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [proposal, setProposal] = useState<CatalystProposal | null>(null);
    const [fullContent, setFullContent] = useState<string>('');
    const [structuredContent, setStructuredContent] = useState<Record<string, string> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isContentLoading, setIsContentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Fetch proposal data
    useEffect(() => {
        if (!id) return;

        // Convert to string if it's a number
        const projectId = typeof id === 'string' ? id : String(id);

        const fetchProposal = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch(`/api/catalyst/proposal/${projectId}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Proposal not found');
                    }
                    throw new Error(`Failed to fetch proposal: ${response.status}`);
                }

                const data = await response.json();
                setProposal(data);
            } catch (err) {
                console.error('Error fetching proposal:', err);
                setError(err instanceof Error ? err.message : 'Failed to load proposal');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProposal();
    }, [id]);

    // Fetch full content
    useEffect(() => {
        if (!id || !proposal) return;

        // Convert to string if it's a number
        const projectId = typeof id === 'string' ? id : String(id);

        const fetchContent = async () => {
            try {
                setIsContentLoading(true);
                const response = await fetch(`/api/proposals/${projectId}/full-content`);
                
                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    
                    if (contentType?.includes('application/json')) {
                        // Handle structured JSON response
                        const jsonContent = await response.json();
                        setStructuredContent(jsonContent);
                        
                        // Convert to text format for backward compatibility
                        // Exclude problem, solution, proposal, and feasibility - only show Impact in full content
                        // Solution is already displayed in the boxes above
                        let textContent = '';
                        // Only show Impact in full content (Solution is in the boxes above)
                        if (jsonContent.impact && jsonContent.impact.trim()) {
                            textContent += `[Impact]\n${jsonContent.impact}\n\n`;
                        }
                        setFullContent(textContent.trim());
                        
                        // Set first section as active
                        if (jsonContent.problem) {
                            setActiveSection('problem');
                        } else if (jsonContent.solution) {
                            setActiveSection('solution');
                        }
                    } else {
                        // Handle plain text response
                        const content = await response.text();
                        setFullContent(content);
                        
                        // Set first section as active
                        const firstSection = content.split('\n').find(line => line.startsWith('[') && line.endsWith(']'));
                        if (firstSection) {
                            const sectionId = firstSection.slice(1, -1).toLowerCase()
                                .replace(/[\/&]/g, '-and-')
                                .replace(/\s+/g, '-')
                                .replace(/-+/g, '-');
                            setActiveSection(sectionId);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching full content:', err);
            } finally {
                setIsContentLoading(false);
            }
        };

        fetchContent();
    }, [id, proposal]);


    const handleShare = async () => {
        if (typeof window === 'undefined' || !proposal) return;
        
        const url = window.location.href;
        const title = proposal.title;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Check out this Catalyst proposal: ${title}`,
                    url: url,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <>
                <Head>
                    <title>Loading Proposal - {config.mainOrganization.displayName}</title>
                </Head>
                <Navigation />
                <div className={styles.container}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p className={styles.loadingText}>Loading proposal...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error || !proposal) {
        return (
            <>
                <Head>
                    <title>Proposal Not Found - {config.mainOrganization.displayName}</title>
                </Head>
                <Navigation />
                <div className={styles.container}>
                    <div className={styles.error}>
                        <h1>Proposal Not Found</h1>
                        <p>{error || 'The proposal you are looking for does not exist.'}</p>
                        <Link href="/catalyst-proposals" className={styles.backButton}>
                            ← Back to Proposals
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const progressPercent = calculateProgress(proposal.milestones_completed, proposal.milestones_qty);
    const project = transformCatalystProposalToProject(proposal);

    return (
        <>
            <Head>
                <title>{proposal.title} - {config.mainOrganization.displayName}</title>
                <meta name="description" content={`${proposal.title} - Catalyst Proposal from ${getFundingRound(proposal.category)}`} />
                <meta property="og:title" content={proposal.title} />
                <meta property="og:description" content={`${proposal.title} - Catalyst Proposal from ${getFundingRound(proposal.category)}`} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.origin : ''}/catalyst-proposals/${id}`} />
                <meta property="og:image" content="/blockprint-logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={proposal.title} />
                <meta name="twitter:description" content={`${proposal.title} - Catalyst Proposal from ${getFundingRound(proposal.category)}`} />
                <meta name="twitter:image" content="/blockprint-logo.png" />
            </Head>
            <Navigation />
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link href="/catalyst-proposals" className={styles.backLink}>
                        ← Back to Proposals
                    </Link>
                    <div className={styles.headerActions}>
                        <button onClick={handleShare} className={styles.shareButton}>
                            Share
                        </button>
                        {proposal.url && (
                            <a
                                href={proposal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.externalLink}
                            >
                                View on Catalyst →
                            </a>
                        )}
                    </div>
                </div>

                <div className={styles.proposalHeader}>
                    <div className={styles.statusBadge}>
                        <span className={`${styles.status} ${
                            proposal.status === 'Completed' ? styles.statusCompleted :
                            proposal.status === 'In Progress' ? styles.statusInProgress :
                            styles.statusPending
                        }`}>
                            {proposal.status}
                        </span>
                        <span className={styles.fundTag}>{getFundingRound(proposal.category)}</span>
                    </div>
                    <h1 className={styles.title}>{proposal.title}</h1>
                    <p className={styles.projectId}>Project ID: {proposal.project_id}</p>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Budget Requested</div>
                        <div className={styles.statValue}>{formatAda(proposal.budget)}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Funds Distributed</div>
                        <div className={styles.statValue}>{formatAda(proposal.funds_distributed)}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Milestones</div>
                        <div className={styles.statValue}>
                            {proposal.milestones_completed} / {proposal.milestones_qty}
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${progressPercent}%`,
                                    background: progressPercent === 100
                                        ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.35))'
                                        : progressPercent > 50
                                            ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.25))'
                                            : 'linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.15))'
                                }}
                            />
                        </div>
                    </div>
                    {proposal.voting && (
                        <>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Yes Votes</div>
                                <div className={styles.statValue}>{formatAda(proposal.voting.yes_votes_count)}</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Unique Voters</div>
                                <div className={styles.statValue}>{proposal.voting.unique_wallets}</div>
                            </div>
                        </>
                    )}
                </div>

                {/* Problem and Solution Sections - Prominently Displayed */}
                {structuredContent && (structuredContent.problem || structuredContent.solution) && (
                    <div className={styles.keySections}>
                        {structuredContent.problem && (
                            <div className={styles.keySection}>
                                <h2 className={styles.keySectionTitle}>
                                    Problem
                                </h2>
                                <div className={styles.keySectionContent}>
                                    {structuredContent.problem.split('\n').map((paragraph, idx) => 
                                        paragraph.trim() ? <p key={idx}>{paragraph.trim()}</p> : null
                                    )}
                                </div>
                            </div>
                        )}
                        {structuredContent.solution && (
                            <div className={styles.keySection}>
                                <h2 className={styles.keySectionTitle}>
                                    Solution
                                </h2>
                                <div className={styles.keySectionContent}>
                                    {structuredContent.solution.split('\n').map((paragraph, idx) => 
                                        paragraph.trim() ? <p key={idx}>{paragraph.trim()}</p> : null
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {fullContent && fullContent.trim() && (
                    <div className={styles.contentSection}>
                        <div className={styles.proposalContent}>
                            {isContentLoading ? (
                                <div className={styles.loadingContainer}>
                                    <div className={styles.spinner}></div>
                                    <p className={styles.loadingText}>Loading content...</p>
                                </div>
                            ) : (
                                fullContent.split('\n').map((line, index) => {
                                    const sectionMatch = line.match(/\[([\w/ &]+)\]/);
                                    // Skip section headers (like [Impact]) - don't display them
                                    if (sectionMatch) {
                                        return null;
                                    }
                                    // Filter out questions (lines ending with ?)
                                    // Also filter out the specific text about proposed solution
                                    const trimmedLine = line.trim();
                                    if (trimmedLine && 
                                        !trimmedLine.endsWith('?') && 
                                        trimmedLine.length > 0 &&
                                        !trimmedLine.toLowerCase().includes('please describe your proposed solution and how it addresses the problem')) {
                                        // Also filter out short question-like lines
                                        const questionPatterns = /^(what|who|when|where|why|how|which|can|could|would|should|is|are|was|were|do|does|did|will|may|might)\s+/i;
                                        if (questionPatterns.test(trimmedLine) && trimmedLine.length < 100) {
                                            return null;
                                        }
                                        return <p key={index}>{trimmedLine}</p>;
                                    }
                                    return null;
                                })
                            )}
                        </div>
                    </div>
                )}

                {proposal.updated_at && (
                    <div className={styles.footer}>
                        <p>Last updated: {formatDate(proposal.updated_at)}</p>
                    </div>
                )}
            </div>
        </>
    );
}
