import CatalystProposalsList from '../components/CatalystProposalsList';
import { useData } from '../contexts/DataContext';
import styles from '../styles/Proposals.module.css';
import PageHeader from '../components/PageHeader';
import SearchFilterBar, { SearchFilterConfig } from '../components/SearchFilterBar';
import { filterProposals, generateCatalystProposalsFilterConfig } from '../config/filterConfig';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { CatalystProject } from '../types';
import { useRouter } from 'next/router';
import CatalystMilestonesDonut from '../components/CatalystMilestonesDonut';
import CatalystBudgetDonut from '../components/CatalystBudgetDonut';
import VotesDonutChart from '../components/VotesDonutChart';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { CatalystData } from '../types';

// Helper functions for milestone overview
const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const calculateProgress = (completed: number, total: number): number => {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
};

const getFundingRound = (category: string): string => {
    const match = category.match(/Fund \d+/i);
    return match ? match[0] : category;
};

// Fund 15 Static Proposals Data
const FUND_15_PROPOSALS: CatalystProject[] = [
    {
        projectDetails: {
            id: 1,
            title: 'BlockPrint | Gimbalabs build a cardano Treasury explorer',
            budget: 150000,
            milestones_qty: 5,
            funds_distributed: 0,
            project_id: '1500001',
            name: 'BlockPrint',
            category: 'Fund 15 - Cardano Use Cases: Prototype & Launch',
            url: 'https://projectcatalyst.io/funds/15/cardano-use-cases-prototype-and-launch/blockprint-or-gimbalabs-build-a-cardano-treasury-explorer',
            status: 'In Progress' as 'In Progress' | 'Completed',
            finished: '',
            milestones_content: null,
            voting: {
                proposalId: 0,
                yes_votes_count: 0,
                no_votes_count: null,
                abstain_votes_count: null,
                unique_wallets: 0
            }
        },
        milestonesCompleted: 0
    },
    {
        projectDetails: {
            id: 2,
            title: 'CS-Code: Web-IDE scaffolder for onchain and offchain code',
            budget: 80000,
            milestones_qty: 5,
            funds_distributed: 0,
            project_id: '1500002',
            name: 'BlockPrint',
            category: 'Fund 15 - Cardano Use Cases: Prototype & Launch',
            url: 'https://projectcatalyst.io/funds/15/cardano-use-cases-prototype-and-launch/cs-code-web-ide-scaffolder-for-onchain-and-offchain-code',
            status: 'In Progress' as 'In Progress' | 'Completed',
            finished: '',
            milestones_content: null,
            voting: {
                proposalId: 0,
                yes_votes_count: 0,
                no_votes_count: null,
                abstain_votes_count: null,
                unique_wallets: 0
            }
        },
        milestonesCompleted: 0
    }
];

