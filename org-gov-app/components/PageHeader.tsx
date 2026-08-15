import React, { ReactNode } from 'react';
import styles from '../styles/PageHeader.module.css';

interface PageHeaderProps {
    title: ReactNode;
    subtitle?: string;
    /** What kind of record this sheet is. Sits where a drawing names its type. */
    eyebrow?: string;
    /** Provenance: where these figures came from and when. Governance pages
     *  that show numbers without saying when they were read are asking to be
     *  trusted for no reason. */
    meta?: ReactNode;
    actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    eyebrow,
    meta,
    actions
}) => {
    return (
        <header className={styles.header}>
            <div className={styles.titleArea}>
                {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
                <h1 className={styles.title}>{title}</h1>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {(meta || actions) && (
                <div className={styles.aside}>
                    {meta && <div className={styles.meta}>{meta}</div>}
                    {actions && <div className={styles.actions}>{actions}</div>}
                </div>
            )}
        </header>
    );
};

export default PageHeader;
