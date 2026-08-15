import Link from "next/link";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useData } from "../contexts/DataContext";
import styles from "../styles/page.module.css";
import config from "../config";
import { FUND_15_PROPOSALS, FUND_15_SUMMARIES, FUND_15_TOTALS, formatAda, formatCount } from "../data/fund15";
import manualContributors from "../data/manual-contributors.json";
import { DISCORD } from "../data/discord";

// Client-only: the scene reads the rendered token values and a WebGL context,
// neither of which exists on the server. The SVG fallback inside it is what
// renders until this arrives, so the hero is never empty.
const MilestoneMark = dynamic(() => import("../components/MilestoneMark"), {
    ssr: false,
    loading: () => <div className={styles.figurePlaceholder} />,
});

const org = config.mainOrganization.displayName;

// The index of sheets. Descriptions say what is recorded on each one, not
// what the reader should feel about it.
const sheets = [
    {
        href: "/projects",
        name: "Projects",
        description: "Explore BlockPrint's open source projects and repositories",
    },
    {
        href: "/catalyst-proposals",
        name: "Catalyst Proposals",
        description: "View BlockPrint's participation in Cardano Catalyst funding rounds",
    },
    {
        href: "/org-stats",
        name: "BlockPrint Stats",
        description: "Comprehensive statistics and metrics for the organization",
    },
    {
        href: "/contributors",
        name: "Contributors",
        description: "Meet the amazing contributors who make BlockPrint possible",
    },
];

