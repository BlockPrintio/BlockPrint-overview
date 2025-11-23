/**
 * Fetches mesh data for use in DataContext.
 * Accepts context-specific helpers and state setters as arguments.
 */
import { BlockprintData, BlockprintPackagesApiResponse } from '../../types';
import config from '../../config';

const npmPackages = config.npmPackages;

export async function fetchBlockprintDataForContext({
    safeSetItem,
    setBlockprintData,
    setError,
    BLOCKPRINT_STORAGE_KEY,
}: {
    getCurrentYear: () => number;
    safeSetItem: (key: string, value: string) => void;
    setBlockprintData: (data: BlockprintData | null) => void;
    setError: (err: string | null) => void;
    BLOCKPRINT_STORAGE_KEY: string;
}) {
    try {

        // Fetch from new /api/packages endpoint
        let blockprintPackagesData: BlockprintPackagesApiResponse | null = null;
        try {
            const packageNames = npmPackages.map(pkg => pkg.name).join(',');
            const res = await fetch(`/api/packages?names=${encodeURIComponent(packageNames)}`);
            if (res.ok) {
                blockprintPackagesData = await res.json();
            } else {
                console.error('Failed to fetch blockprintPackagesData:', res.statusText);
            }
        } catch (error) {
            console.error('Error fetching blockprintPackagesData:', error);
        }

        if (!blockprintPackagesData) {
            throw new Error('No blockprint data available');
        }

        const newData: BlockprintData = {
            lastFetched: Date.now(),
            blockprintPackagesData,
        };

        safeSetItem(BLOCKPRINT_STORAGE_KEY, JSON.stringify(newData));
        setBlockprintData(newData);
        setError(null);
    } catch (err) {
        console.error('Error fetching blockprint data:', err);
        setError('Failed to fetch blockprint data');
        setBlockprintData(null);
    }
} 