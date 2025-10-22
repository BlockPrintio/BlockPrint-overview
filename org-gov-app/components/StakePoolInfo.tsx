import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import styles from '../styles/StakePool.module.css';
import StakePoolMetricsSection from './StakePoolMetricsSection';
import StakePoolGrowthChart from './StakePoolGrowthChart';
import StakePoolVotingCard from './StakePoolVotingCard';
import StakePoolVotingList from './StakePoolVotingList';
import { PoolVote } from '../types';
import { CopyIcon } from './Icons';

const StakePoolInfo: React.FC = () => {
    const { stakePoolData, isLoading, error } = useData();
    const [copied, setCopied] = useState(false);

    // Process pool history data for the growth chart
    const growthChartData = useMemo(() => {
        if (!stakePoolData?.poolHistory) return [];

        const EPOCH_LENGTH_DAYS = 5;
        const GENESIS_TIMESTAMP = 1506203091; // Cardano genesis timestamp

        try {
            const allHistoryRecords: Array<{
                date: Date;
                liveStake: number;
                delegators: number;
            }> = [];

            Object.entries(stakePoolData.poolHistory).forEach(([, historyData]) => {
                historyData.history.forEach(record => {
                    if (record.epoch_no) {
                        // Calculate date from epoch
                        const epochStartTime = GENESIS_TIMESTAMP + (record.epoch_no * EPOCH_LENGTH_DAYS * 24 * 60 * 60);
                        const date = new Date(epochStartTime * 1000);

                        // Parse stake values
                        let liveStake = 0;
                        let delegators = 0;

                        try {
                            liveStake = record.active_stake ? parseFloat(record.active_stake) / 1_000_000 : 0; // Using active_stake as proxy for live_stake
                            delegators = record.delegator_cnt || 0;
                        } catch (e) {
                            console.error(`Error parsing stake values for epoch ${record.epoch_no}:`, e);
                        }

                        allHistoryRecords.push({
                            date,
                            liveStake,
                            delegators
                        });
                    }
                });
            });

            // Sort by date and return
            return allHistoryRecords
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(-50); // Take last 50 records to avoid overwhelming the chart
        } catch (error) {
            console.error('Error processing pool history data:', error);
            return [];
        }
    }, [stakePoolData?.poolHistory]);

    // Get all votes from all years
    const allVotes = useMemo(() => {
        if (!stakePoolData?.poolVotes) return [];

        const votes: PoolVote[] = [];
        Object.values(stakePoolData.poolVotes).forEach(votesData => {
            votes.push(...votesData.votes);
        });
        return votes;
    }, [stakePoolData?.poolVotes]);

    const handleCopyPoolId = () => {
        if (poolInfo?.pool_id_bech32) {
            navigator.clipboard.writeText(poolInfo.pool_id_bech32);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading stake pool data...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    if (!stakePoolData || !stakePoolData.poolInfo) {
        return <div className={styles.error}>No stake pool data available</div>;
    }

    const { poolInfo } = stakePoolData.poolInfo;

    return (
        <div className={styles.stakePoolInfo}>
            <div className={styles.poolHeader}>
                <h2 className={styles.poolTitle}>
                    {poolInfo?.meta_json?.name || 'Stake Pool'}
                    <span className={styles.poolTicker}>
                        {poolInfo?.meta_json?.ticker && `(${poolInfo.meta_json.ticker})`}
                    </span>
                </h2>
                <div className={styles.poolStatus}>
                    <span className={`${styles.statusIndicator} ${styles[poolInfo?.pool_status?.toLowerCase() || 'unknown']}`}>
                        {poolInfo?.pool_status || 'Unknown'}
                    </span>
                </div>
            </div>

            <div className={styles.poolIdSection}>
                <div className={styles.poolId} onClick={handleCopyPoolId}>
                    <span className={styles.poolIdIndicator}></span>
                    <span className={styles.poolIdText}>
                        <span className={styles.poolIdLabel}>Pool ID:</span>
                        <span className={styles.poolIdFull}>{poolInfo?.pool_id_bech32}</span>
                        <span className={styles.poolIdShort}>
                            {poolInfo?.pool_id_bech32?.substring(0, 12)}...{poolInfo?.pool_id_bech32?.substring(poolInfo.pool_id_bech32.length - 8)}
                        </span>
                    </span>
                    {copied ?
                        <span className={`${styles.copyIcon} ${styles.copied}`}>✓</span> :
                        <CopyIcon className={styles.copyIcon} />
                    }
                </div>
            </div>

            <StakePoolMetricsSection
                liveStake={poolInfo?.live_stake || null}
                liveDelegators={poolInfo?.live_delegators || 0}
                blockCount={poolInfo?.block_count || null}
                liveSaturation={poolInfo?.live_saturation || null}
                votingPower={poolInfo?.voting_power || null}
                margin={poolInfo?.margin || null}
                fixedCost={poolInfo?.fixed_cost || null}
                livePledge={poolInfo?.live_pledge || null}
                deposit={poolInfo?.deposit || null}
            />

            {growthChartData.length > 0 && (
                <StakePoolGrowthChart data={growthChartData} />
            )}

            {allVotes.length > 0 && (
                <StakePoolVotingCard votes={allVotes} />
            )}

            {allVotes.length > 0 && (
                <div className={styles.votingSection}>
                    <h2 className={styles.sectionTitle}>Pool Voting History</h2>
                    <StakePoolVotingList votes={allVotes} />
                </div>
            )}
        </div>
    );
};

export default StakePoolInfo; 