import { useCallback, useEffect, useId, useRef, useState } from 'react';
import styles from '../styles/Contributors.module.css';

interface ContributorBioProps {
    children: string;
    /** Whose bio this is, so the toggle's accessible name is specific. */
    name: string;
}

/**
 * A bio clamped to a fixed number of lines, with a disclosure for the rest.
 *
 * The toggle appears only when the text is ACTUALLY clipped, measured after
 * layout rather than guessed from character count — a 300-character bio wraps
 * to a different number of lines in a wide column than a narrow one, so a
 * length threshold would show "Read more" on bios that are already complete
 * and hide it on ones that are not.
 */
export default function ContributorBio({ children, name }: ContributorBioProps) {
    const bioRef = useRef<HTMLParagraphElement>(null);
    const [clipped, setClipped] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const bioId = useId();

    const measure = useCallback(() => {
        const el = bioRef.current;
        // Only meaningful while collapsed: once expanded, scrollHeight and
        // clientHeight are equal by definition and the answer is always "no".
        if (!el || expanded) return;
        setClipped(el.scrollHeight > el.clientHeight + 1);
    }, [expanded]);

    useEffect(() => {
        measure();
        const el = bioRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        // The column width changes with the viewport, which changes the line
        // count, which changes whether this bio is clipped at all.
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [measure]);

    return (
        <div className={styles.bioBlock}>
            <p
                ref={bioRef}
                id={bioId}
                className={expanded ? styles.bioFull : styles.bioClamped}
            >
                {children}
            </p>

            {clipped && (
                <button
                    type="button"
                    className={styles.bioToggle}
                    aria-expanded={expanded}
                    aria-controls={bioId}
                    onClick={() => setExpanded((v) => !v)}
                >
                    {expanded ? 'Show less' : 'Read the rest'}
                    <span className="visually-hidden"> of {name}&apos;s bio</span>
                </button>
            )}
        </div>
    );
}
