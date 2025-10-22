import { useData } from '../contexts/DataContext';
import { useState, useEffect } from 'react';
import styles from '../styles/Events.module.css';
import PageHeader from '../components/PageHeader';
import EventCard from '../components/EventCard';
import EventStatsCard from '../components/EventStatsCard';
import { parseEventsData, getTotalEventsCount, getTotalAttendeesCount, EventCategory } from '../utils/eventsParser';

export default function CommunityEvents() {
    const { isLoading, error } = useData();
    const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventsData = async () => {
            try {
                // Fetch the markdown file from the repository
                const response = await fetch('/community-events/events-data.md');
                if (!response.ok) {
                    throw new Error('Failed to fetch events data');
                }
                const markdownContent = await response.text();
                const parsedCategories = parseEventsData(markdownContent);
                setEventCategories(parsedCategories);
            } catch (err) {
                console.error('Error fetching events data:', err);
                setEventsError('Failed to load events data');
            } finally {
                setEventsLoading(false);
            }
        };

        fetchEventsData();
    }, []);

    if (isLoading || eventsLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading community events...</div>
            </div>
        );
    }

    if (error || eventsError) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error || eventsError}</div>
            </div>
        );
    }

    // Calculate statistics
    const totalEvents = getTotalEventsCount(eventCategories);
    const totalAttendees = getTotalAttendeesCount(eventCategories);
    const categoryStats = eventCategories.map(cat => ({
        name: cat.name,
        count: cat.events.length
    }));

    return (
        <div className={styles.container}>
            <PageHeader
                title={<>Community <span>Events</span></>}
                subtitle="Discover SIDAN Lab's community events, workshops, meetups, and educational sessions in the Cardano ecosystem"
            />

            <EventStatsCard
                totalEvents={totalEvents}
                totalAttendees={totalAttendees}
                categories={categoryStats}
            />

            <div className={styles.eventsContent}>
                {eventCategories.map((category) => (
                    <div key={category.name} className={styles.categorySection}>
                        <h2 className={styles.categoryTitle}>
                            {category.name}
                            <span className={styles.categoryCount}>({category.events.length})</span>
                        </h2>
                        <div className={styles.eventsGrid}>
                            {category.events.map((event, index) => (
                                <EventCard
                                    key={`${category.name}-${index}`}
                                    event={event}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 