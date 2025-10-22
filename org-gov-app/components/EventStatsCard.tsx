import styles from './EventStatsCard.module.css';

interface EventStatsCardProps {
    totalEvents: number;
    totalAttendees: number;
    categories: { name: string; count: number }[];
}

const EventStatsCard: React.FC<EventStatsCardProps> = ({ 
    totalEvents, 
    totalAttendees, 
    categories 
}) => {
    return (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statNumber}>{totalEvents}</div>
                    <div className={styles.statLabel}>Total Events</div>
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statNumber}>{totalAttendees}+</div>
                    <div className={styles.statLabel}>Total Attendees</div>
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statNumber}>{categories.length}</div>
                    <div className={styles.statLabel}>Event Categories</div>
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statNumber}>HK</div>
                    <div className={styles.statLabel}>Primary Location</div>
                </div>
            </div>
        </div>
    );
};

export default EventStatsCard; 