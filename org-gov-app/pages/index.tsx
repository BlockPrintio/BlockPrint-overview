import { useData } from "../contexts/DataContext";
import styles from "../styles/page.module.css";
import Link from "next/link";
import config from "../config";

export default function Dashboard() {
  const { blockprintData, isLoading, error } = useData();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            {config.mainOrganization.displayName} Governance
          </h1>
          <p className={styles.heroDescription}>
            BlockPrint is a Cardano developer community in Lagos, Nigeria,
            focused on making blockchain accessible through open source projects
            and innovative solutions.
          </p>
        </div>

        {/* Overview Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Total Contributors</h3>
            <div className={styles.statNumber}>
              {12}
            </div>
          </div>
          <div className={styles.statCard}>
            <h3>Catalyst Projects</h3>
            <div className={styles.statNumber}>{0}</div>
          </div>
          {/* <div className={styles.statCard}>
            <h3>Total Commits</h3>
            <div className={styles.statNumber}>
              {currentStats?.total_commits?.toLocaleString() ||
                "0"}
            </div>
          </div> */}
            <div className={styles.statCard}>
              <h3>Discord Members</h3>
              <div className={styles.statNumber}>
                {56}
              </div>
            </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.new_title}>Quick Actions</h2>
          <div className={styles.actionGrid}>
            <Link href="/org-stats" className={styles.actionCard}>
              <h3>{config.mainOrganization.displayName} Stats</h3>
              <p>Comprehensive statistics and metrics for the organization</p>
            </Link>
            <Link href="/projects" className={styles.actionCard}>
              <h3>Projects</h3>
              <p>
                Explore {config.mainOrganization.displayName}&apos;s open source
                projects and repositories
              </p>
            </Link>
            <Link href="/catalyst-proposals" className={styles.actionCard}>
              <h3>Catalyst Proposals</h3>
              <p>
                View {config.mainOrganization.displayName}&apos;s participation
                in Cardano Catalyst funding rounds
              </p>
            </Link>
            <Link href="/contributors" className={styles.actionCard}>
              <h3>Contributors</h3>
              <p>
                Meet the amazing contributors who make{" "}
                {config.mainOrganization.displayName} possible
              </p>
            </Link>
            {/* <Link href="/not-found" className={styles.actionCard}>
              <h3>DRep Voting</h3>
              <p>
                Track {config.mainOrganization.displayName}&apos;s DRep voting
                activity and delegation information
              </p>
            </Link> */}
            {/* <Link href="/Not-found" className={styles.actionCard}>
              <h3>Stake Pool</h3>
              <p>
                Monitor {config.mainOrganization.displayName}&apos;s stake pool
                performance and governance participation
              </p>
            </Link> */}
          </div>
        </div>
      </main>
    </div>
  );
}
