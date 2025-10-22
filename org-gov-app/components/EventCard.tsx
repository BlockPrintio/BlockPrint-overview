import { EventData } from '../utils/eventsParser';
import styles from './EventCard.module.css';

interface EventCardProps {
    event: EventData;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const handleTwitterClick = () => {
        if (event.twitter) {
            window.open(event.twitter, '_blank', 'noopener,noreferrer');
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Main Events':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            case 'Workshops':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 9V5a3 3 0 00-6 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="2" y="9" width="20" height="12" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="15" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            case 'Hong Kong Meetups':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            case 'Interviews':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3 3 3 0 00-3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
        }
    };

    return (
        <div className={styles.eventCard}>
            <div className={styles.eventHeader}>
                <div className={styles.categoryBadge}>
                    <div className={styles.categoryIcon}>
                        {getCategoryIcon(event.category)}
                    </div>
                    <span className={styles.categoryText}>{event.category}</span>
                </div>
                <button 
                    className={styles.twitterButton} 
                    onClick={handleTwitterClick}
                    title="View on Twitter"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
                    </svg>
                </button>
            </div>

            <div className={styles.eventContent}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                
                <div className={styles.eventMeta}>
                    <div className={styles.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 4h-1V2a1 1 0 00-2 0v2H8V2a1 1 0 00-2 0v2H5a3 3 0 00-3 3v12a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zM5 6h1v1a1 1 0 002 0V6h8v1a1 1 0 002 0V6h1a1 1 0 011 1v1H4V7a1 1 0 011-1zm14 14H5a1 1 0 01-1-1V10h16v9a1 1 0 01-1 1z" fill="currentColor"/>
                        </svg>
                        <span>{event.date}</span>
                    </div>

                    <div className={styles.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{event.location}</span>
                    </div>

                    {event.attendees && event.attendees !== 'N/A' && (
                        <div className={styles.metaItem}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{event.attendees} attendees</span>
                        </div>
                    )}
                </div>

                {event.organiser && (
                    <div className={styles.organiserInfo}>
                        <span className={styles.organiserLabel}>Organized by:</span>
                        <span className={styles.organiserName}>{event.organiser}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard; 