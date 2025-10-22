import React from 'react';
import styles from './StakePoolVotingCard.module.css';
import { PoolVote } from '../types';

interface StakePoolVotingCardProps {
    votes: PoolVote[];
}

export default function StakePoolVotingCard({ votes }: StakePoolVotingCardProps) {
    // Calculate voting statistics
    const voteStats = {
        total: votes.length,
        yes: votes.filter(v => v.vote === 'Yes').length,
        no: votes.filter(v => v.vote === 'No').length,
        abstain: votes.filter(v => v.vote === 'Abstain').length,
    };

    const typeStats = votes.reduce((acc, vote) => {
        acc[vote.proposalType] = (acc[vote.proposalType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const formatPercentage = (value: number, total: number) => {
        if (total === 0) return '0%';
        return `${((value / total) * 100).toFixed(1)}%`;
    };

    const getVoteColor = (vote: 'Yes' | 'No' | 'Abstain') => {
        switch (vote) {
            case 'Yes':
                return 'rgba(var(--status-success-rgb), 1)';
            case 'No':
                return 'rgba(var(--status-error-rgb), 1)';
            case 'Abstain':
                return 'rgba(var(--status-warning-rgb), 1)';
            default:
                return 'rgba(255, 255, 255, 0.7)';
        }
    };

    return (
        <div className={styles.votingCard}>
            <h3 className={styles.cardTitle}>Pool Voting Statistics</h3>

            <div className={styles.voteStats}>
                <div className={styles.voteStat}>
                    <div className={styles.voteStatValue} style={{ color: getVoteColor('Yes') }}>
                        {voteStats.yes}
                    </div>
                    <div className={styles.voteStatLabel}>Yes Votes</div>
                    <div className={styles.voteStatPercent}>
                        {formatPercentage(voteStats.yes, voteStats.total)}
                    </div>
                </div>

                <div className={styles.voteStat}>
                    <div className={styles.voteStatValue} style={{ color: getVoteColor('No') }}>
                        {voteStats.no}
                    </div>
                    <div className={styles.voteStatLabel}>No Votes</div>
                    <div className={styles.voteStatPercent}>
                        {formatPercentage(voteStats.no, voteStats.total)}
                    </div>
                </div>

                <div className={styles.voteStat}>
                    <div className={styles.voteStatValue} style={{ color: getVoteColor('Abstain') }}>
                        {voteStats.abstain}
                    </div>
                    <div className={styles.voteStatLabel}>Abstain</div>
                    <div className={styles.voteStatPercent}>
                        {formatPercentage(voteStats.abstain, voteStats.total)}
                    </div>
                </div>
            </div>

            <div className={styles.proposalTypes}>
                <h4 className={styles.typesTitle}>Proposal Types Voted</h4>
                <div className={styles.typesList}>
                    {Object.entries(typeStats).map(([type, count]) => (
                        <div key={type} className={styles.typeItem}>
                            <span className={styles.typeName}>{type}</span>
                            <span className={styles.typeCount}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.totalVotes}>
                <div className={styles.totalLabel}>Total Votes Cast</div>
                <div className={styles.totalValue}>{voteStats.total}</div>
            </div>
        </div>
    );
} 