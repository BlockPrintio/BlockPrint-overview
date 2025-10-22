import DRepVotingList from '../components/DRepVotingList';
import { useData } from '../contexts/DataContext';
import styles from '../styles/Voting.module.css';
import PageHeader from '../components/PageHeader';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import VotingDonutChart from '../components/VotingDonutChart';
import DelegationGrowthChart from '../components/DelegationGrowthChart';
import VotingTypeDonut from '../components/VotingTypeDonut';
import VotingParticipationDonut from '../components/VotingParticipationDonut';
import DRepMetricsSection from '../components/DRepMetricsSection';
import { CopyIcon } from '../components/Icons';
import config from '../config';

export default function DRepVoting() {
    const { drepVotingData, isLoading, error } = useData();
    const router = useRouter();
    const [lastNavigationTime, setLastNavigationTime] = useState(0);
    const [copied, setCopied] = useState(false);

    const votes = drepVotingData?.votes || [];

    // Calculate metrics for the overview section
    const drepMetrics = useMemo(() => {
        const delegationData = drepVotingData?.delegationData?.timeline;
        const drepInfo = drepVotingData?.delegationData?.drepInfo;
        const totalDelegators = delegationData?.total_delegators || 0;
        const totalAdaDelegated = delegationData?.total_amount_ada || 0;
        const totalVotedProposals = votes.length;
        const totalDrepProposals = drepInfo?.total_drep_proposals || 0;

        // Calculate actual voting participation rate based on total available proposals
        const votingParticipationRate = totalDrepProposals > 0
            ? Math.round((totalVotedProposals / totalDrepProposals) * 100)
            : 0;

        return {
            totalDelegators,
            totalAdaDelegated,
            totalVotedProposals,
            votingParticipationRate,
            totalDrepProposals
        };
    }, [drepVotingData, votes.length]);

    // Process delegation data for the growth chart
    const delegationTimelineData = useMemo(() => {
        // console.log('Raw delegation data:', drepVotingData?.delegationData?.timeline);

        if (!drepVotingData?.delegationData?.timeline?.epochs) {
            // console.log('No epochs data found');
            return [];
        }

        const currentEpoch = drepVotingData?.delegationData?.timeline?.current_epoch;
        if (!currentEpoch) {
            // console.log('No current epoch found');
            return [];
        }

        // console.log('Current epoch:', currentEpoch);
        // console.log('Available epochs:', Object.keys(drepVotingData.delegationData.timeline.epochs));

        const EPOCH_LENGTH_DAYS = 5;
        const MS_PER_DAY = 24 * 60 * 60 * 1000;

        try {
            // Convert the timeline data into the format needed for the chart
            const timelineData = Object.entries(drepVotingData.delegationData.timeline.epochs)
                .map(([epochStr, data]) => {
                    // console.log(`Processing epoch ${epochStr}:`, {
                    //     rawVotingPower: data.voting_power_lovelace,
                    //     rawDelegators: data.total_delegators,
                    //     votingPowerInAda: parseFloat(data.voting_power_lovelace) / 1_000_000
                    // });

                    const epochNumber = parseInt(epochStr);
                    if (isNaN(epochNumber)) {
                        // console.log(`Invalid epoch number: ${epochStr}`);
                        return null;
                    }

                    // Calculate date based on epoch difference
                    const epochDiff = currentEpoch - epochNumber;
                    const date = new Date(Date.now() - (epochDiff * EPOCH_LENGTH_DAYS * MS_PER_DAY));

                    // Parse voting power with error handling
                    let totalAdaDelegated = 0;
                    try {
                        totalAdaDelegated = parseFloat(data.voting_power_lovelace) / 1_000_000; // Convert lovelace to ADA
                    } catch (e) {
                        console.error(`Error parsing voting power for epoch ${epochStr}:`, e);
                    }

                    const result = {
                        date,
                        totalAdaDelegated,
                        totalDelegators: data.total_delegators || 0
                    };
                    // console.log(`Processed data point for epoch ${epochStr}:`, result);
                    return result;
                })
                .filter((item): item is NonNullable<typeof item> => item !== null)
                .sort((a, b) => a.date.getTime() - b.date.getTime());

            // console.log('Final timeline data (sorted by date):', timelineData.map(d => ({
            //     date: d.date.toISOString(),
            //     totalAdaDelegated: d.totalAdaDelegated.toLocaleString(),
            //     totalDelegators: d.totalDelegators
            // })));
            return timelineData;
        } catch (error) {
            console.error('Error processing delegation timeline data:', error);
            return [];
        }
    }, [drepVotingData?.delegationData]);

    // Stats calculated from the complete dataset
    const voteStats = useMemo(() => ({
        total: votes.length,
        yes: votes.filter(v => v.vote === 'Yes').length,
        no: votes.filter(v => v.vote === 'No').length,
        abstain: votes.filter(v => v.vote === 'Abstain').length,
    }), [votes]);

    const typeStats = useMemo(() => votes.reduce((acc, vote) => {
        acc[vote.proposalType] = (acc[vote.proposalType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>), [votes]);

    // Handle row click
    const handleRowClick = (proposalId: string) => {
        const now = Date.now();
        if (now - lastNavigationTime < 1000) return;

        router.push(`/drep-voting/${proposalId}`);
        setLastNavigationTime(now);
    };

    const handleCopyDrepId = () => {
        navigator.clipboard.writeText(config.drepId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading voting data...</div>
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

    return (
        <div className={styles.container}>
            <PageHeader
                title={`${config.mainOrganization.displayName} DRep Dashboard`}
                subtitle={`Overview and Insights on ${config.mainOrganization.displayName} DRep voting activities at Cardano onchain Governance`}
            />

            <DRepMetricsSection
                totalDelegators={drepMetrics.totalDelegators}
                totalAdaDelegated={drepMetrics.totalAdaDelegated}
                totalVotedProposals={drepMetrics.totalVotedProposals}
                votingParticipationRate={drepMetrics.votingParticipationRate}
            />

            <div className={styles.bioSection}>
                <h2 className={styles.bioTitle}>{config.mainOrganization.displayName} DRep Motivation</h2>
                <p className={styles.bioContent}>
                    {drepVotingData?.delegationData?.metadata?.motivations ||
                        'No motivations data available from blockchain'}
                </p>
                <div className={styles.drepId} onClick={handleCopyDrepId}>
                    <span className={styles.drepIdIndicator}></span>
                    <span className={styles.drepIdText}>
                        <span className={styles.drepIdFull}>{config.drepId}</span>
                        <span className={styles.drepIdShort}>{config.drepId.substring(0, 12)}...{config.drepId.substring(config.drepId.length - 8)}</span>
                    </span>
                    {copied ?
                        <span className={`${styles.copyIcon} ${styles.copied}`}>✓</span> :
                        <CopyIcon className={styles.copyIcon} />
                    }
                </div>
            </div>

            <div className={styles.infoCardsSection}>
                <div className={styles.infoCard}>
                    <h3 className={styles.infoCardTitle}>Objectives</h3>
                    <p className={styles.infoCardContent}>
                        {drepVotingData?.delegationData?.metadata?.objectives ||
                            'No objectives data available from blockchain'}
                    </p>
                </div>
                <div className={styles.infoCard}>
                    <h3 className={styles.infoCardTitle}>Qualification</h3>
                    <p className={styles.infoCardContent}>
                        {drepVotingData?.delegationData?.metadata?.qualifications ||
                            'No qualifications data available from blockchain'}
                    </p>
                </div>
            </div>

            {delegationTimelineData.length > 0 && (
                <DelegationGrowthChart data={delegationTimelineData} />
            )}

            <div className={styles.votingProgress}>
                <h2 className={styles.sectionTitle}>{config.mainOrganization.displayName} DRep votes and rationales</h2>
                <div className={styles.chartsGrid}>
                    <div className={styles.donutChartWrapper}>
                        <VotingDonutChart voteStats={voteStats} />
                    </div>
                    <div className={styles.donutChartWrapper}>
                        <VotingTypeDonut typeStats={typeStats} />
                    </div>
                    <div className={styles.donutChartWrapper}>
                        <VotingParticipationDonut totalProposals={drepMetrics.totalDrepProposals} votedProposals={votes.length} />
                    </div>
                </div>
            </div>

            <DRepVotingList votes={votes} onRowClick={handleRowClick} />
        </div>
    );
} 