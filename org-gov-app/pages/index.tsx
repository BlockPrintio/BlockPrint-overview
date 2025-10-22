import { useData } from '../contexts/DataContext';
import styles from "../styles/page.module.css";
import Link from 'next/link';
import config from '../config';

export default function Dashboard() {
  const { orgData, catalystData, drepVotingData, discordStats, stakePoolData, isLoading, error } = useData();

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

  const currentStats = orgData?.currentStats;
  const votes = drepVotingData?.votes || [];
  const projects = catalystData?.catalystData?.projects || [];

  // Get latest Discord stats
  const latestDiscordStats = discordStats?.stats ?
    Object.values(discordStats.stats).pop() : null;

  // Get stake pool info
  const poolInfo = stakePoolData?.poolInfo?.poolInfo;

  // Get DRep delegation info
  const drepDelegation = drepVotingData?.delegationData;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{config.mainOrganization.displayName} Governance</h1>
          <p className={styles.subtitle}>
            Comprehensive governance dashboard for the {config.mainOrganization.displayName} organization
          </p>
        </div>

        {/* Overview Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Total Contributors</h3>
            <div className={styles.statNumber}>{currentStats?.contributors?.unique_count || 0}</div>
          </div>
          <div className={styles.statCard}>
            <h3>DRep Votes</h3>
            <div className={styles.statNumber}>{votes.length}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Catalyst Projects</h3>
            <div className={styles.statNumber}>{projects.length}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Total Commits</h3>
            <div className={styles.statNumber}>
              {currentStats?.contributors?.total_commits?.toLocaleString() || '0'}
            </div>
          </div>
          {latestDiscordStats && (
            <div className={styles.statCard}>
              <h3>Discord Members</h3>
              <div className={styles.statNumber}>{latestDiscordStats.memberCount.toLocaleString()}</div>
            </div>
          )}
          {poolInfo && (
            <div className={styles.statCard}>
              <h3>Live Stake</h3>
              <div className={styles.statNumber}>
                {poolInfo.live_stake ?
                  `₳ ${(parseFloat(poolInfo.live_stake) / 1_000_000 / 1_000_000).toFixed(1)}M` :
                  'N/A'
                }
              </div>
            </div>
          )}
          {drepDelegation && (
            <div className={styles.statCard}>
              <h3>DRep Delegators</h3>
              <div className={styles.statNumber}>{drepDelegation.timeline.total_delegators || 0}</div>
            </div>
          )}
          {poolInfo && (
            <div className={styles.statCard}>
              <h3>Pool Delegators</h3>
              <div className={styles.statNumber}>{poolInfo.live_delegators || 0}</div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2>Quick Actions</h2>
          <div className={styles.actionGrid}>
            <Link href="/drep-voting" className={styles.actionCard}>
              <h3>DRep Voting</h3>
              <p>Track {config.mainOrganization.displayName}&apos;s DRep voting activity and delegation information</p>
            </Link>
            <Link href="/catalyst-proposals" className={styles.actionCard}>
              <h3>Catalyst Proposals</h3>
              <p>View {config.mainOrganization.displayName}&apos;s participation in Cardano Catalyst funding rounds</p>
            </Link>
            <Link href="/org-stats" className={styles.actionCard}>
              <h3>{config.mainOrganization.displayName} Stats</h3>
              <p>Comprehensive statistics and metrics for the organization</p>
            </Link>
            <Link href="/stake-pool" className={styles.actionCard}>
              <h3>Stake Pool</h3>
              <p>Monitor {config.mainOrganization.displayName}&apos;s stake pool performance and governance participation</p>
            </Link>
            <Link href="/projects" className={styles.actionCard}>
              <h3>Projects</h3>
              <p>Explore {config.mainOrganization.displayName}&apos;s open source projects and repositories</p>
            </Link>
            <Link href="/contributors" className={styles.actionCard}>
              <h3>Contributors</h3>
              <p>Meet the amazing contributors who make {config.mainOrganization.displayName} possible</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 