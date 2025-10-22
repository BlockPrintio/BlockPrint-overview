import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveVotingJson } from '../drep-voting/generate-voting-json.js';
import { getConfig } from '../org-stats/config-loader.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    generateJson: true      // Set to false to skip JSON generation
};

// Load config using the config loader
const config = getConfig();
const drepId = config.drepId;
const organizationName = config.mainOrganization.name;

// Read missing rationales file
const missingRationalesPath = path.join(__dirname, '..', '..', 'voting-history', 'missing-voting-rationales', 'rationales.json');
let missingRationales = {};
try {
    missingRationales = JSON.parse(fs.readFileSync(missingRationalesPath, 'utf8'));
} catch (error) {
    console.warn('Could not read missing rationales file:', error.message);
}

if (!drepId) {
    console.error('DRep ID not found in config');
    process.exit(1);
}

if (!organizationName) {
    console.error('Organization name not found in config');
    process.exit(1);
}

async function fetchMetadata(metaUrl) {
    try {
        // Handle IPFS URLs
        if (metaUrl.startsWith('ipfs://')) {
            const ipfsHash = metaUrl.replace('ipfs://', '');
            const response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);
            return response.data;
        }

        // Handle GitHub raw URLs
        if (metaUrl.includes('raw.githubusercontent.com')) {
            const response = await axios.get(metaUrl);
            return response.data;
        }

        // Handle regular URLs
        const response = await axios.get(metaUrl);
        return response.data;
    } catch (error) {
        console.error(`Error fetching metadata from ${metaUrl}:`, error.message);
        return null;
    }
}

