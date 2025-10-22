import fs from 'fs';
import path from 'path';
import { getConfig, getRepoRoot } from '../org-stats/config-loader.js';

// Hardcoded output paths
const BASE_DIR = 'org-gov-updates';
const DREP_VOTING_DIR = 'drep-voting';

export function saveVotingJson(votes, year) {
    const config = getConfig();
    const repoRoot = getRepoRoot();
    const jsonDir = path.join(repoRoot, BASE_DIR, DREP_VOTING_DIR);
    const jsonPath = path.join(jsonDir, `${year}_voting.json`);

    // Create directory if it doesn't exist
    if (!fs.existsSync(jsonDir)) {
        fs.mkdirSync(jsonDir, { recursive: true });
    }

    // Transform votes into a more JSON-friendly format
    const jsonData = votes.map(vote => ({
        proposalId: vote.proposalId,
        proposalTxHash: vote.proposalTxHash,
        proposalIndex: vote.proposalIndex,
        voteTxHash: vote.voteTxHash,
        blockTime: vote.blockTime,
        vote: vote.vote,
        metaUrl: vote.metaUrl,
        metaHash: vote.metaHash,
        proposalTitle: vote.proposalTitle,
        proposalType: vote.proposalType,
        proposedEpoch: vote.proposedEpoch,
        expirationEpoch: vote.expirationEpoch,
        rationale: vote.rationale
    }));

    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`Saved voting JSON to ${jsonPath}`);
} 