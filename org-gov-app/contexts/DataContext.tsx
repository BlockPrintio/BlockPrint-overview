// ../contexts/DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BlockprintData, CatalystContextData, DiscordStats, ContributorStats, DataContextType } from '../types';
import { fetchBlockprintDataForContext } from '../lib/dataContext/fetchBlockprintData';
import { fetchContributorsAllForContext } from '../lib/dataContext/fetchContributorsAll';

const DataContext = createContext<DataContextType | undefined>(undefined);

// Cache is enabled by default unless explicitly disabled via NEXT_PUBLIC_ENABLE_DEV_CACHE=false
const CACHE_DURATION = process.env.NEXT_PUBLIC_ENABLE_DEV_CACHE === 'false'
    ? 0
    : 5 * 60 * 1000;
const DEV_CACHE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_CACHE !== 'false';
const BLOCKPRINT_STORAGE_KEY = 'blockprintGovData';
const CONTRIBUTOR_STATS_STORAGE_KEY = 'contributorStats';

// Utility function to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.warn('localStorage is not available:', e);
        return false;
    }
};

// Safe localStorage getItem with fallback
const safeGetItem = (key: string): string | null => {
    if (!isLocalStorageAvailable()) return null;
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error(`Error reading ${key} from localStorage:`, e);
        return null;
    }
};

// Safe localStorage setItem
const safeSetItem = (key: string, value: string): void => {
    if (!DEV_CACHE_ENABLED) return;
    if (!isLocalStorageAvailable()) return;
    // Rough guard to avoid exceeding typical 5MB quota (UTF-16 ~2 bytes/char)
    // 4.5M chars ~ 9MB worst case; this is conservative. Skip if too large.
    const MAX_CACHE_CHARS = 4_500_000;
    if (value.length > MAX_CACHE_CHARS) {
        console.warn(`Skipping cache for ${key}: payload too large (${value.length} chars)`);
        return;
    }
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // Swallow quota errors in development to avoid crashing the app
        console.warn(`Skipping cache for ${key} due to storage error:`, e);
    }
};

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [blockprintData, setBlockprintData] = useState<BlockprintData | null>(null);
    const [contributorStats, setContributorStats] = useState<ContributorStats | null>(null);

    // Individual loading states
    const [isLoadingBlockprint, setIsLoadingBlockprint] = useState(true);
    const [isLoadingContributors, setIsLoadingContributors] = useState(false);

    // Individual error states
    const [blockprintError, setBlockprintError] = useState<string | null>(null);
    const [contributorsError, setContributorsError] = useState<string | null>(null);

    // Computed overall loading state (exclude contributors for initial load)
    const isLoading = isLoadingBlockprint || isLoadingContributors;

    // Computed overall error state
    const error = blockprintError || contributorsError;

    const getCurrentYear = () => new Date().getFullYear();

    const fetchContributorsAllWrapper = async () => {
        setIsLoadingContributors(true);
        setContributorsError(null);
        try {
            const combined = await fetchContributorsAllForContext({
                safeSetItem,
                setContributorStats,
                setError: setContributorsError,
                CONTRIBUTOR_STATS_STORAGE_KEY,
            });
            return combined;
        } finally {
            setIsLoadingContributors(false);
        }
    };

    const fetchBlockprintDataWrapper = async () => {
        setIsLoadingBlockprint(true);
        setBlockprintError(null);
        try {
            await fetchBlockprintDataForContext({
                getCurrentYear,
                safeSetItem,
                setBlockprintData,
                setError: setBlockprintError,
                BLOCKPRINT_STORAGE_KEY,
            });
        } finally {
            setIsLoadingBlockprint(false);
        }
    };

    const loadContributorStats = async () => {
        if (!contributorStats) {
            await fetchContributorsAllWrapper();
        }
    };

    useEffect(() => {
        const load = async () => {
            // Load cached data immediately for better UX
            if (isLocalStorageAvailable() && process.env.NEXT_PUBLIC_ENABLE_DEV_CACHE !== 'false') {
                const cachedBlockprintData = safeGetItem(BLOCKPRINT_STORAGE_KEY);
                const cachedContributorStats = safeGetItem(CONTRIBUTOR_STATS_STORAGE_KEY);

                // Load cached data immediately if available and fresh
                if (cachedBlockprintData) {
                    const parsed = JSON.parse(cachedBlockprintData);
                    const cacheAge = Date.now() - parsed.lastFetched;
                    if (cacheAge < CACHE_DURATION) {
                        setBlockprintData(parsed);
                        setIsLoadingBlockprint(false);
                    }
                }

                // Load cached contributor stats
                if (cachedContributorStats) {
                    const parsed = JSON.parse(cachedContributorStats);
                    const cacheAge = Date.now() - parsed.lastFetched;
                    if (cacheAge < CACHE_DURATION) {
                        setContributorStats(parsed);
                        setIsLoadingContributors(false);
                    }
                }
            }

            // Start fetching fresh data in parallel (excluding contributors for lazy loading)
            const fetchPromises = [] as Promise<any>[];

            // Always fetch blockprint data first (it's most critical)
            if (isLoadingBlockprint) {
                fetchPromises.push(fetchBlockprintDataWrapper());
            }

            // Wait for all fetches to complete
            await Promise.all(fetchPromises);
        };
        void load();
        // We intentionally run this bootstrap only once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refetchData = async () => {
        // Reset all loading states
        setIsLoadingBlockprint(true);
        setIsLoadingContributors(true);

        // Clear all errors
        setBlockprintError(null);
        setContributorsError(null);

        await Promise.all([
            fetchBlockprintDataWrapper(),
            fetchContributorsAllWrapper()
        ]);
    };

    return (
        <DataContext.Provider value={{
            blockprintData,
            contributorStats,
            isLoading,
            error,
            // Individual loading states
            isLoadingBlockprint,
            isLoadingContributors,
            // Individual error states
            blockprintError,
            contributorsError,
            refetchData,
            // Lazy loading function
            loadContributorStats
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
} 