async function getProposalDetails(drepId) {
    try {
        const apiKey = process.env.KOIOS_API_KEY;
        if (!apiKey) {
            throw new Error('KOIOS_API_KEY environment variable is not set');
        }

        const response = await axios.get(`https://api.koios.rest/api/v1/voter_proposal_list?_voter_id=${drepId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'accept': 'application/json'
            }
        });

        if (!Array.isArray(response.data)) {
            throw new Error('Invalid response format: expected an array');
        }

        console.log(`Found ${response.data.length} proposals in voter_proposal_list`);

        // Create a map of proposal details by proposal_id
        const proposalMap = response.data.reduce((acc, proposal) => {
            if (!proposal.proposal_id) {
                console.warn('Found proposal without proposal_id, skipping');
                return acc;
            }
            acc[proposal.proposal_id] = proposal;
            return acc;
        }, {});

        console.log(`Successfully mapped ${Object.keys(proposalMap).length} proposals`);
        return proposalMap;
    } catch (error) {
        console.error('Error fetching proposal details:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        return {};
    }
}

// Function to fetch rationale from Org Lab DRep repository
// This function searches through ga01-ga50 folders in the voting-history directory
// and parses markdown tables to find matching rationales by Action ID or Hash
async function fetchGovernanceRationale(proposalId, year = null, epoch = null) {
    try {
        const baseUrl = `https://raw.githubusercontent.com/${organizationName}/${config.repositories.governance}/refs/heads/main/voting-history`;
        console.log(`\nFetching rationale for proposal ${proposalId} from Org Lab DRep repository`);

        // Try to find the rationale by searching through ga folders
        // We'll search through a reasonable range of ga numbers (ga01 to ga50)
        for (let gaNumber = 1; gaNumber <= 50; gaNumber++) {
            const gaFolder = `ga${gaNumber.toString().padStart(2, '0')}`;
            const rationaleUrl = `${baseUrl}/${gaFolder}/${gaFolder}-rationale.md`;

            try {
                const response = await axios.get(rationaleUrl);
                if (response.data) {
                    const markdownContent = response.data;

                    // Parse the markdown table to extract information
                    const lines = markdownContent.split('\n');
                    let actionId = null;
                    let rationale = null;
                    let hash = null;

                    for (const line of lines) {
                        // Extract Action ID
                        if (line.includes('Action ID') && line.includes('gov_action')) {
                            const actionIdMatch = line.match(/gov_action[a-zA-Z0-9]+/);
                            if (actionIdMatch) {
                                actionId = actionIdMatch[0];
                            }
                        }

                        // Extract Rational - handle both spaced and non-spaced pipe characters
                        if (line.includes('Rational') && !line.includes('| Rational |')) {
                            // Try to match the rational content on the same line first
                            const rationalMatch = line.match(/\| Rational\s*\|\s*(.+?)\s*\|/);
                            if (rationalMatch) {
                                rationale = rationalMatch[1].trim();
                            } else {
                                // Try without spaces around pipe
                                const rationalMatch2 = line.match(/\|Rational\s*\|\s*(.+?)\s*\|/);
                                if (rationalMatch2) {
                                    rationale = rationalMatch2[1].trim();
                                } else {
                                    // Try pattern that doesn't require ending pipe
                                    const rationalMatch3 = line.match(/\| Rational\s*\|\s*(.+)$/);
                                    if (rationalMatch3) {
                                        rationale = rationalMatch3[1].trim();
                                    } else {
                                        const rationalMatch4 = line.match(/\|Rational\s*\|\s*(.+)$/);
                                        if (rationalMatch4) {
                                            rationale = rationalMatch4[1].trim();

                                            // Check if this is the start of multi-line content
                                            // If the line ends with a space or newline, collect subsequent lines
                                            if (line.trim().endsWith(' ') || line.trim().endsWith('')) {
                                                let multiLineRational = rationale;
                                                let lineIndex = lines.indexOf(line) + 1;
                                                while (lineIndex < lines.length) {
                                                    const nextLine = lines[lineIndex];
                                                    // Stop if we hit another table row (starts and ends with |)
                                                    if (nextLine.trim().startsWith('|') && nextLine.trim().endsWith('|') && nextLine.includes('|')) {
                                                        break;
                                                    }
                                                    // Stop if we hit an empty line followed by a table row
                                                    if (nextLine.trim() === '' && lineIndex + 1 < lines.length) {
                                                        const nextNextLine = lines[lineIndex + 1];
                                                        if (nextNextLine.trim().startsWith('|') && nextNextLine.trim().endsWith('|')) {
                                                            break;
                                                        }
                                                    }
                                                    multiLineRational += ' ' + nextLine.trim();
                                                    lineIndex++;
                                                }
                                                rationale = multiLineRational.trim();
                                            }
                                        } else {
                                            // If no content on same line, look for multi-line content
                                            const rationalMatch5 = line.match(/\| Rational\s*\|\s*$/);
                                            const rationalMatch6 = line.match(/\|Rational\s*\|\s*$/);
                                            if (rationalMatch5 || rationalMatch6) {
                                                // Start collecting multi-line content
                                                let multiLineRational = '';
                                                let lineIndex = lines.indexOf(line) + 1;
                                                while (lineIndex < lines.length) {
                                                    const nextLine = lines[lineIndex];
                                                    if (nextLine.trim().startsWith('|') && nextLine.trim().endsWith('|')) {
                                                        // End of multi-line content
                                                        break;
                                                    }
                                                    multiLineRational += nextLine + '\n';
                                                    lineIndex++;
                                                }
                                                rationale = multiLineRational.trim();
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Extract Hash for verification - handle both spaced and non-spaced pipe characters
                        if (line.includes('Hash') && !line.includes('| Hash |')) {
                            const hashMatch = line.match(/\| Hash\s*\|\s*([a-fA-F0-9]+)/);
                            if (hashMatch) {
                                hash = hashMatch[1];
                            } else {
                                // Try without spaces around pipe
                                const hashMatch2 = line.match(/\|Hash\s*\|\s*([a-fA-F0-9]+)/);
                                if (hashMatch2) {
                                    hash = hashMatch2[1];
                                }
                            }
                        }
                    }

                    // Check if this rationale matches our proposal
                    // We can match by action ID or by hash (removing the '00' suffix from proposal hash)
                    if (actionId && rationale) {
                        const proposalHashWithoutSuffix = proposalId.replace('00', '');

                        // Check if the action ID or hash matches our proposal
                        if (actionId === proposalId || (hash && hash.includes(proposalHashWithoutSuffix))) {
                            console.log(`Found matching rationale in ${gaFolder} for proposal ${proposalId}`);
                            return rationale;
                        }
                    }
                }
            } catch (error) {
                // Continue to next ga folder if this one doesn't exist or fails
                continue;
            }
        }

        console.log(`No matching rationale found for proposal ${proposalId}`);
        return null;
    } catch (error) {
        console.warn(`Could not fetch rationale from Org Lab DRep repository for proposal ${proposalId}:`, error.message);
        return null;
    }
}

async function getDRepVotes(drepId) {
    try {
        const apiKey = process.env.KOIOS_API_KEY;
        if (!apiKey) {
            throw new Error('KOIOS_API_KEY environment variable is not set');
        }

        // Fetch proposal details first
        const proposalDetails = await getProposalDetails(drepId);

        const response = await axios.get(`https://api.koios.rest/api/v1/vote_list?voter_id=eq.${encodeURIComponent(drepId)}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'accept': 'application/json'
            }
        });

        // Validate response data
        if (!Array.isArray(response.data)) {
            throw new Error('Invalid response format: expected an array');
        }

        // Group votes by year
        const votesByYear = {};

        // Process and validate each vote
        for (const vote of response.data) {
            // Validate required fields
            if (!vote.proposal_id || !vote.vote || !vote.block_time) {
                console.error('Invalid vote data: missing required fields');
                continue;
            }

            // Validate vote enum value
            const validVotes = ['Yes', 'No', 'Abstain'];
            if (!validVotes.includes(vote.vote)) {
                console.error(`Invalid vote value: ${vote.vote}. Must be one of: ${validVotes.join(', ')}`);
                continue;
            }

            const processedVote = {
                proposalId: vote.proposal_id,
                proposalTxHash: vote.proposal_tx_hash + '00',
                proposalIndex: vote.proposal_index,
                voteTxHash: vote.vote_tx_hash,
                blockTime: new Date(vote.block_time * 1000).toISOString(),
                vote: vote.vote,
                metaUrl: vote.meta_url,
                metaHash: vote.meta_hash
            };

            // Fetch metadata if metaUrl is available
            let metadata = null;
            if (processedVote.metaUrl) {
                metadata = await fetchMetadata(processedVote.metaUrl);
            }

            // Get proposal details
            const proposal = proposalDetails[vote.proposal_id] || {};

            // Try to get rationale from multiple sources in order of preference
            let rationale = null;

            // First try the missing rationales file
            if (missingRationales[vote.proposal_id]?.rationale) {
                rationale = missingRationales[vote.proposal_id].rationale;
                console.log(`Fetching rationale from missing rationales: ${rationale}`);
            }
            // Then try metadata
            else if (metadata?.body?.comment) {
                rationale = metadata.body.comment;
                console.log(`Fetching rationale from metadata: ${rationale}`);
            }
            else if (metadata?.body?.rationale) {
                rationale = metadata.body.rationale;
                console.log(`Fetching rationale from metadata: ${rationale}`);
            }
            // Finally try governance repository as last resort
            else {
                const year = new Date(processedVote.blockTime).getFullYear();
                const epoch = proposal.proposed_epoch;
                rationale = await fetchGovernanceRationale(vote.proposal_id, year, epoch);
                console.log(`Fetching rationale from Org Lab DRep repository: ${rationale}`);
            }

            // Add proposal details to vote
            let proposalTitle = proposal.meta_json?.body?.title;

            // If title not found in meta_json, try fetching from meta_url
            if (!proposalTitle && processedVote.metaUrl) {
                const metadata = await fetchMetadata(processedVote.metaUrl);
                if (metadata?.body?.title) {
                    proposalTitle = metadata.body.title;
                }
            }

            processedVote.proposalTitle = proposalTitle || missingRationales[vote.proposal_id]?.title || 'Unknown Proposal';
            processedVote.proposalType = proposal.proposal_type || 'Unknown';
            processedVote.proposedEpoch = proposal.proposed_epoch || 'N/A';
            processedVote.expirationEpoch = proposal.expiration || 'N/A';
            processedVote.rationale = rationale || 'No rationale available';

            // Get year from blockTime
            const year = new Date(processedVote.blockTime).getFullYear();

            // Add to year group
            if (!votesByYear[year]) {
                votesByYear[year] = [];
            }
            votesByYear[year].push(processedVote);
        }

        // Generate outputs for each year based on configuration
        for (const [year, votes] of Object.entries(votesByYear)) {
            if (CONFIG.generateJson) {
                saveVotingJson(votes, year);
            }
        }

        console.log('All votes processed and organized by year successfully');
    } catch (error) {
        console.error('Error fetching DRep votes:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        process.exit(1);
    }
}

getDRepVotes(drepId); 