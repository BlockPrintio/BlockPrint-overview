import { useData } from '../contexts/DataContext';
import styles from '../styles/Contributors.module.css';
import Image from 'next/image';
import PageHeader from '../components/PageHeader';
import ContributorModal from '../components/ContributorModal';
import { useState } from 'react';
import { Contributor } from '../types';
import { FaUsers } from 'react-icons/fa';
import { VscGitCommit, VscGitPullRequest, VscRepo } from 'react-icons/vsc';
import ContributionTimeline from '../components/ContributionTimeline';
import ManualContributorCard, { ManualContributor } from '../components/ManualContributorCard';
import manualContributorsData from '../data/manual-contributors.json';

// Generate a consistent color for a repository
const getRepoColor = (repoName: string) => {
    // Generate a hash from the repo name for consistent colors
    let hash = 0;
    for (let i = 0; i < repoName.length; i++) {
        hash = repoName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsla(${hue}, 70%, 60%, 0.3)`;
};

export default function Contributors() {
    const { contributorStats, isLoading, error, isLoadingContributors, contributorsError } = useData();
    const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);

    // Show loading spinner only if we have no data at all (neither manual nor GitHub)
    // Otherwise, show the page with manual contributors while GitHub data loads
    const hasManualContributors = manualContributorsData.length > 0;
    const showLoadingOnly = isLoading && !hasManualContributors && !contributorStats;
    
    if (showLoadingOnly) {
        return (
            <div className={styles.container}>
                <PageHeader
                    title={<>BlockPrint <span>Contributors</span></>}
                    subtitle="Loading contributor data..."
                />
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                </div>
            </div>
        );
    }

    // Calculate total unique repositories (only if contributorStats exists)
    let totalUniqueRepos = 0;
    if (contributorStats) {
        const uniqueRepos = new Set();
        contributorStats.contributors.forEach(contributor => {
            contributor.repoNames.forEach(repoName => {
                uniqueRepos.add(repoName);
            });
        });
        totalUniqueRepos = uniqueRepos.size;
    }

    const handleCardClick = (contributor: Contributor) => {
        setSelectedContributor(contributor);
    };

    return (
        <div className={styles.container}>
            <PageHeader
                title={<>BlockPrint <span>Contributors</span></>}
                subtitle="BlockPrint is build by many minds and hands, here our Contributors"
            />

            {/* Show loading indicator if GitHub data is loading */}
            {isLoading && isLoadingContributors && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '1rem', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.875rem',
                    marginBottom: '1rem'
                }}>
                    Loading GitHub contributor data...
                </div>
            )}

            {/* Show error message if there's an error, but still show manual contributors */}
            {error && contributorsError && (
                <div className={styles.errorContainer} style={{ marginBottom: '2rem' }}>
                    <p>Error loading GitHub contributor data: {contributorsError}</p>
                </div>
            )}

            {/* Summary stats - only show if GitHub contributor stats are available */}
            {contributorStats && (
                <div className={styles.summaryContainer}>
                    <div className={styles.summaryCards}>
                        <div className={`${styles.summaryCard} ${styles.card}`}>
                            <div className={styles.summaryContent}>
                                <div className={styles.statColumn}>
                                    <FaUsers className={styles.summaryIcon} />
                                    <p className={styles.statLabel}>Contributors</p>
                                    <p className={styles.summaryNumber}>{contributorStats.unique_count}</p>
                                </div>
                                <div className={styles.statColumn}>
                                    <VscRepo className={styles.summaryIcon} />
                                    <p className={styles.statLabel}>Repositories</p>
                                    <p className={styles.summaryNumber}>{totalUniqueRepos}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.summaryCard} ${styles.card}`}>
                            <div className={styles.summaryContent}>
                                <div className={styles.statColumn}>
                                    <VscGitCommit className={styles.summaryIcon} />
                                    <p className={styles.statLabel}>Commits</p>
                                    <p className={styles.summaryNumber}>{contributorStats.total_commits || 0}</p>
                                </div>
                                <div className={styles.statColumn}>
                                    <VscGitPullRequest className={styles.summaryIcon} />
                                    <p className={styles.statLabel}>Pull Requests</p>
                                    <p className={styles.summaryNumber}>{contributorStats.total_pull_requests}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Contributors Section */}
            {manualContributorsData.length > 0 && (
                <>
                    <div className={styles.sectionHeader} style={{ marginTop: '3rem', marginBottom: '2rem' }}>
                        <h2 className={styles.sectionTitle}>Community Contributors</h2>
                        <p className={styles.sectionDescription}>Members of our community who contribute to BlockPrint</p>
                    </div>
                    <div className={styles.contributorsGrid}>
                        {manualContributorsData.map((contributor: ManualContributor, index: number) => (
                            <ManualContributorCard key={`manual-${index}`} contributor={contributor} />
                        ))}
                    </div>
                </>
            )}

            {/* GitHub Contributors Section */}
            {contributorStats && contributorStats.contributors.length > 0 && (
                <>
                    <div className={styles.sectionHeader} style={{ marginTop: manualContributorsData.length > 0 ? '4rem' : '3rem', marginBottom: '2rem' }}>
                        <h2 className={styles.sectionTitle}>GitHub Contributors</h2>
                        <p className={styles.sectionDescription}>Contributors who have made commits and pull requests to our repositories</p>
                    </div>
                    <div className={styles.contributorsGrid}>
                        {contributorStats.contributors.map((contributor) => (
                            <div
                                key={contributor.login}
                                className={styles.contributorCard}
                                onClick={() => handleCardClick(contributor)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleCardClick(contributor);
                                    }
                                }}
                            >
                                <div className={styles.contributorHeader}>
                                    <Image
                                        src={contributor.avatar_url}
                                        alt={`${contributor.login}'s avatar`}
                                        width={48}
                                        height={48}
                                        className={styles.avatar}
                                    />
                                    <h3 className={styles.username}>{contributor.login}</h3>
                                </div>
                                <div className={styles.contributorStats}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Commits</span>
                                        <span className={styles.statValue}>{contributor.commits}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>PRs</span>
                                        <span className={styles.statValue}>{contributor.pull_requests}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Repos</span>
                                        <span className={styles.statValue}>{contributor.repoNames.length}</span>
                                    </div>
                                </div>

                                <div className={styles.timelineContainer}>
                                    <ContributionTimeline
                                        commitTimestamps={contributor.repositories.flatMap(repo => repo.commit_timestamps)}
                                        prTimestamps={contributor.repositories.flatMap(repo => repo.pr_timestamps)}
                                    />
                                </div>

                                <div className={styles.topRepos}>
                                    {contributor.repositories
                                        .sort((a, b) => b.contributions - a.contributions)
                                        .slice(0, 3)
                                        .map((repo) => (
                                            <div key={repo.name} className={styles.repoBreakdown}>
                                                <div
                                                    className={styles.repoColor}
                                                    style={{ backgroundColor: getRepoColor(repo.name) }}
                                                />
                                                <div className={styles.repoInfo}>
                                                    <span className={styles.repoName}>{repo.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Show message if no contributors at all */}
            {!hasManualContributors && (!contributorStats || contributorStats.contributors.length === 0) && !isLoading && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1rem'
                }}>
                    <p>No contributors to display at this time.</p>
                </div>
            )}

            {selectedContributor && (
                <ContributorModal
                    contributor={selectedContributor}
                    onClose={() => setSelectedContributor(null)}
                />
            )}
        </div>
    );
} 