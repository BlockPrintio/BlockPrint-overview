import { CatalystProject } from '../types';

/**
 * The Fund 15 submissions, as filed.
 *
 * These lived as three separate copy-pasted literals — in the proposals page,
 * in /api/catalyst/proposal/[id], and in /api/proposals/[id]/full-content —
 * which is how a budget figure ends up correct in one place and stale in
 * another. Every surface that states a Fund 15 number now reads it from here.
 *
 * The zeros are real. Nothing is distributed and no milestone is delivered
 * because the proposals have not been voted on yet, and a governance record
 * that rounds that up is worth nothing.
 */
export const FUND_15_PROPOSALS: CatalystProject[] = [
    {
        projectDetails: {
            id: 1,
            title: 'BlockPrint | Gimbalabs build a cardano Treasury explorer',
            budget: 150000,
            milestones_qty: 5,
            funds_distributed: 0,
            project_id: '1500001',
            name: 'BlockPrint',
            category: 'Fund 15 - Cardano Use Cases: Prototype & Launch',
            url: 'https://projectcatalyst.io/funds/15/cardano-use-cases-prototype-and-launch/blockprint-or-gimbalabs-build-a-cardano-treasury-explorer',
            status: 'In Progress',
            finished: '',
            milestones_content: null,
            voting: {
                proposalId: 0,
                yes_votes_count: 0,
                no_votes_count: null,
                abstain_votes_count: null,
                unique_wallets: 0
            }
        },
        milestonesCompleted: 0
    },
    {
        projectDetails: {
            id: 2,
            title: 'CS-Code: Web-IDE scaffolder for onchain and offchain code',
            budget: 80000,
            milestones_qty: 5,
            funds_distributed: 0,
            project_id: '1500002',
            name: 'BlockPrint',
            category: 'Fund 15 - Cardano Use Cases: Prototype & Launch',
            url: 'https://projectcatalyst.io/funds/15/cardano-use-cases-prototype-and-launch/cs-code-web-ide-scaffolder-for-onchain-and-offchain-code',
            status: 'In Progress',
            finished: '',
            milestones_content: null,
            voting: {
                proposalId: 0,
                yes_votes_count: 0,
                no_votes_count: null,
                abstain_votes_count: null,
                unique_wallets: 0
            }
        },
        milestonesCompleted: 0
    }
];

/** One-line summaries, keyed by project ID rather than matched on title text. */
export const FUND_15_SUMMARIES: Record<string, string> = {
    '1500001': 'A Cardano treasury explorer that consolidates fund flows, spending trends and sustainability into one place.',
    '1500002': 'A web IDE bundling Cardano on-chain and off-chain libraries with templates, scaffolding, testing and deployment.'
};

const requested = FUND_15_PROPOSALS.reduce((sum, p) => sum + p.projectDetails.budget, 0);
const distributed = FUND_15_PROPOSALS.reduce((sum, p) => sum + p.projectDetails.funds_distributed, 0);
const milestones = FUND_15_PROPOSALS.reduce((sum, p) => sum + p.projectDetails.milestones_qty, 0);
const milestonesDelivered = FUND_15_PROPOSALS.reduce((sum, p) => sum + p.milestonesCompleted, 0);

export const FUND_15_TOTALS = {
    count: FUND_15_PROPOSALS.length,
    requested,
    distributed,
    milestones,
    milestonesDelivered,
    /* The counterpart figures. The deployed site shows these as two donuts —
       remaining milestones, remaining funds, and both percentages. Derived
       here so the register and the overview cannot state different halves of
       the same sum. */
    milestonesRemaining: milestones - milestonesDelivered,
    remaining: requested - distributed,
    percentComplete: milestones === 0 ? 0 : Math.round((milestonesDelivered / milestones) * 100),
    percentDistributed: requested === 0 ? 0 : Math.round((distributed / requested) * 100),
    /* Votes, per the filing. Zero on both because neither proposal has been
       voted on yet. */
    yesVotes: FUND_15_PROPOSALS.reduce((sum, p) => sum + (p.projectDetails.voting?.yes_votes_count ?? 0), 0),
    uniqueVoters: FUND_15_PROPOSALS.reduce((sum, p) => sum + (p.projectDetails.voting?.unique_wallets ?? 0), 0)
};

/** ₳ with grouped thousands. Intl, not string concatenation. */
export const formatAda = (amount: number): string =>
    `₳${new Intl.NumberFormat('en-US').format(amount)}`;

export const formatCount = (n: number): string =>
    new Intl.NumberFormat('en-US').format(n);
