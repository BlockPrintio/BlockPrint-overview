import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { drepId } = req.query;

    try {
        const response = await fetch(`https://gov.meshjs.dev/api/drep/votes?drepId=${drepId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error proxying DRep votes:', error);
        res.status(500).json({ message: 'Failed to fetch DRep votes' });
    }
}
