export function processYearlyStats(year, monthlyDownloads, githubStats) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Calculate yearly totals for each package
    const yearlyTotals = {};
    for (const [pkgKey, pkgDownloads] of Object.entries(monthlyDownloads)) {
        yearlyTotals[pkgKey] = pkgDownloads.reduce((sum, m) => sum + m.downloads, 0);
    }

    // Process core package monthly downloads with trends
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Process monthly downloads for each package
    const processedMonthlyDownloads = {};
    for (const [pkgKey, pkgDownloads] of Object.entries(monthlyDownloads)) {
        const maxDownloads = Math.max(...pkgDownloads.map(m => m.downloads));
        processedMonthlyDownloads[pkgKey] = pkgDownloads.map(m => {
            const trend = (year < currentYear || (year === currentYear && m.month <= currentMonth))
                ? (m.downloads === maxDownloads ? '🔥' :
                    m.downloads > pkgDownloads[m.month - 2]?.downloads ? '📈' :
                        m.downloads < pkgDownloads[m.month - 2]?.downloads ? '📉' : '➡️')
                : '➡️';
            return {
                month: monthNames[m.month - 1],
                downloads: m.downloads,
                trend
            };
        });
    }

    // Process GitHub stats
    const processedGithubStats = monthNames.map(month => {
        // For each month, use the existing stats from githubStats
        // If no stats exist for a month, use 0
        const monthStats = githubStats[month] || {
            projects: 0,
            files: 0,
            repositories: 0
        };

        // Return the stats for this month in the correct format
        return {
            month,
            projects: monthStats.projects,
            files: monthStats.files,
            repositories: monthStats.repositories
        };
    });

    // Find peak month for each package
    const peakMonth = {};
    for (const [pkgKey, pkgDownloads] of Object.entries(monthlyDownloads)) {
        const maxDownloads = Math.max(...pkgDownloads.map(m => m.downloads));
        const maxMonth = pkgDownloads.find(m => m.downloads === maxDownloads);
        peakMonth[pkgKey] = {
            name: monthNames[maxMonth.month - 1],
            downloads: maxDownloads
        };
    }

    return {
        year,
        yearlyTotals,
        monthlyDownloads: processedMonthlyDownloads,
        githubStats: processedGithubStats,
        peakMonth,
        lastUpdated: new Date().toISOString()
    };
} 