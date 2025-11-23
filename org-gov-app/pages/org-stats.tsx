import { useData } from '../contexts/DataContext';
import styles from '../styles/OrgStats.module.css';
import PageHeader from '../components/PageHeader';
import config from '../config';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';

interface Repository {
    name: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    watchers: number;
    url: string;
    updated_at: string;
}

interface BlockPrintStats {
    totalRepos: number;
    languages: { [key: string]: number };
    totalStars: number;
    totalForks: number;
    repositories: Repository[];
}

export default function OrgStatsPage() {
    const { contributorStats, isLoading } = useData();
    const [stats, setStats] = useState<BlockPrintStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        // Fetch BlockPrint organization stats from GitHub API
        const fetchBlockPrintStats = async () => {
            try {
                setIsLoadingStats(true);
                const response = await fetch('https://api.github.com/orgs/BlockPrintio/repos?per_page=100&sort=updated');
                const repos = await response.json();

                if (Array.isArray(repos)) {
                    const languages: { [key: string]: number } = {};
                    let totalStars = 0;
                    let totalForks = 0;

                    const repositories: Repository[] = repos.map((repo: {
                        name: string;
                        description: string | null;
                        language: string | null;
                        stargazers_count: number;
                        forks_count: number;
                        watchers_count: number;
                        html_url: string;
                        updated_at: string;
                    }) => {
                        // Count languages
                        if (repo.language) {
                            languages[repo.language] = (languages[repo.language] || 0) + 1;
                        }

                        totalStars += repo.stargazers_count || 0;
                        totalForks += repo.forks_count || 0;

                        return {
                            name: repo.name,
                            description: repo.description || 'No description available',
                            language: repo.language || 'Other',
                            stars: repo.stargazers_count || 0,
                            forks: repo.forks_count || 0,
                            watchers: repo.watchers_count || 0,
                            url: repo.html_url,
                            updated_at: repo.updated_at
                        };
                    });

                    setStats({
                        totalRepos: repos.length,
                        languages,
                        totalStars,
                        totalForks,
                        repositories
                    });
                }
            } catch (error) {
                console.error('Error fetching BlockPrint stats:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchBlockPrintStats();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getLanguageColor = (language: string) => {
        const colors: { [key: string]: string } = {
            'TypeScript': '#3178c6',
            'Haskell': '#5e5086',
            'Rust': '#dea584',
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'Other': '#6e7681'
        };
        return colors[language] || colors['Other'];
    };

    if (isLoadingStats || isLoading) {
        return (
            <div className={styles.container}>
                <PageHeader
                    title={<>{config.mainOrganization.displayName} <span>Statistics</span></>}
                    subtitle="Loading BlockPrint organization statistics..."
                />
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(255, 255, 255, 0.1)',
                        borderLeftColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className={styles.container}>
                <PageHeader
                    title={<>{config.mainOrganization.displayName} <span>Statistics</span></>}
                    subtitle="Unable to load statistics"
                />
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <p>Failed to load BlockPrint statistics. Please try again later.</p>
                </div>
            </div>
        );
    }

    const languageEntries = Object.entries(stats.languages).sort((a, b) => b[1] - a[1]);
    const totalContributors = contributorStats?.unique_count || 0;

    return (
        <div className={styles.container}>
            <PageHeader
                title={<>{config.mainOrganization.displayName} <span>Statistics</span></>}
                subtitle="Comprehensive statistics and metrics for the BlockPrint organization"
            />

            {/* Overview Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.stat}>
                    <h3>Total Repositories</h3>
                    <p>{stats.totalRepos}</p>
                </div>
                <div className={styles.stat}>
                    <h3>Total Stars</h3>
                    <p>{stats.totalStars.toLocaleString()}</p>
                </div>
                <div className={styles.stat}>
                    <h3>Total Forks</h3>
                    <p>{stats.totalForks.toLocaleString()}</p>
                </div>
                <div className={styles.stat}>
                    <h3>Contributors</h3>
                    <p>{totalContributors}</p>
                </div>
                <div className={styles.stat}>
                    <h3>Languages</h3>
                    <p>{languageEntries.length}</p>
                </div>
            </div>

            {/* Languages Breakdown */}
            {languageEntries.length > 0 && (
                <div className={styles.githubStats}>
                    <h2>Languages</h2>
                    <div className={styles.statsGrid}>
                        {languageEntries.map(([language, count]) => (
                            <div key={language} className={styles.stat}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <div 
                                        style={{ 
                                            width: '12px', 
                                            height: '12px', 
                                            borderRadius: '50%',
                                            backgroundColor: getLanguageColor(language),
                                            flexShrink: 0
                                        }} 
                                    />
                                    <h3 style={{ margin: 0 }}>{language}</h3>
                                </div>
                                <p>{count} {count === 1 ? 'repository' : 'repositories'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Repositories List */}
            <div className={styles.githubStats}>
                <h2>Repositories</h2>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                    gap: '1.5rem',
                    marginTop: '1.5rem'
                }}>
                    {stats.repositories.map((repo) => (
                        <Link
                            key={repo.name}
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}
                        >
                            <div className={styles.statCard} style={{ 
                                cursor: 'pointer',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem',
                                    marginBottom: '1rem'
                                }}>
                                    <FaGithub style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                                    <h3 style={{ 
                                        margin: 0, 
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        flex: 1
                                    }}>
                                        {repo.name}
                                    </h3>
                                </div>
                                
                                <p style={{ 
                                    fontSize: '0.875rem',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    lineHeight: '1.5',
                                    marginBottom: '1rem',
                                    flex: 1
                                }}>
                                    {repo.description}
                                </p>

                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1.5rem',
                                    marginTop: 'auto',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    {repo.language && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div 
                                                style={{ 
                                                    width: '10px', 
                                                    height: '10px', 
                                                    borderRadius: '50%',
                                                    backgroundColor: getLanguageColor(repo.language)
                                                }} 
                                            />
                                            <span style={{ 
                                                fontSize: '0.75rem',
                                                color: 'rgba(255, 255, 255, 0.6)'
                                            }}>
                                                {repo.language}
                                            </span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaStar style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }} />
                                        <span style={{ 
                                            fontSize: '0.75rem',
                                            color: 'rgba(255, 255, 255, 0.6)'
                                        }}>
                                            {repo.stars}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaCodeBranch style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }} />
                                        <span style={{ 
                                            fontSize: '0.75rem',
                                            color: 'rgba(255, 255, 255, 0.6)'
                                        }}>
                                            {repo.forks}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ 
                                    fontSize: '0.7rem',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    marginTop: '0.75rem'
                                }}>
                                    Updated {formatDate(repo.updated_at)}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* GitHub Link */}
            <div style={{ 
                textAlign: 'center', 
                marginTop: '3rem',
                padding: '2rem'
            }}>
                <Link
                    href="https://github.com/BlockPrintio"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.875rem 2rem',
                        background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.background = 'linear-gradient(165deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'linear-gradient(165deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)';
                    }}
                >
                    <FaGithub />
                    <span>View on GitHub</span>
                </Link>
            </div>
        </div>
    );
}
