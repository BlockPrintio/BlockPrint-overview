import StakePoolInfo from '../components/StakePoolInfo';
import { useData } from '../contexts/DataContext';
import styles from '../styles/StakePool.module.css';
import PageHeader from '../components/PageHeader';
import config from '../config';

export default function StakePoolPage() {
    const { stakePoolData, isLoading, error } = useData();

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <p>Loading stake pool data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!stakePoolData || !stakePoolData.poolInfo) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>No stake pool data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <PageHeader
                title={`${config.mainOrganization.displayName} Stake Pool`}
                subtitle={`Overview and insights on ${config.mainOrganization.displayName} stake pool performance and governance participation`}
            />

            <StakePoolInfo />
        </div>
    );
} 