export default function Overview() {
    // Contributors named on the team page are known locally and are true
    // whether or not the GitHub aggregation responds. The live count replaces
    // it once it arrives, and the label says which one is on screen.
    const { contributorStats } = useData();
    const namedContributors = manualContributors.length;
    const githubContributors = contributorStats?.unique_count ?? null;

    const markRows = FUND_15_PROPOSALS.map((project) => ({
        id: project.projectDetails.project_id,
        total: project.projectDetails.milestones_qty,
        completed: project.milestonesCompleted,
    }));

    // The sheet's own status, read off the record rather than typed in. Nothing
    // drawn down and nothing signed off means the proposals are still with
    // voters; it stops saying that the moment either figure moves.
    const recordStatus =
        FUND_15_TOTALS.distributed === 0 && FUND_15_TOTALS.milestonesDelivered === 0
            ? 'Awaiting vote'
            : 'In delivery';

    // This sheet plus the ones it indexes. Derived, so adding a sheet below
    // cannot leave the count in the title block stale.
    const sheetCount = String(sheets.length + 1).padStart(2, '0');

    return (
        <div className="sheet">
            {/* Each sheet names itself, so five open tabs are five distinguishable
                records rather than five copies of the same string. */}
            <Head>
                <title>{`${org} Governance Record — Overview`}</title>
            </Head>

            {/* The overview gets its own hero rather than the shared PageHeader,
                because it is the one sheet that carries a drawing. */}
            <header className={styles.hero}>
                <div className={styles.heroText}>
                    <h1 className={styles.heroTitle}>{org} <span>Governance</span></h1>
                    <p className={styles.heroSubtitle}>
                        BlockPrint is a Cardano developer community in Lagos, Nigeria,
                        focused on making blockchain accessible through open source projects
                        and innovative solutions.
                    </p>
                </div>

                <figure className={styles.heroFigure}>
                    <MilestoneMark rows={markRows} />
                </figure>

                {/* The title block. A drawing carries its sheet number, subject
                    and status in a ruled strip along the bottom edge rather
                    than loose in the drawing field, and the frame rule closes
                    it. These four qualify everything else on the sheet; the
                    figures themselves are in the record table further down, so
                    nothing is stated twice. */}
                <dl className={styles.titleBlock}>
                    <div className={styles.titleBlockField}>
                        <dt>Sheet</dt>
                        <dd>01 / {sheetCount}</dd>
                    </div>
                    <div className={styles.titleBlockField}>
                        <dt>Subject</dt>
                        <dd>Fund 15, Project Catalyst</dd>
                    </div>
                    <div className={styles.titleBlockField}>
                        <dt>Status</dt>
                        <dd>{recordStatus}</dd>
                    </div>
                    <div className={styles.titleBlockField}>
                        <dt>Figures</dt>
                        <dd>As filed</dd>
                    </div>
                </dl>
            </header>

            {/* The open item. This is the one place the revision-red annotation
                colour appears on the page, because it is the one thing that is
                genuinely outstanding. */}
            <section className={`${styles.open} sheet-section`} aria-labelledby="open-heading">
                <div className={styles.openHead}>
                    <p className={styles.openMark}>Open item</p>
                    <h2 className={styles.openTitle} id="open-heading">
                        {FUND_15_TOTALS.count} proposals are in front of Fund 15 voters
                    </h2>
                    <p className={styles.openBody}>
                        Neither has been funded yet, so nothing has been drawn down and no
                        milestone has been delivered. Voting is how that changes.
                    </p>
                </div>

                <ol className={styles.openList}>
                    {FUND_15_PROPOSALS.map((project) => {
                        const { project_id, title, budget, milestones_qty, url } = project.projectDetails;
                        return (
                            <li key={project_id} className={styles.openItem}>
                                <div className={styles.openItemMain}>
                                    <p className={styles.openItemId}>{project_id}</p>
                                    <h3 className={styles.openItemTitle}>{title}</h3>
                                    <p className={styles.openItemSummary}>{FUND_15_SUMMARIES[project_id]}</p>
                                </div>
                                <dl className={styles.openItemSpec}>
                                    <div>
                                        <dt>Requested</dt>
                                        <dd>{formatAda(budget)}</dd>
                                    </div>
                                    <div>
                                        <dt>Milestones</dt>
                                        <dd>{milestones_qty}</dd>
                                    </div>
                                </dl>
                                <a
                                    className={styles.openItemAction}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Read it on Catalyst
                                    <span className={styles.openItemArrow} aria-hidden="true">→</span>
                                </a>
                            </li>
                        );
                    })}
                </ol>
            </section>

            {/* A spec table, not a row of equal cards. Each row names where the
                figure comes from, because a number without a source is a claim. */}
            <section className="sheet-section" aria-labelledby="record-heading">
                <h2 className={styles.sectionTitle} id="record-heading">The record</h2>

                <dl className={styles.specTable}>
                    <div className={styles.specRow}>
                        <dt className={styles.specKey}>Requested from the treasury</dt>
                        <dd className={styles.specValue}>{formatAda(FUND_15_TOTALS.requested)}</dd>
                        <dd className={styles.specNote}>Across {FUND_15_TOTALS.count} Fund 15 proposals</dd>
                    </div>
                    <div className={styles.specRow}>
                        <dt className={styles.specKey}>Distributed to date</dt>
                        <dd className={styles.specValue}>{formatAda(FUND_15_TOTALS.distributed)}</dd>
                        <dd className={styles.specNote}>Nothing drawn down before a vote</dd>
                    </div>
                    <div className={styles.specRow}>
                        <dt className={styles.specKey}>Milestones delivered</dt>
                        <dd className={styles.specValue}>
                            {FUND_15_TOTALS.milestonesDelivered}
                            <span className={styles.specOf}>/{FUND_15_TOTALS.milestones}</span>
                        </dd>
                        <dd className={styles.specNote}>Sign-off begins once a proposal is funded</dd>
                    </div>
                    <div className={styles.specRow}>
                        <dt className={styles.specKey}>Contributors</dt>
                        <dd className={styles.specValue}>
                            {formatCount(githubContributors ?? namedContributors)}
                        </dd>
                        <dd className={styles.specNote}>
                            {githubContributors === null
                                ? 'Named on the contributors sheet'
                                : 'With commits or pull requests on GitHub'}
                        </dd>
                    </div>

                    {/* Discord membership. The deployed overview states 56,
                        which is hardcoded there and contradicted by this
                        repository's own monthly figures — so this reads the
                        collected file and says which month it is from. */}
                    {DISCORD && (
                        <div className={styles.specRow}>
                            <dt className={styles.specKey}>Discord members</dt>
                            <dd className={styles.specValue}>{formatCount(DISCORD.memberCount)}</dd>
                            <dd className={styles.specNote}>
                                Counted {DISCORD.asOf}
                            </dd>
                        </div>
                    )}
                </dl>
            </section>

            {/* The index. A list of sheets with what each one records — a
                three-up card grid would have asserted they matter equally. */}
            <section className="sheet-section" aria-labelledby="index-heading">
                <h2 className={styles.sectionTitle} id="index-heading">Quick Actions</h2>
                <ul className={styles.indexList}>
                    {sheets.map((sheet, i) => (
                        <li key={sheet.href}>
                            <Link href={sheet.href} className={styles.indexItem}>
                                <span className={styles.indexNumber}>
                                    {String(i + 2).padStart(2, '0')}
                                </span>
                                <span className={styles.indexBody}>
                                    <span className={styles.indexName}>{sheet.name}</span>
                                    <span className={styles.indexDescription}>{sheet.description}</span>
                                </span>
                                <span className={styles.indexArrow} aria-hidden="true">→</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
