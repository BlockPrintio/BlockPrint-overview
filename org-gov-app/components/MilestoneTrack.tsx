import { FC } from 'react';
import styles from './MilestoneTrack.module.css';

interface MilestoneTrackProps {
    completed: number;
    total: number;
    /** `full` prints the per-milestone numbers beneath the line. */
    size?: 'full' | 'compact';
}

/**
 * A milestone run drawn as a dimension line.
 *
 * On a technical drawing a dimension line spans exactly what is being
 * measured, terminates in witness lines at both ends, and carries the
 * measurement as a callout. That maps onto a Catalyst milestone run without
 * any forcing: the span is the contracted milestone count, each witness tick
 * is one milestone, and the run drawn in ink is what has actually been
 * signed off.
 *
 * It is deliberately not a progress bar. A progress bar rounds a discrete,
 * audited count into a smooth percentage and reads as filling up; this reads
 * as measured, and it states "0 / 5" without dressing it up — which, until
 * these proposals are funded, is the true figure.
 */
const MilestoneTrack: FC<MilestoneTrackProps> = ({ completed, total, size = 'full' }) => {
    const safeTotal = Math.max(0, total);
    const safeCompleted = Math.min(Math.max(0, completed), safeTotal);

    if (safeTotal === 0) {
        return (
            <p className={styles.callout}>
                <span className={styles.calloutValue}>No milestones</span>
                <span className={styles.calloutUnit}>contracted</span>
            </p>
        );
    }

    const segments = Array.from({ length: safeTotal }, (_, i) => i);

    return (
        <div className={`${styles.track} ${size === 'compact' ? styles.compact : ''}`}>
            {/* The drawing itself carries no accessible name — the callout below
                states the same figure in text, and announcing it twice is worse
                than announcing it once. */}
            <div className={styles.line} aria-hidden="true">
                {segments.map((i) => (
                    <span
                        key={i}
                        className={`${styles.segment} ${i < safeCompleted ? styles.delivered : ''}`}
                        style={{ ['--segment-index' as string]: i }}
                    />
                ))}
                <span className={styles.terminator} />
            </div>

            {size === 'full' && (
                <div className={styles.numbers} aria-hidden="true">
                    {segments.map((i) => (
                        <span
                            key={i}
                            className={`${styles.number} ${i < safeCompleted ? styles.numberDelivered : ''}`}
                        >
                            {i + 1}
                        </span>
                    ))}
                </div>
            )}

            <p className={styles.callout}>
                <span className={styles.calloutValue}>
                    {safeCompleted}<span className={styles.calloutOf}>/{safeTotal}</span>
                </span>
                <span className={styles.calloutUnit}>
                    {safeCompleted === 1 ? 'milestone delivered' : 'milestones delivered'}
                </span>
            </p>
        </div>
    );
};

export default MilestoneTrack;
