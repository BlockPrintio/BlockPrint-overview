import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { guildId } = req.query;

    if (!guildId || typeof guildId !== 'string') {
        return res.status(400).json({ message: 'Invalid guild ID' });
    }

    try {
        const response = await fetch(`https://gov.meshjs.dev/api/discord/stats/${guildId}`, {
            headers: {
                'User-Agent': 'dashboard-template/1.0',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error proxying Discord stats:', error);
        res.status(500).json({ message: 'Failed to fetch Discord stats' });
    }
}
