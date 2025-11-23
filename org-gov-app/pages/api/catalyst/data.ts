import { NextApiRequest, NextApiResponse } from 'next';
import config from '../../../config';
import fs from 'fs';
import path from 'path';

// Get configuration values
const ORGANIZATION_NAME = config.mainOrganization.name;
const GOVERNANCE_REPO = config.repositories.governance;
const BASE_URL = `https://raw.githubusercontent.com/${ORGANIZATION_NAME}/${GOVERNANCE_REPO}/main/org-gov-updates`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        let data;
        
        // Try to read local file first (for development)
        const localFilePath = path.join(process.cwd(), '..', '..', 'org-gov-updates', 'catalyst-proposals', 'catalyst-data.json');
        
        if (fs.existsSync(localFilePath)) {
            console.log('Reading catalyst data from local file:', localFilePath);
            const localData = fs.readFileSync(localFilePath, 'utf-8');
            
            // Check if file is empty
            if (!localData || localData.trim().length === 0) {
                console.warn('Catalyst data file is empty, returning empty structure');
                data = { timestamp: new Date().toISOString(), projects: [] };
            } else {
                try {
                    data = JSON.parse(localData);
                } catch (parseError) {
                    console.error('Error parsing catalyst data JSON:', parseError);
                    data = { timestamp: new Date().toISOString(), projects: [] };
                }
            }
        } else {
            // Fallback to GitHub for production
            console.log('Reading catalyst data from GitHub:', `${BASE_URL}/catalyst-proposals/catalyst-data.json`);
            try {
                const response = await fetch(`${BASE_URL}/catalyst-proposals/catalyst-data.json`);
                
                if (!response.ok) {
                    console.error('Failed to fetch catalyst data from GitHub:', response.status, response.statusText);
                    data = { timestamp: new Date().toISOString(), projects: [] };
                } else {
                    const responseData = await response.text();
                    if (!responseData || responseData.trim().length === 0) {
                        data = { timestamp: new Date().toISOString(), projects: [] };
                    } else {
                        data = JSON.parse(responseData);
                    }
                }
            } catch (fetchError) {
                console.error('Error fetching catalyst data from GitHub:', fetchError);
                data = { timestamp: new Date().toISOString(), projects: [] };
            }
        }
        
        // Ensure data has the correct structure
        if (!data || typeof data !== 'object') {
            data = { timestamp: new Date().toISOString(), projects: [] };
        }
        
        if (!data.projects || !Array.isArray(data.projects)) {
            data.projects = [];
        }
        
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching catalyst data:', error);
        // Return empty structure instead of error
        return res.status(200).json({ 
            timestamp: new Date().toISOString(), 
            projects: [] 
        });
    }
}

