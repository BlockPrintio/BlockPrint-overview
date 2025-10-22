import { FC, useMemo } from 'react';
import styles from '../styles/OrgStats.module.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, TooltipProps, LineChart, Line } from 'recharts';
import { YearlyStats, PackageData, OrgStatsViewProps } from '../types';
import config from '../config';

const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(num);
};

const CustomTooltip = ({ active, payload, label, chartId }: TooltipProps<number, string> & { chartId?: string }) => {
    if (active && payload && payload.length && payload[0].value !== undefined) {
        const unit = chartId === 'repositories' ? 'repositories' :
            chartId === 'contributions' ? 'contributions' :
                chartId === 'contributors' ? 'contributors' : 'downloads';
        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                <p className={styles.tooltipValue}>
                    {formatNumber(payload[0].value)} {unit}
                </p>
            </div>
        );
    }
    return null;
};

interface CustomBarChartProps {
    data: PackageData[] | YearlyStats['monthlyDownloads'];
    chartId: string;
}

const CustomBarChart = ({ data, chartId }: CustomBarChartProps) => {
    // Function to format month names to 3-letter abbreviations
    const formatMonthName = (value: string) => {
        if (!value) return value;
        return value.substring(0, 3);
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={8} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                    <linearGradient id={`barGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.03)"
                    vertical={false}
                />
                <XAxis
                    dataKey="month"
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    dy={8}
                    tickFormatter={formatMonthName}
                />
                <YAxis
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                />
                <Tooltip
                    content={<CustomTooltip chartId={chartId} />}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Bar
                    dataKey="downloads"
                    fill={`url(#barGradient-${chartId})`}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={`url(#barGradient-${chartId})`}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

interface CustomLineChartProps {
    data: Array<{
        month: string;
        repositories: number;
    }>;
    chartId: string;
}

const CustomLineChart = ({ data, chartId }: CustomLineChartProps) => {
    // Function to format month names to 3-letter abbreviations
    const formatMonthName = (value: string) => {
        if (!value) return value;
        return value.substring(0, 3);
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                    <linearGradient id={`lineGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
                    </linearGradient>
                    <filter id={`glow-${chartId}`}>
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.03)"
                    vertical={false}
                />
                <XAxis
                    dataKey="month"
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    dy={8}
                    tickFormatter={formatMonthName}
                />
                <YAxis
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Tooltip
                    content={<CustomTooltip chartId={chartId} />}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Line
                    type="monotone"
                    dataKey="repositories"
                    stroke={`url(#lineGradient-${chartId})`}
                    strokeWidth={1.5}
                    dot={{ fill: '#FFFFFF', strokeWidth: 1.5, r: 3 }}
                    activeDot={{ r: 4, fill: '#FFFFFF' }}
                    filter={`url(#glow-${chartId})`}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

interface CustomSingleLineChartProps {
    data: Array<{
        month: string;
        [key: string]: string | number;
    }>;
    chartId: string;
    dataKey: string;
    name: string;
    stroke: string;
    yAxisDomain?: [number | string, number | string];
}

// Add a custom tooltip specifically for Discord charts
const CustomDiscordSingleTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length && payload[0].value !== undefined) {
        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                <p className={styles.tooltipValue}>
                    {payload[0].name}: <span style={{ color: payload[0].stroke }}>{formatNumber(payload[0].value)}</span>
                </p>
            </div>
        );
    }
    return null;
};

const CustomSingleLineChart = ({ data, chartId, dataKey, name, stroke, yAxisDomain }: CustomSingleLineChartProps) => {
    // Function to format month names to 3-letter abbreviations
    const formatMonthName = (value: string) => {
        if (!value) return value;
        return value.substring(0, 3);
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                    <linearGradient id={`lineGradient-${chartId}-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stroke} stopOpacity="1" />
                        <stop offset="100%" stopColor={stroke} stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.03)"
                    vertical={false}
                />
                <XAxis
                    dataKey="month"
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    dy={8}
                    tickFormatter={formatMonthName}
                />
                <YAxis
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
                    tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    domain={yAxisDomain || ['auto', 'auto']}
                />
                <Tooltip
                    content={<CustomDiscordSingleTooltip />}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Line
                    type="monotone"
                    name={name}
                    dataKey={dataKey}
                    stroke={stroke}
                    strokeWidth={2}
                    dot={{ fill: stroke, strokeWidth: 2 }}
                    activeDot={{ r: 4, fill: stroke }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

const OrgStatsView: FC<OrgStatsViewProps> = ({ currentStats, yearlyStats, discordStats, contributorsData }) => {
    // Get the first package from config for the heading
    const firstPackageName = useMemo(() => {
        const packageEntries = Object.entries(config.npmPackages);
        return packageEntries.length > 0 ? packageEntries[0][1] : 'Please update the config.npmPackages';
    }, []);

    // Use all Organization package data for summary cards
    const packageData = currentStats?.npm
        ? Object.entries(currentStats.npm)
            .filter(([, pkg]) => pkg && typeof pkg === 'object' && pkg.downloads && pkg.downloads.last_12_months !== undefined)
            .map(([key, pkg]) => ({
                name: key.replace(/_/g, '-'),
                downloads: pkg.downloads.last_12_months
            }))
        : [];

    const years = Object.keys(yearlyStats || {}).map(Number).sort((a, b) => b - a);
    const latestYear = years[0];

    // Use all monthly data for all packages
    const monthlyDataByPackage = latestYear && yearlyStats?.[latestYear]?.monthlyDownloads
        ? Object.entries(yearlyStats[latestYear].monthlyDownloads)
        : [];

    // Get the current year's repositories data up to current month
    const repositoriesData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        return months.slice(0, currentMonth + 1).map(month => {
            const yearData = yearlyStats[currentYear]?.githubStats.find(stat => stat.month === month);
            return {
                month,
                repositories: yearData?.repositories || 0
            };
        });
    }, [yearlyStats]);

    // Generate monthly contribution data from timestamp arrays
    const contributionsData = useMemo(() => {
        if (!contributorsData?.contributors) return [];

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // Initialize monthly data for current year up to current month
        const monthlyContributions = months.slice(0, currentMonth + 1).map(month => ({
            month,
            contributions: 0
        }));

        // Process all contributors' timestamps
        contributorsData.contributors.forEach(contributor => {
            contributor.repositories.forEach(repo => {
                // Process commit timestamps
                repo.commit_timestamps?.forEach(timestamp => {
                    const date = new Date(timestamp);
                    if (date.getFullYear() === currentYear) {
                        const monthIndex = date.getMonth();
                        if (monthIndex <= currentMonth) {
                            monthlyContributions[monthIndex].contributions += 1;
                        }
                    }
                });

                // Process PR timestamps
                repo.pr_timestamps?.forEach(timestamp => {
                    const date = new Date(timestamp);
                    if (date.getFullYear() === currentYear) {
                        const monthIndex = date.getMonth();
                        if (monthIndex <= currentMonth) {
                            monthlyContributions[monthIndex].contributions += 1;
                        }
                    }
                });
            });
        });

        return monthlyContributions;
    }, [contributorsData]);

    // Generate monthly contributor growth data
    const contributorsGrowthData = useMemo(() => {
        if (!contributorsData?.contributors) return [];

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // Calculate cumulative contributors per month (including previously existing ones)
        const monthlyGrowth = months.slice(0, currentMonth + 1).map((month, index) => {
            const activeContributors = new Set<string>();

            contributorsData.contributors.forEach(contributor => {
                let hasContributedByThisMonth = false;

                contributor.repositories.forEach(repo => {
                    // Check commit timestamps up to this month
                    repo.commit_timestamps?.forEach(timestamp => {
                        const date = new Date(timestamp);
                        // Include contributions from any year, but only up to the current month in current year
                        if (date.getFullYear() < currentYear ||
                            (date.getFullYear() === currentYear && date.getMonth() <= index)) {
                            hasContributedByThisMonth = true;
                        }
                    });

                    // Check PR timestamps up to this month
                    repo.pr_timestamps?.forEach(timestamp => {
                        const date = new Date(timestamp);
                        // Include contributions from any year, but only up to the current month in current year
                        if (date.getFullYear() < currentYear ||
                            (date.getFullYear() === currentYear && date.getMonth() <= index)) {
                            hasContributedByThisMonth = true;
                        }
                    });
                });

                if (hasContributedByThisMonth) {
                    activeContributors.add(contributor.login);
                }
            });

            return {
                month,
                contributors: activeContributors.size
            };
        });

        return monthlyGrowth;
    }, [contributorsData]);

    // Format the Discord stats for the chart
    const discordStatsData = useMemo(() => {
        if (!discordStats?.stats) return [];

        // Get sorted months in the format "YYYY-MM"
        const sortedMonths = Object.keys(discordStats.stats)
            .sort((a, b) => a.localeCompare(b));

        // Create an array of formatted data for the chart
        return sortedMonths.map(monthKey => {
            const stats = discordStats.stats[monthKey];
            // Extract year and month from the key (format: "YYYY-MM")
            const [year, month] = monthKey.split('-');
            // Convert month number to month name
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthName = monthNames[parseInt(month) - 1];

            return {
                month: `${monthName} ${year}`,
                memberCount: stats.memberCount,
                totalMessages: stats.totalMessages,
                uniquePosters: stats.uniquePosters
            };
        });
    }, [discordStats]);

    // Calculate the minimum member count to create a better visualization
    const memberCountMin = useMemo(() => {
        if (!discordStatsData.length) return 0;

        // Find minimum member count
        const min = Math.min(...discordStatsData.map(d => d.memberCount));

        // Calculate a floor that's ~10% below the minimum (to add some space at the bottom)
        // and round to a nice number
        return Math.floor(min * 0.9 / 100) * 100;
    }, [discordStatsData]);
    
    return (
        <div data-testid="mesh-stats-view">
            {packageData.length > 0 && (
                <>
                    <h2 className={styles.statsHeader}>{config.mainOrganization.displayName} NPM Package Downloads (last 12 months)</h2>
                    <div className={styles.statsGrid}>
                        {packageData.map(pkg => (
                            <div className={styles.stat} key={pkg.name}>
                                <h3>{pkg.name}</h3>
                                <p>{formatNumber(pkg.downloads)}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {monthlyDataByPackage.length > 0 && (
                <div className={styles.chartsGrid}>
                    {monthlyDataByPackage.map(([pkgKey, monthlyData]) => (
                        <div className={styles.chartSection} key={pkgKey}>
                            <h2>{pkgKey.replace(/_/g, '-')} Monthly Downloads ({latestYear})</h2>
                            <div className={styles.chart}>
                                <CustomBarChart data={Array.isArray(monthlyData) ? monthlyData : [monthlyData]} chartId={`monthly-${pkgKey}`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {currentStats?.github && (
                <div className={styles.githubStats}>
                    <h2>GitHub Usage</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.stat}>
                            <h3>Projects Using {config.mainOrganization.displayName}</h3>
                            <p>{formatNumber(currentStats.github.core_in_repositories)}</p>
                        </div>

                        {contributorsData && contributorsData.unique_count && (
                            <div className={styles.stat}>
                                <h3>GitHub Contributors</h3>
                                <p>{formatNumber(contributorsData.unique_count)}</p>
                            </div>
                        )}
                        {contributorsData && contributorsData.contributors && (
                            <div className={styles.stat}>
                                <h3>Total Contributions</h3>
                                <p>{formatNumber(contributorsData.contributors.reduce((sum, contributor) => sum + contributor.contributions, 0))}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {packageData.length > 0 && monthlyDataByPackage.length > 0 && (
                <div className={styles.chartSection}>
                    <h2>Repositories that depend on {firstPackageName} ({new Date().getFullYear()})</h2>
                    <div className={styles.chart}>
                        <CustomLineChart data={repositoriesData} chartId="repositories" />
                    </div>
                </div>
            )}

            {(contributionsData.length > 0 || contributorsGrowthData.length > 0) && (
                <div className={styles.chartsGrid}>
                    {contributionsData.length > 0 && (
                        <div className={styles.chartSection}>
                            <h2>Monthly Contributions ({new Date().getFullYear()})</h2>
                            <div className={styles.chart}>
                                <CustomLineChart
                                    data={contributionsData.map(item => ({
                                        month: item.month,
                                        repositories: item.contributions
                                    }))}
                                    chartId="contributions"
                                />
                            </div>
                        </div>
                    )}

                    {contributorsGrowthData.length > 0 && (
                        <div className={styles.chartSection}>
                            <h2>Contributors Growth ({new Date().getFullYear()})</h2>
                            <div className={styles.chart}>
                                <CustomLineChart
                                    data={contributorsGrowthData.map(item => ({
                                        month: item.month,
                                        repositories: item.contributors
                                    }))}
                                    chartId="contributors"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Discord stats summary and charts */}
            {discordStatsData.length > 0 && (
                <>
                    <div className={styles.githubStats}>
                        <h2>Discord Community</h2>
                        <div className={styles.statsGrid}>
                            <div className={styles.stat}>
                                <h3>Total Members</h3>
                                <p>{formatNumber(discordStatsData[discordStatsData.length - 1].memberCount)}</p>
                            </div>
                            <div className={styles.stat}>
                                <h3>Unique Posters</h3>
                                <p>{formatNumber(discordStatsData[discordStatsData.length - 1].uniquePosters)}</p>
                            </div>
                            <div className={styles.stat}>
                                <h3>Messages Last Month</h3>
                                <p>{formatNumber(discordStatsData[discordStatsData.length - 1].totalMessages)}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.chartsGrid}>
                        <div className={styles.chartSection}>
                            <h2>Discord Active Users</h2>
                            <div className={styles.chart}>
                                <CustomSingleLineChart
                                    data={discordStatsData}
                                    chartId="discord-posters"
                                    dataKey="uniquePosters"
                                    name="Unique Posters"
                                    stroke="#FFFFFF"
                                />
                            </div>
                        </div>

                        <div className={styles.chartSection}>
                            <h2>Discord Messages Activity</h2>
                            <div className={styles.chart}>
                                <CustomSingleLineChart
                                    data={discordStatsData}
                                    chartId="discord-messages"
                                    dataKey="totalMessages"
                                    name="Messages"
                                    stroke="#FFFFFF"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.chartSection}>
                        <h2>Discord Members Growth</h2>
                        <div className={styles.chart}>
                            <CustomSingleLineChart
                                data={discordStatsData}
                                chartId="discord-members"
                                dataKey="memberCount"
                                name="Members"
                                stroke="#FFFFFF"
                                yAxisDomain={[memberCountMin, 'auto']}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default OrgStatsView; 