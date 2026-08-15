import { FC } from 'react';
import styles from './RepoBreakdown.module.css';

interface Repo {
    name: string;
    commits: number;
    pull_requests: number;
    contributions: number;
}

interface RepoBreakdownProps {
    repositories: Repo[];
    /** Rows to show before folding the tail into one summary row. */
    limit?: number;
}

/**
 * Where a contributor's work went, as a ranked schedule.
 *
 * This replaces a canvas donut that painted all twelve segments with the same
 * grey gradient — so colour implied a distinction it was not making, and
 * comparing two adjacent repositories meant comparing two arc lengths by eye.
 * A sorted list with the counts printed answers the same question exactly,
 * survives on paper, and is readable by a screen reader.
 */
const RepoBreakdown: FC<RepoBreakdownProps> = ({ repositories, limit = 8 }) => {
    const ranked = [...repositories].sort((a, b) => b.contributions - a.contributions);

    if (ranked.length === 0) {
        return <p className={styles.empty}>No repository activity recorded.</p>;
    }

    const shown = ranked.slice(0, limit);
    const rest = ranked.slice(limit);
    const restTotal = rest.reduce((sum, r) => sum + r.contributions, 0);
    const max = ranked[0]?.contributions || 1;

    return (
        <table className={styles.table}>
            <caption className="visually-hidden">
                Contributions by repository, most active first
            </caption>
            <thead>
                <tr>
                    <th scope="col">Repository</th>
                    <th scope="col" className={styles.numeric}>Commits</th>
                    <th scope="col" className={styles.numeric}>PRs</th>
                    <th scope="col" className={styles.numeric}>Total</th>
                </tr>
            </thead>
            <tbody>
                {shown.map((repo) => (
                    <tr key={repo.name}>
                        <th scope="row" className={styles.nameCell}>
                            <span className={styles.name}>{repo.name}</span>
                            {/* The bar is a second reading of the number beside
                                it, not the only one — it makes the ranking
                                scannable without being the source of truth. */}
                            <span
                                className={styles.bar}
                                style={{ ['--fill' as string]: `${(repo.contributions / max) * 100}%` }}
                                aria-hidden="true"
                            />
                        </th>
                        <td className={styles.numeric}>{repo.commits}</td>
                        <td className={styles.numeric}>{repo.pull_requests}</td>
                        <td className={`${styles.numeric} ${styles.total}`}>{repo.contributions}</td>
                    </tr>
                ))}
                {rest.length > 0 && (
                    <tr className={styles.restRow}>
                        <th scope="row" className={styles.nameCell}>
                            <span className={styles.name}>
                                {rest.length} more {rest.length === 1 ? 'repository' : 'repositories'}
                            </span>
                        </th>
                        <td className={styles.numeric} aria-hidden="true">—</td>
                        <td className={styles.numeric} aria-hidden="true">—</td>
                        <td className={`${styles.numeric} ${styles.total}`}>{restTotal}</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default RepoBreakdown;
