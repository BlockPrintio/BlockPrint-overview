import { NextApiRequest, NextApiResponse } from 'next';
import config from '../../../config';
import fs from 'fs';
import path from 'path';

// Get configuration values
const ORGANIZATION_NAME = config.mainOrganization.name;
const GOVERNANCE_REPO = config.repositories.governance;
const BASE_URL = `https://raw.githubusercontent.com/${ORGANIZATION_NAME}/${GOVERNANCE_REPO}/main/org-gov-updates`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    try {
        let data;
        
        // Try to read local file first (for development)
        const localFilePath = path.join(process.cwd(), '..', '..', 'org-gov-updates', 'catalyst-proposals', 'milestones-data.json');
        
        if (fs.existsSync(localFilePath)) {
            console.log('Reading milestone data from local file:', localFilePath);
            const localData = fs.readFileSync(localFilePath, 'utf-8');
            data = JSON.parse(localData);
        } else {
            // Fallback to GitHub for production
            console.log('Reading milestone data from GitHub:', `${BASE_URL}/catalyst-proposals/milestones-data.json`);
            const response = await fetch(`${BASE_URL}/catalyst-proposals/milestones-data.json`);
            
            if (!response.ok) {
                console.error('Failed to fetch milestones data from GitHub:', response.status, response.statusText);
                return res.status(500).json({ message: 'Failed to fetch milestones data' });
            }
            
            data = await response.json();
        }
        
        const milestones = data.milestones[id] || [];
        console.log(`Found ${milestones.length} milestones for project ${id}`);
        
        return res.status(200).json(milestones);
    } catch (error) {
        console.error('Error fetching milestones:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 