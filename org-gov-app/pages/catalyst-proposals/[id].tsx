import { useRouter } from 'next/router';
import { useData } from '../../contexts/DataContext';
import styles from '../../styles/ProposalDetail.module.css';
import PageHeader from '../../components/PageHeader';
import { useEffect, useState } from 'react';
import { CatalystProject } from '../../types';
import Link from 'next/link';
import { ProposalDetails } from '../../components/ProposalDetails';
import { ExternalLinks } from '../../components/ExternalLinks';
import CompletedMilestones from '../../components/CompletedMilestones';
import { MilestoneData } from '../../utils/milestones';

const getFundingRound = (category: string): string => {
    const match = category.match(/Fund \d+/i);
    return match ? match[0] : category;
};

export default function ProposalDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { catalystData, isLoading, error } = useData();
    const [proposal, setProposal] = useState<CatalystProject | null>(null);
    const [milestones, setMilestones] = useState<MilestoneData[]>([]);
    const [milestonesLoading, setMilestonesLoading] = useState(false);

    useEffect(() => {
        if (catalystData?.catalystData && id) {
            const foundProposal = catalystData.catalystData.projects.find(
                p => p.projectDetails.project_id.toString() === id
            );
            setProposal(foundProposal || null);
        }
    }, [catalystData, id]);

    // Fetch milestones data
    useEffect(() => {
        if (id && typeof id === 'string') {
            setMilestonesLoading(true);
            fetch(`/api/milestones/${id}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    return [];
                })
                .then((data: MilestoneData[]) => {
                    setMilestones(data);
                })
                .catch(error => {
                    console.error('Error fetching milestones:', error);
                    setMilestones([]);
                })
                .finally(() => {
                    setMilestonesLoading(false);
                });
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading proposal data...</div>
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

    if (!proposal) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Proposal not found</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href="/catalyst-proposals" className={styles.backLink}>
                ← Back to Proposals
            </Link>

            <PageHeader
                title={<>{proposal.projectDetails.title}</>}
                subtitle={`${getFundingRound(proposal.projectDetails.category)} Proposal`}
            />

            <div className={styles.content}>
                <div className={styles.mainInfo}>
                    {proposal && (
                        <ProposalDetails 
                            details={{
                                projectId: proposal.projectDetails.project_id.toString(),
                                name: proposal.projectDetails.title,
                                link: proposal.projectDetails.url,
                                milestonesLink: `https://milestones.projectcatalyst.io/projects/${proposal.projectDetails.project_id}`,
                                fundingCategory: proposal.projectDetails.category,
                                proposalBudget: `${proposal.projectDetails.budget} ₳`,
                                status: proposal.milestonesCompleted === proposal.projectDetails.milestones_qty && proposal.projectDetails.milestones_qty > 0 
                                    ? 'Completed' 
                                    : proposal.projectDetails.status,
                                milestonesCompleted: `${proposal.milestonesCompleted}/${proposal.projectDetails.milestones_qty}`,
                                fundsDistributed: `${proposal.projectDetails.funds_distributed} of ${proposal.projectDetails.budget}`,
                                fundingProgress: ''
                            }}
                            budget={proposal.projectDetails.budget}
                            distributed={proposal.projectDetails.funds_distributed}
                            yesVotes={proposal.projectDetails.voting.yes_votes_count}
                            uniqueVoters={proposal.projectDetails.voting.unique_wallets}
                            milestonesCompleted={proposal.milestonesCompleted}
                            totalMilestones={proposal.projectDetails.milestones_qty}
                        />
                    )}

                    

                    {milestonesLoading ? (
                        <div className={styles.loading}>Loading milestones...</div>
                    ) : (
                        <CompletedMilestones milestones={milestones} />
                    )}

                    <ExternalLinks 
                        projectLink={proposal.projectDetails.url}
                        milestonesLink={`https://milestones.projectcatalyst.io/projects/${proposal.projectDetails.project_id}`}
                    />
                </div>
            </div>
        </div>
    );
} 