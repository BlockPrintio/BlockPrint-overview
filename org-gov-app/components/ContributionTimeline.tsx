import { useMemo } from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './ContributionTimeline.module.css';

interface ContributionTimelineProps {
    commitTimestamps: string[];
    prTimestamps: string[];
    height?: number;
    showAxis?: boolean;
}

interface DayPoint {
    date: string;
    commits: number;
    prs: number;
    total: number;
}

const dayKey = (timestamp: string): string | null => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
};

export const ContributionTimeline: React.FC<ContributionTimelineProps> = ({
    commitTimestamps,
    prTimestamps,
    height = 60
}) => {
    const data = useMemo<DayPoint[]>(() => {
        const byDay = new Map<string, { commits: number; prs: number }>();

        // Each array is counted on its own. The previous version walked the
        // combined list and asked `commitTimestamps.includes(t)` per entry,
        // which mis-attributed any pull request that shared a timestamp with a
        // commit — and did it in O(n²).
        const add = (timestamps: string[], field: 'commits' | 'prs') => {
            timestamps.forEach((timestamp) => {
                const key = dayKey(timestamp);
                if (!key) return;
                const entry = byDay.get(key) || { commits: 0, prs: 0 };
                entry[field] += 1;
                byDay.set(key, entry);
            });
        };

        add(commitTimestamps, 'commits');
        add(prTimestamps, 'prs');

        return Array.from(byDay.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, counts]) => ({
                date,
                commits: counts.commits,
                prs: counts.prs,
                total: counts.commits + counts.prs
            }));
    }, [commitTimestamps, prTimestamps]);

    if (data.length === 0) {
        return <p className={styles.empty}>No dated activity recorded</p>;
    }

    return (
        <div className={styles.wrap} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                    {/* Stroke is set in CSS so the line tracks the ink token
                        rather than a hard-coded white that was invisible on
                        paper. The old glow filter is gone with it. */}
                    <Line
                        type="monotone"
                        dataKey="total"
                        className={styles.line}
                        strokeWidth={1.25}
                        dot={false}
                        isAnimationActive={false}
                    />
                    <Tooltip
                        cursor={{ stroke: 'currentColor', strokeWidth: 1, opacity: 0.3 }}
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const point = payload[0].payload as DayPoint;
                            return (
                                <div className={styles.tooltip}>
                                    <p className={styles.tooltipDate}>{point.date}</p>
                                    <p className={styles.tooltipRow}>
                                        <span>Commits</span><span>{point.commits}</span>
                                    </p>
                                    <p className={styles.tooltipRow}>
                                        <span>Pull requests</span><span>{point.prs}</span>
                                    </p>
                                </div>
                            );
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ContributionTimeline;
