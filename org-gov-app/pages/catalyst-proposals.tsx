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

export default function CatalystProposals() {
    const router = useRouter();
    const { catalystData, isLoading, error } = useData();
    const [filteredProjects, setFilteredProjects] = useState<CatalystProject[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [filterConfig, setFilterConfig] = useState<SearchFilterConfig>({
        placeholder: "Search proposals...",
        filters: []
    });
    const shouldRestoreScroll = useRef(false);

    // Enable scroll restoration
    useScrollRestoration();

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
    const allProjects = data?.projects || [];

    // Calculate milestone stats
    const milestoneStats = useMemo(() => {
        let totalMilestones = 0;
        let completedMilestones = 0;

        allProjects.forEach(project => {
            totalMilestones += project.projectDetails.milestones_qty;
            completedMilestones += project.milestonesCompleted;
        });

        return { totalMilestones, completedMilestones };
    }, [allProjects]);

    // Calculate budget stats
    const budgetStats = useMemo(() => {
        let totalBudget = 0;
        let distributedBudget = 0;

        allProjects.forEach(project => {
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

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading catalyst data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>No catalyst data available</div>
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