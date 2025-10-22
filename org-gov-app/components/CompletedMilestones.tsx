import React, { useState } from 'react';
import { MilestoneData } from '../utils/milestones';
import styles from './CompletedMilestones.module.css';

interface CompletedMilestonesProps {
    milestones: MilestoneData[];
}

export default function CompletedMilestones({ milestones }: CompletedMilestonesProps) {
    const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);

    if (!milestones || milestones.length === 0) {
        return null;
    }

    const toggleMilestone = (milestoneNumber: number) => {
        setExpandedMilestone(expandedMilestone === milestoneNumber ? null : milestoneNumber);
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Date not available';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString; // Return original string if parsing fails
        }
    };

    const extractLinks = (text: string): { text: string; url: string }[] => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links: { text: string; url: string }[] = [];
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            links.push({
                text: match[1],
                url: match[2]
            });
        }

        return links;
    };

    const renderContent = (content: string) => {
        const lines = content.split('\n');
        const elements: React.JSX.Element[] = [];
        let listItems: string[] = [];
        let isInList = false;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            if (!trimmedLine) {
                if (isInList && listItems.length > 0) {
                    elements.push(
                        <ul key={`list-${index}`} className={styles.list}>
                            {listItems.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                    listItems = [];
                    isInList = false;
                }
                return;
            }

            // Handle headers
            if (trimmedLine.startsWith('###')) {
                if (isInList && listItems.length > 0) {
                    elements.push(
                        <ul key={`list-${index}`} className={styles.list}>
                            {listItems.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                    listItems = [];
                    isInList = false;
                }
                elements.push(
                    <h4 key={index} className={styles.subheading}>
                        {trimmedLine.replace(/^###\s*/, '')}
                    </h4>
                );
                return;
            }

            // Handle list items
            if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                isInList = true;
                const item = trimmedLine.replace(/^[-*]\s*/, '');
                const links = extractLinks(item);
                
                if (links.length > 0) {
                    let processedItem = item;
                    links.forEach(link => {
                        processedItem = processedItem.replace(
                            `[${link.text}](${link.url})`,
                            `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="${styles.link}">${link.text}</a>`
                        );
                    });
                    listItems.push(processedItem);
                } else {
                    listItems.push(item);
                }
                return;
            }

            // Handle regular paragraphs
            if (!isInList && trimmedLine && !trimmedLine.startsWith('#')) {
                const links = extractLinks(trimmedLine);
                let processedText = trimmedLine;
                
                if (links.length > 0) {
                    links.forEach(link => {
                        processedText = processedText.replace(
                            `[${link.text}](${link.url})`,
                            `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="${styles.link}">${link.text}</a>`
                        );
                    });
                }
                
                elements.push(
                    <p key={index} className={styles.paragraph} 
                       dangerouslySetInnerHTML={{ __html: processedText }} />
                );
            }
        });

        // Handle remaining list items
        if (isInList && listItems.length > 0) {
            elements.push(
                <ul key="final-list" className={styles.list}>
                    {listItems.map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ul>
            );
        }

        return elements;
    };

    return (
        <div className={styles.milestonesSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Completed Milestones</h2>
                <div className={styles.milestoneCount}>
                    {milestones.length} milestone{milestones.length !== 1 ? 's' : ''} completed
                </div>
            </div>

            <div className={styles.milestonesGrid}>
                {milestones.map((milestone) => (
                    <div key={milestone.milestoneNumber} className={styles.milestoneCard}>
                        <div 
                            className={styles.milestoneHeader}
                            onClick={() => toggleMilestone(milestone.milestoneNumber)}
                        >
                            <div className={styles.milestoneInfo}>
                                <div className={styles.milestoneNumber}>
                                    Milestone {milestone.milestoneNumber}
                                </div>
                                <div className={styles.milestoneBudget}>
                                    {milestone.budget}
                                </div>
                            </div>
                            <div className={styles.milestoneDate}>
                                Delivered: {formatDate(milestone.deliveredDate)}
                            </div>
                            <div className={`${styles.expandIcon} ${expandedMilestone === milestone.milestoneNumber ? styles.expanded : ''}`}>
                                ↓
                            </div>
                        </div>

                        {expandedMilestone === milestone.milestoneNumber && (
                            <div className={styles.milestoneContent}>
                                {milestone.title && (
                                    <h3 className={styles.milestoneTitle}>{milestone.title}</h3>
                                )}
                                
                                {milestone.outcomes.length > 0 && (
                                    <div className={styles.section}>
                                        <h4 className={styles.sectionSubtitle}>Outcomes & Objectives</h4>
                                        <ul className={styles.outcomesList}>
                                            {milestone.outcomes.map((outcome, index) => (
                                                <li key={index}>{outcome}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {milestone.evidence.length > 0 && (
                                    <div className={styles.section}>
                                        <h4 className={styles.sectionSubtitle}>Evidence & Links</h4>
                                        <ul className={styles.evidenceList}>
                                            {milestone.evidence.map((evidence, index) => (
                                                <li key={index}>
                                                    {evidence.startsWith('http') ? (
                                                        <a 
                                                            href={evidence} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className={styles.evidenceLink}
                                                        >
                                                            {evidence}
                                                        </a>
                                                    ) : (
                                                        evidence
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className={styles.section}>
                                    <h4 className={styles.sectionSubtitle}>Full Report</h4>
                                    <div className={styles.reportContent}>
                                        {renderContent(milestone.content)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 