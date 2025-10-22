import styles from './StakePoolMetricsSection.module.css';

interface StakePoolMetricsSectionProps {
    liveStake: string | null;
    liveDelegators: number;
    blockCount: number | null;
    liveSaturation: number | null;
    votingPower: string | null;
    margin?: number | null;
    fixedCost?: string | null;
    livePledge?: string | null;
    deposit?: string | null;
}

export default function StakePoolMetricsSection({
    liveStake,
    liveDelegators,
    blockCount,
    liveSaturation,
    votingPower,
    margin,
    fixedCost,
    livePledge,
    deposit
}: StakePoolMetricsSectionProps) {
    const formatAda = (amount: string | null) => {
        if (!amount) return 'N/A';
        const adaAmount = parseFloat(amount) / 1_000_000; // Convert lovelace to ADA
        if (adaAmount >= 1_000_000) {
            return `${(adaAmount / 1_000_000).toFixed(1)}M`;
        } else if (adaAmount >= 1_000) {
            return `${(adaAmount / 1_000).toFixed(1)}K`;
        }
        return adaAmount.toLocaleString();
    };

    const formatPercentage = (value: number | null) => {
        if (value === null) return 'N/A';
        return `${value.toFixed(2)}%`;
    };

    return (
        <div className={styles.metricsSection}>
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>₳{formatAda(liveStake)}</div>
                    <div className={styles.metricLabel}>Live Stake</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>{liveDelegators.toLocaleString()}</div>
                    <div className={styles.metricLabel}>Live Delegators</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>{blockCount?.toLocaleString() || 'N/A'}</div>
                    <div className={styles.metricLabel}>Block Count</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>{formatPercentage(liveSaturation)}</div>
                    <div className={styles.metricLabel}>Live Saturation</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>₳{formatAda(votingPower)}</div>
                    <div className={styles.metricLabel}>Voting Power</div>
                </div>
            </div>

            <div className={styles.poolParameters}>
                <h3 className={styles.parametersTitle}>Pool Parameters</h3>
                <div className={styles.parametersGrid}>
                    <div className={styles.parameter}>
                        <span className={styles.parameterLabel}>Margin</span>
                        <span className={styles.parameterValue}>
                            {margin ? `${(margin * 100).toFixed(2)}%` : 'N/A'}
                        </span>
                    </div>
                    <div className={styles.parameter}>
                        <span className={styles.parameterLabel}>Fixed Cost</span>
                        <span className={styles.parameterValue}>
                            {fixedCost ? `₳${(parseFloat(fixedCost) / 1_000_000).toFixed(0)}` : 'N/A'}
                        </span>
                    </div>
                    <div className={styles.parameter}>
                        <span className={styles.parameterLabel}>Pledge</span>
                        <span className={styles.parameterValue}>
                            {livePledge ? `₳${(parseFloat(livePledge) / 1_000_000).toFixed(0)}` : 'N/A'}
                        </span>
                    </div>
                    <div className={styles.parameter}>
                        <span className={styles.parameterLabel}>Deposit</span>
                        <span className={styles.parameterValue}>
                            {deposit ? `₳${(parseFloat(deposit) / 1_000_000).toFixed(0)}` : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
} 