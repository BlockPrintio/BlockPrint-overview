import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Contributors.module.css';
import { FaGithub } from 'react-icons/fa';
import ContributorBio from './ContributorBio';

export interface ManualContributor {
    name: string;
    bio: string;
    github: string;
    avatar?: string;
}

interface ManualContributorCardProps {
    contributor: ManualContributor;
}

export default function ManualContributorCard({ contributor }: ManualContributorCardProps) {
    // Extract username from GitHub URL if needed
    const getGithubUsername = (url: string): string => {
        const match = url.match(/github\.com\/([^\/]+)/);
        return match ? match[1] : '';
    };

    const githubUsername = getGithubUsername(contributor.github);
    // Use GitHub's avatar URL - GitHub redirects github.com/username.png to the avatar
    // This format works reliably and is already configured in next.config.ts
    const avatarUrl = contributor.avatar || (githubUsername ? `https://github.com/${githubUsername}.png` : '/default-avatar.png');

    return (
        <div className={styles.manualContributorCard}>
            <div className={styles.contributorHeader}>
                <Image
                    src={avatarUrl}
                    alt={`${contributor.name}'s avatar`}
                    width={48}
                    height={48}
                    className={styles.avatar}
                />
                <h3 className={styles.username}>{contributor.name}</h3>
            </div>
            
            <ContributorBio name={contributor.name}>{contributor.bio}</ContributorBio>

            <div className={styles.contributorLinks}>
                <Link
                    href={contributor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.githubLink}
                >
                    <FaGithub />
                    <span>{githubUsername || 'GitHub'}</span>
                </Link>
            </div>
        </div>
    );
}

