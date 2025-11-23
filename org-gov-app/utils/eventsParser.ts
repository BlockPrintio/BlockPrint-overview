export interface EventData {
    title: string;
    organiser: string;
    date: string;
    location: string;
    attendees: string;
    twitter?: string;
    category: string;
}

export interface EventCategory {
    name: string;
    events: EventData[];
}

export function parseEventsData(markdownContent: string): EventCategory[] {
    const categories: EventCategory[] = [];
    const lines = markdownContent.split('\n');
    
    let currentCategory: EventCategory | null = null;
    let currentEvent: Partial<EventData> = {};
    let inEvent = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check for category headers (## Category Name)
        if (line.startsWith('## ') && !line.startsWith('###')) {
            // Save previous category if exists
            if (currentCategory && currentCategory.events.length > 0) {
                categories.push(currentCategory);
            }
            
            // Start new category
            const categoryName = line.substring(3).trim();
            currentCategory = {
                name: categoryName,
                events: []
            };
            inEvent = false;
            currentEvent = {};
            continue;
        }
        
        // Skip empty lines and schema sections
        if (!line || line.startsWith('#') || line.startsWith('```') || line.startsWith('This file')) {
            continue;
        }
        
        // Parse event fields
        if (line.startsWith('Title:')) {
            // Save previous event if exists
            if (inEvent && currentCategory && currentEvent.title) {
                currentCategory.events.push({
                    title: currentEvent.title,
                    organiser: currentEvent.organiser || '',
                    date: currentEvent.date || '',
                    location: currentEvent.location || '',
                    attendees: currentEvent.attendees || 'N/A',
                    twitter: currentEvent.twitter,
                    category: currentCategory.name
                });
            }
            currentEvent = { title: line.substring(6).trim() };
            inEvent = true;
        } else if (line.startsWith('Organiser:')) {
            currentEvent.organiser = line.substring(10).trim();
        } else if (line.startsWith('Date:')) {
            currentEvent.date = line.substring(5).trim();
        } else if (line.startsWith('Location:')) {
            currentEvent.location = line.substring(9).trim();
        } else if (line.startsWith('Attendees:')) {
            currentEvent.attendees = line.substring(10).trim();
        } else if (line.startsWith('Twitter:')) {
            currentEvent.twitter = line.substring(8).trim();
        }
    }
    
    // Save last event and category
    if (inEvent && currentCategory && currentEvent.title) {
        currentCategory.events.push({
            title: currentEvent.title,
            organiser: currentEvent.organiser || '',
            date: currentEvent.date || '',
            location: currentEvent.location || '',
            attendees: currentEvent.attendees || 'N/A',
            twitter: currentEvent.twitter,
            category: currentCategory.name
        });
    }
    
    if (currentCategory && currentCategory.events.length > 0) {
        categories.push(currentCategory);
    }
    
    return categories;
}

export function getTotalEventsCount(categories: EventCategory[]): number {
    return categories.reduce((total, category) => total + category.events.length, 0);
}

export function getTotalAttendeesCount(categories: EventCategory[]): number {
    return categories.reduce((total, category) => {
        return total + category.events.reduce((categoryTotal, event) => {
            const attendees = parseInt(event.attendees) || 0;
            return categoryTotal + attendees;
        }, 0);
    }, 0);
}

