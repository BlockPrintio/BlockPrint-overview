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
                    setCatalystData({ catalystData: { timestamp: new Date().toISOString(), projects: [] } });
                } else {
                    setCatalystData({ catalystData: data });
                }
            } catch (err) {
                console.error('Error fetching catalyst data:', err);
                setCatalystError('Failed to load catalyst data');
                // Set empty data structure on error so page can still render
                setCatalystData({ catalystData: { timestamp: new Date().toISOString(), projects: [] } });
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
    const allProjects = useMemo(() => data?.projects || [], [data?.projects]);

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
                    subtitle="Mesh received strong support from Ada voters at Cardano's Project Catalyst. We are greatful for every support and want to make sure that our supporters have easy overview and insights on the progress of our funded proposals"
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

    if (!data || !data.projects || data.projects.length === 0) {
        return (
            <div className={styles.container}>
                <PageHeader
                    title={<>Catalyst Proposal <span>Dashboard</span></>}
                    subtitle="Mesh received strong support from Ada voters at Cardano's Project Catalyst. We are greatful for every support and want to make sure that our supporters have easy overview and insights on the progress of our funded proposals"
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
        projects: isSearching ? filteredProjects : data.projects
    };

    return (
        <div className={styles.container}>
            <PageHeader
                title={<>Catalyst Proposal <span>Dashboard</span></>}
                subtitle="Mesh received strong support from Ada voters at Cardano's Project Catalyst. We are greatful for every support and want to make sure that our supporters have easy overview and insights on the progress of our funded proposals"
            />

            <SearchFilterBar
                config={filterConfig}
                onSearch={handleSearch}
                initialSearchTerm={router.query.search as string}
            />

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

            {isSearching && (
                <div className={styles.searchResults}>
                    <h2>Search Results ({filteredProjects.length} projects found)</h2>
                </div>
            )}

            <CatalystProposalsList data={displayData} />
        </div>
    );
} 