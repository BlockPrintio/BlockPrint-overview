import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../styles/ContributorModal.module.css';
import { Contributor } from '../types';
import RepoBreakdown from './RepoBreakdown';
import ContributionTimeline from './ContributionTimeline';

interface ContributorModalProps {
    contributor: Contributor;
    onClose: () => void;
}

export const ContributorModal: React.FC<ContributorModalProps> = ({ contributor, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Remember what opened the dialog so focus can go back there.
        returnFocusRef.current = document.activeElement as HTMLElement;
        closeRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }

            // Keep Tab inside the dialog. Without this the tab order walks off
            // into the page behind, which for a screen-reader or keyboard user
            // means the dialog has effectively no boundary.
            if (event.key !== 'Tab' || !modalRef.current) return;

            const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            returnFocusRef.current?.focus();
        };
    }, [onClose]);

    const totalRepos = contributor.repositories.length;

    return (
        <div
            className={styles.overlay}
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className={styles.modal}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="contributor-modal-title"
            >
                <div className={styles.head}>
                    <div className={styles.identity}>
                        <Image
                            src={contributor.avatar_url}
                            alt=""
                            width={56}
                            height={56}
                            className={styles.avatar}
                        />
                        <div>
                            <h2 className={styles.name} id="contributor-modal-title">
                                {contributor.login}
                            </h2>
                            <a
                                className={styles.profileLink}
                                href={`https://github.com/${contributor.login}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                github.com/{contributor.login}
                            </a>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.close}
                        onClick={onClose}
                        ref={closeRef}
                    >
                        Close
                    </button>
                </div>

                <div className={styles.body}>
                    <dl className={styles.summary}>
                        <div>
                            <dt>Commits</dt>
                            <dd>{contributor.commits}</dd>
                        </div>
                        <div>
                            <dt>Pull requests</dt>
                            <dd>{contributor.pull_requests}</dd>
                        </div>
                        <div>
                            <dt>Contributions</dt>
                            <dd>{contributor.contributions}</dd>
                        </div>
                        <div>
                            <dt>Repositories</dt>
                            <dd>{totalRepos}</dd>
                        </div>
                    </dl>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Activity over time</h3>
                        <ContributionTimeline
                            commitTimestamps={contributor.repositories.flatMap((r) => r.commit_timestamps)}
                            prTimestamps={contributor.repositories.flatMap((r) => r.pr_timestamps)}
                            height={150}
                        />
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>By repository</h3>
                        <RepoBreakdown repositories={contributor.repositories} limit={10} />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ContributorModal;
