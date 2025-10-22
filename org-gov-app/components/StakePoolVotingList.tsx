import { useState } from 'react';
import styles from '../styles/Voting.module.css';
import ProposalModal from './ProposalModal';
import { PoolVote } from '../types';

interface StakePoolVotingListProps {
    votes: PoolVote[];
    onRowClick?: (proposalId: string) => void;
}

const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;

    // Find the last space before maxLength
    const lastSpace = text.lastIndexOf(' ', maxLength);
    if (lastSpace === -1) return text.substring(0, maxLength) + '...';

    return text.substring(0, lastSpace) + '...';
};

const getLatestVotes = (votes: PoolVote[]): PoolVote[] => {
    const voteMap = new Map<string, PoolVote>();

    votes.forEach(vote => {
        const existingVote = voteMap.get(vote.proposalId);
        if (!existingVote || new Date(vote.blockTime) > new Date(existingVote.blockTime)) {
            voteMap.set(vote.proposalId, vote);
        }
    });

    return Array.from(voteMap.values());
};

export default function StakePoolVotingList({ votes }: StakePoolVotingListProps) {
    const [selectedProposal, setSelectedProposal] = useState<PoolVote | null>(null);
    const latestVotes = getLatestVotes(votes);

    const handleCardClick = (vote: PoolVote, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProposal(vote);
    };

    return (
        <>
            <div className={styles.listContainer}>
                <div className={styles.list}>
                    {latestVotes.map((vote) => (
                        <div
                            key={vote.proposalId}
                            className={styles.item}
                            onClick={(e) => handleCardClick(vote, e)}
                        >
                            <div className={`${styles.voteHeader} ${styles[vote.vote.toLowerCase()]}`}>
                                {vote.vote}
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.title}>{vote.proposalTitle}</h3>
                                <span className={styles.type}>{vote.proposalType}</span>
                                <p className={styles.rationale}>{truncateText(vote.rationale)}</p>
                                <div className={styles.meta}>
                                    <div>
                                        <span>Proposed</span>
                                        <strong>Epoch {vote.proposedEpoch}</strong>
                                    </div>
                                    <div>
                                        <span>Expires</span>
                                        <strong>Epoch {vote.expirationEpoch}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedProposal && (
                <ProposalModal
                    proposal={selectedProposal}
                    onClose={() => setSelectedProposal(null)}
                    context="stakePool"
                />
            )}

            {votes.length === 0 && (
                <div className={styles.empty}>No votes found</div>
            )}
        </>
    );
} 