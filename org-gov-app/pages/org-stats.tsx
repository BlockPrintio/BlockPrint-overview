import OrgStatsView from '../components/OrgStatsView';
import { useData } from '../contexts/DataContext';
import styles from '../styles/OrgStats.module.css';
import PageHeader from '../components/PageHeader';
import config from '../config';

export default function MeshStatsPage() {
    const { orgData, discordStats, contributorsData, contributorStats, isLoading, error } = useData();

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.stat}>
                    <p>Loading statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.stat}>
                    <p className={styles.error}>{error}</p>
                </div>
            </div>
        );
    }

    if (!orgData?.currentStats || !orgData?.yearlyStats || Object.keys(orgData.yearlyStats).length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.stat}>
                    <p>No statistics available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <PageHeader
                title={<>{config.mainOrganization.displayName} SDK <span>Statistics</span></>}
            />

            <OrgStatsView
                currentStats={orgData.currentStats}
                yearlyStats={orgData.yearlyStats}
                discordStats={discordStats || undefined}
                contributorsData={contributorsData?.unique_count ? contributorsData : undefined}
                contributorStats={contributorStats || undefined}
            />
        </div>
    );
} 