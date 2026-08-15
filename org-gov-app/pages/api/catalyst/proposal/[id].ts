import type { NextApiRequest, NextApiResponse } from 'next';
import { CatalystProposal, CatalystProject } from '../../../../types';
import config from '../../../../config';
import { FUND_15_PROPOSALS } from '../../../../data/fund15';
import fs from 'fs';
import path from 'path';

// Convert CatalystProject to CatalystProposal format
function projectToProposal(project: CatalystProject): CatalystProposal {
    return {
        id: project.projectDetails.id,
        title: project.projectDetails.title,
        budget: project.projectDetails.budget,
        milestones_qty: project.projectDetails.milestones_qty,
        funds_distributed: project.projectDetails.funds_distributed,
        project_id: project.projectDetails.project_id,
        challenges: null,
        name: project.projectDetails.name,
        category: project.projectDetails.category,
        category_slug: null,
        fund_number: null,
        url: project.projectDetails.url,
        status: project.projectDetails.status,
        finished: project.projectDetails.finished,
        voting: {
            proposalId: project.projectDetails.voting.proposalId,
            yes_votes_count: project.projectDetails.voting.yes_votes_count,
            no_votes_count: project.projectDetails.voting.no_votes_count,
            abstain_votes_count: project.projectDetails.voting.abstain_votes_count,
            unique_wallets: project.projectDetails.voting.unique_wallets
        },
        milestones_completed: project.milestonesCompleted,
        milestones_content: project.projectDetails.milestones_content,
        updated_at: new Date().toISOString()
    };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Invalid proposal ID' });
    }

    // Convert to string if it's a number
    const projectId = typeof id === 'string' ? id : String(id);
    
    console.log(`[API] Looking for proposal with project_id: ${projectId} (type: ${typeof projectId})`);

    try {
        // First, check Fund 15 proposals (static data)
        console.log(`[API] Checking Fund 15 proposals: ${FUND_15_PROPOSALS.map(p => p.projectDetails.project_id).join(', ')}`);
        const fund15Proposal = FUND_15_PROPOSALS.find(
            (p) => p.projectDetails.project_id === projectId
        );
        
        if (fund15Proposal) {
            console.log(`[API] Found Fund 15 proposal: ${fund15Proposal.projectDetails.title}`);
            return res.status(200).json(projectToProposal(fund15Proposal));
        }

        // Try to fetch from local data source (same logic as /api/catalyst/data)
        let localData: { projects?: CatalystProject[] } | null = null;
        try {
            const ORGANIZATION_NAME = config.mainOrganization.name;
            const GOVERNANCE_REPO = config.repositories.governance;
            const BASE_URL = `https://raw.githubusercontent.com/${ORGANIZATION_NAME}/${GOVERNANCE_REPO}/main/org-gov-updates`;
            
            const localFilePath = path.join(process.cwd(), '..', '..', 'org-gov-updates', 'catalyst-proposals', 'catalyst-data.json');
            
            if (fs.existsSync(localFilePath)) {
                const localDataContent = fs.readFileSync(localFilePath, 'utf-8');
                if (localDataContent && localDataContent.trim().length > 0) {
                    localData = JSON.parse(localDataContent);
                }
            } else {
                // Try GitHub
                const githubResponse = await fetch(`${BASE_URL}/catalyst-proposals/catalyst-data.json`);
                if (githubResponse.ok) {
                    const githubData = await githubResponse.text();
                    if (githubData && githubData.trim().length > 0) {
                        localData = JSON.parse(githubData);
                    }
                }
            }
            
            if (localData && localData.projects) {
                console.log(`[API] Checking local data: ${localData.projects.length} projects`);
                const localProject = localData.projects.find(
                    (p: CatalystProject) => p.projectDetails.project_id === projectId
                );
                
                if (localProject) {
                    console.log(`[API] Found local project: ${localProject.projectDetails.title}`);
                    return res.status(200).json(projectToProposal(localProject));
                }
            }
        } catch (localError) {
            console.log('Could not fetch from local data source:', localError);
        }

        // Finally, try to fetch from external API
        const response = await fetch(`https://gov.meshjs.dev/api/catalyst/proposals?projectIds=${projectId}`, {
            headers: {
                'User-Agent': 'dashboard-template/1.0',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Find the proposal with matching project_id
        const proposal = data.proposals?.find((p: CatalystProposal) => p.project_id === projectId);
        
        if (!proposal) {
            console.log(`[API] Proposal not found. Searched in: Fund15=${FUND_15_PROPOSALS.length}, Local=${localData?.projects?.length || 0}, External=${data.proposals?.length || 0}`);
            return res.status(404).json({ 
                message: `Proposal not found for project ID: ${projectId}`,
                searchedIn: {
                    fund15: FUND_15_PROPOSALS.length,
                    localData: localData?.projects?.length || 0,
                    externalApi: data.proposals?.length || 0
                }
            });
        }
        
        console.log(`[API] Found external proposal: ${proposal.title}`);

        res.status(200).json(proposal);
    } catch (error) {
        console.error('Error fetching Catalyst proposal:', error);
        res.status(500).json({ message: 'Failed to fetch Catalyst proposal' });
    }
}
