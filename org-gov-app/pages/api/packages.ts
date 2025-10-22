import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { names } = req.query;

    try {
        const response = await fetch(`https://gov.meshjs.dev/api/packages?names=${names}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error proxying packages:', error);
        res.status(500).json({ message: 'Failed to fetch packages' });
    }
}
