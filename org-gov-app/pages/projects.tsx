import { useData } from '../contexts/DataContext';
import styles from '../styles/Projects.module.css';
import PageHeader from '../components/PageHeader';
import Link from 'next/link';
import Image from 'next/image';
import config from '../config';

// Interface for project data
interface Project {
    id: string;
    name: string;
    description: string;
    icon?: string;  // Make icon optional
    url: string;
    category?: string;  // Make category optional
}

// Add this interface near the top with other interfaces
interface ShowcaseRepo {
    name: string;
    description: string;
    icon?: string;  // Make icon optional
    url: string;
}

// Spotlight Card Component
const SpotlightCard = ({ project }: { project: Project }) => {
    return (
        <div className={styles.projectCard}>
            <div className={styles.projectHeader}>
                {project.icon && (
                    <div className={styles.projectIcon}>
                        <Image
                            src={project.icon}
                            alt={`${project.name} icon`}
                            width={40}
                            height={40}
                        />
                    </div>
                )}
                <h3 className={styles.projectName}>{project.name}</h3>
            </div>
            <p className={styles.projectDescription}>{project.description}</p>
            <Link
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.projectLink}
            >
                View Project
            </Link>
        </div>
    );
};

// Showcase Repo Card
const ShowcaseRepoCard = ({ repo }: { repo: ShowcaseRepo }) => (
    <div className={styles.projectCard}>
        <div className={styles.projectHeader}>
            {repo.icon && (
                <div className={styles.projectIcon}>
                    <Image
                        src={repo.icon}
                        alt={`${repo.name} icon`}
                        width={40}
                        height={40}
                    />
                </div>
            )}
            <h3 className={styles.projectName}>{repo.name}</h3>
        </div>
        <p className={styles.projectDescription}>{repo.description}</p>
        <Link
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.projectLink}
        >
            View Repository
        </Link>
    </div>
);

export default function Projects() {
    const { orgData, isLoading, error } = useData();

    // Extract repository name from dependents URL
    const getRepoNameFromUrl = (url: string): string => {
        const match = url.match(/github\.com\/[^\/]+\/([^\/]+)/);
        return match ? match[1] : config.mainOrganization.displayName;
    };

    // Construct the dependents URL using config values
    const dependentsUrl = `https://github.com/${config.mainOrganization.name}/${config.repositories.dependentsCountRepo}/network/dependents`;
    const repoName = getRepoNameFromUrl(dependentsUrl);

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

    const githubUsage = orgData?.currentStats?.github?.core_in_repositories || 0;
    const totalReferences = orgData?.currentStats?.github?.core_in_any_file || 0;

    // Extract showcaseRepos from config
    const showcaseRepos: ShowcaseRepo[] = (config as { showcaseRepos?: ShowcaseRepo[] }).showcaseRepos || [];

    return (
        <div className={styles.container}>
            <PageHeader
                title={<>{config.mainOrganization.displayName} <span>Projects</span></>}
                subtitle={`Projects using ${config.mainOrganization.displayName} in their GitHub repositories`}
            />

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <h3>Total Repos using {repoName}</h3>
                    <p>{githubUsage}</p>
                </div>
                <div className={styles.stat}>
                    <h3>Total References</h3>
                    <p>{totalReferences}</p>
                </div>
            </div>

            <div className={styles.moreSection} style={{ justifyContent: 'flex-start' }}>
                <a href={dependentsUrl} className={styles.moreButton} target="_blank" rel="noopener noreferrer">
                    View all Projects
                </a>
            </div>

            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{config.mainOrganization.displayName} Lab Open Source Showcase</h2>
                <p className={styles.sectionDescription}>Featured open source projects from {config.mainOrganization.displayName} Lab</p>
            </div>
            <div className={styles.projectsGrid}>
                {showcaseRepos.map((repo) => (
                    <ShowcaseRepoCard key={repo.name} repo={repo} />
                ))}
            </div>

            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Spotlight</h2>
                <p className={styles.sectionDescription}>Highlighting a few innovative projects using {config.mainOrganization.displayName} at their projects. Give it a look, maybe get inspired...</p>
            </div>

            <div className={styles.highlightedGrid}>
                {config.highlightedProjects.map((project) => (
                    <SpotlightCard key={project.name} project={project} />
                ))}
            </div>

            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Trusted by Builders</h2>
                <p className={styles.sectionDescription}>Awesome projects and organizations building with Mesh</p>
            </div>

            <div className={styles.buildersGallery}>
                {config.builderProjects.map(project => (
                    <Link
                        key={project.id}
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.builderItem}
                    >
                        {project.icon && (
                            <Image
                                src={project.icon}
                                alt={`${project.id} icon`}
                                width={100}
                                height={40}
                            />
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
} 