export default function CatalystProposals() {
    const router = useRouter();
    const { isLoading, error } = useData();
    const [catalystData, setCatalystData] = useState<{ catalystData: CatalystData } | null>(null);
    const [catalystLoading, setCatalystLoading] = useState(true);
    const [catalystError, setCatalystError] = useState<string | null>(null);
    const [filteredProjects, setFilteredProjects] = useState<CatalystProject[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [filterConfig, setFilterConfig] = useState<SearchFilterConfig>({
        placeholder: "Search proposals...",
        filters: []
    });
    const shouldRestoreScroll = useRef(false);

    // Enable scroll restoration
    useScrollRestoration();

    // Fetch catalyst data
    useEffect(() => {
        const fetchCatalystData = async () => {
            try {
                setCatalystLoading(true);
                setCatalystError(null);
                const response = await fetch('/api/catalyst/data');
                if (!response.ok) {
                    throw new Error(`Failed to fetch catalyst data: ${response.status}`);
                }
                const data = await response.json();
                
                // Handle empty data gracefully
                if (!data || !data.projects || data.projects.length === 0) {
                    console.warn('No catalyst projects found in data');
                    setCatalystData({ catalystData: { timestamp: new Date().toISOString(), projects: FUND_15_PROPOSALS } });
                } else {
                    // Merge Fund 15 proposals with fetched data
                    const mergedProjects = [...FUND_15_PROPOSALS, ...data.projects];
                    setCatalystData({ catalystData: { ...data, projects: mergedProjects } });
                }
            } catch (err) {
                console.error('Error fetching catalyst data:', err);
                setCatalystError('Failed to load catalyst data');
                // Set Fund 15 data structure on error so page can still render
                setCatalystData({ catalystData: { timestamp: new Date().toISOString(), projects: FUND_15_PROPOSALS } });
            } finally {
                setCatalystLoading(false);
            }
        };

        fetchCatalystData();
    }, []);

    useEffect(() => {
        // Check if we're returning from a proposal page
        if (router.asPath === '/catalyst-proposals' && shouldRestoreScroll.current) {
            const scrollY = sessionStorage.getItem('scrollPosition');
            if (scrollY) {
                // Delay the scroll restoration slightly to ensure the page is fully rendered
                setTimeout(() => {
                    window.scrollTo(0, parseInt(scrollY));
                    sessionStorage.removeItem('scrollPosition');
                }, 100);
            }
            shouldRestoreScroll.current = false;
        }
    }, [router.asPath]);

    useEffect(() => {
        if (catalystData?.catalystData) {
            setFilterConfig(generateCatalystProposalsFilterConfig(catalystData.catalystData.projects));
        }
    }, [catalystData]);

    // Get data early to avoid conditional access
    const data = catalystData?.catalystData;
    
    // Ensure Fund 15 proposals are always included - MUST be before any conditional returns
    const allProjects = useMemo(() => {
        if (!data || !data.projects || data.projects.length === 0) {
            return FUND_15_PROPOSALS;
        }
        // Merge Fund 15 proposals, avoiding duplicates
        const existingIds = new Set(data.projects.map(p => p.projectDetails.project_id));
        const fund15ToAdd = FUND_15_PROPOSALS.filter(p => !existingIds.has(p.projectDetails.project_id));
        return [...fund15ToAdd, ...data.projects];
    }, [data]);

    // Calculate milestone stats
    const milestoneStats = useMemo(() => {
        let totalMilestones = 0;
        let completedMilestones = 0;

        allProjects.forEach((project: CatalystProject) => {
            totalMilestones += project.projectDetails.milestones_qty;
            completedMilestones += project.milestonesCompleted;
        });

        return { totalMilestones, completedMilestones };
    }, [allProjects]);

    // Calculate budget stats
    const budgetStats = useMemo(() => {
        let totalBudget = 0;
        let distributedBudget = 0;

        allProjects.forEach((project: CatalystProject) => {
            totalBudget += project.projectDetails.budget;
            distributedBudget += project.projectDetails.funds_distributed;
        });

        return { totalBudget, distributedBudget };
    }, [allProjects]);

    // Handle search and filtering
    const handleSearch = useCallback((searchTerm: string, activeFilters: Record<string, string>) => {
        if (!searchTerm && Object.keys(activeFilters).length === 0) {
            setFilteredProjects([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const filtered = filterProposals(allProjects, searchTerm, activeFilters);
        setFilteredProjects(filtered);
    }, [allProjects]);

    // Handle URL search parameter
    useEffect(() => {
        if (router.isReady && router.query.search && data) {
            const searchTerm = router.query.search as string;
            const filtered = filterProposals(data.projects, searchTerm, {});
            setFilteredProjects(filtered);
            setIsSearching(true);
        }
    }, [router.isReady, router.query.search, data]);

    if (isLoading || catalystLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading catalyst data...</div>
            </div>
        );
    }

    // Only show error if we have a real error and no data
    if ((error || catalystError) && (!catalystData || !catalystData.catalystData || !catalystData.catalystData.projects || catalystData.catalystData.projects.length === 0)) {
        return (
            <div className={styles.container}>
                <PageHeader
                    title={<>Catalyst Proposal <span>Dashboard</span></>}
                    subtitle="BlockPrint received strong support from Ada voters at Cardano's Project Catalyst. We are grateful for every support and want to make sure that our supporters have easy overview and insights on the progress of our funded proposals"
                />
                <div className={styles.error} style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <p>{error || catalystError}</p>
                </div>
            </div>
        );
    }

    if (!data || allProjects.length === 0) {
        return (
            <div className={styles.container}>
                <PageHeader
                    title={<>Catalyst Proposal <span>Dashboard</span></>}
                    subtitle="BlockPrint received strong support from Ada voters at Cardano's Project Catalyst. We are grateful for every support and want to make sure that our supporters have easy overview and insights on the progress of our funded proposals"
                />
                <div className={styles.error} style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <p>No catalyst proposals data available at this time.</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                        Catalyst data will appear here once it&apos;s been loaded.
                    </p>
                </div>
            </div>
        );
    }

    // Determine which data to display
    const displayData = {
        ...data,
        timestamp: data?.timestamp || new Date().toISOString(),
        projects: isSearching ? filteredProjects : allProjects
    };

    return (
        <div className={styles.container}>
            <PageHeader
                title={<>Catalyst Proposal <span>Dashboard</span></>}
                subtitle="BlockPrint has submitted proposals to Cardano's Project Catalyst Fund 15. These proposals need community support and votes. We are grateful for every supporter and want to make sure that our community has easy overview and insights on our proposals."
            />

            <SearchFilterBar
                config={filterConfig}
                onSearch={handleSearch}
                initialSearchTerm={router.query.search as string}
            />

            {/* Fund 15 Proposals Needing Support - Highlighted Section */}
            {FUND_15_PROPOSALS.length > 0 && (
                <div className={styles.fund15Section}>
                    <div className={styles.fund15Header}>
                        <h2 className={styles.fund15Title}>Fund 15 Proposals - Need Your Support</h2>
                        <p className={styles.fund15Subtitle}>
                            These proposals are currently pending vote in Fund 15. Your support and votes are crucial for these projects to receive funding.
                        </p>
                    </div>
                    <div className={styles.fund15Grid}>
                        {FUND_15_PROPOSALS.map((project) => {
                            const formatAda = (amount: number): string => {
                                return `₳ ${formatNumber(amount)}`;
                            };
                            return (
                                <div key={project.projectDetails.id} className={styles.fund15Card}>
                                    <div className={styles.fund15CardHeader}>
                                        <span className={styles.fund15Status}>Pending Vote</span>
                                        <h3 className={styles.fund15CardTitle}>{project.projectDetails.title}</h3>
                                    </div>
                                    <div className={styles.fund15CardContent}>
                                        <div className={styles.fund15InfoRow}>
                                            <span className={styles.fund15Label}>Budget Requested:</span>
                                            <span className={styles.fund15Value}>{formatAda(project.projectDetails.budget)}</span>
                                        </div>
                                        <div className={styles.fund15InfoRow}>
                                            <span className={styles.fund15Label}>Milestones:</span>
                                            <span className={styles.fund15Value}>{project.projectDetails.milestones_qty}</span>
                                        </div>
                                        <div className={styles.fund15InfoRow}>
                                            <span className={styles.fund15Label}>Status:</span>
                                            <span className={styles.fund15Value}>Needs Community Support</span>
                                        </div>
                                        <p className={styles.fund15Description}>
                                            {project.projectDetails.title.includes('Treasury') 
                                                ? 'Build a dedicated Cardano Treasury Explorer that consolidates treasury activity into a single platform for visibility of fund flows, spending trends, and treasury sustainability.'
                                                : 'Build a unified, web-based IDE comprising all Cardano on-chain and off-chain libraries with ready-to-use templates, full-stack scaffolding, integrated testing, and simplified deployment.'}
                                        </p>
                                    </div>
                                    <div className={styles.fund15CardActions}>
                                        <a
                                            href={project.projectDetails.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.fund15Button}
                                        >
                                            View Proposal & Vote
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Milestone Overview - Moved below Fund 15 proposals */}
            <div className={styles.milestoneOverview}>
                <h3 className={styles.milestoneOverviewTitle}>Project Milestones Progress</h3>
                <div className={styles.milestoneGrid}>
                    {(isSearching ? filteredProjects : allProjects).map((project) => {
                        const progressPercent = calculateProgress(project.milestonesCompleted, project.projectDetails.milestones_qty);
                        return (
                            <a
                                key={project.projectDetails.id}
                                className={styles.milestoneRow}
                                onClick={() => router.push(`/catalyst-proposals/${project.projectDetails.project_id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles.milestoneInfo}>
                                    <div className={styles.milestoneTitle}>
                                        <span className={styles.fundTag}>{getFundingRound(project.projectDetails.category)}</span>
                                        <span className={styles.projectTitle}>{project.projectDetails.title}</span>
                                    </div>
                                    <div className={styles.milestoneCount}>
                                        {project.milestonesCompleted ?? 0}/{project.projectDetails.milestones_qty}
                                    </div>
                                </div>
                                <div className={styles.milestoneProgressBar}>
                                    <div
                                        className={styles.milestoneProgressFill}
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
                            </a>
                        );
                    })}
                </div>
            </div>

            {isSearching && (
                <div className={styles.searchResults}>
                    <h2>Search Results ({filteredProjects.length} projects found)</h2>
                </div>
            )}

            {/* Proposal Cards List - Moved above charts */}
            <CatalystProposalsList data={displayData} showMilestoneOverview={false} />

            {/* Pie Charts - Moved below proposals */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartSection}>
                    <CatalystMilestonesDonut
                        totalMilestones={milestoneStats.totalMilestones}
                        completedMilestones={milestoneStats.completedMilestones}
                    />
                </div>
                <div className={styles.chartSection}>
                    <CatalystBudgetDonut
                        totalBudget={budgetStats.totalBudget}
                        distributedBudget={budgetStats.distributedBudget}
                    />
                </div>
                <div className={styles.chartSection}>
                    <VotesDonutChart proposals={allProjects} />
                </div>
            </div>
        </div>
    );
} 