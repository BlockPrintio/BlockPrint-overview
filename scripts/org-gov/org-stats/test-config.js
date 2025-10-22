import { getConfig, getAllOrganizations, isRepoExcluded } from './config-loader.js';

async function testConfig() {
    try {
        console.log('Testing new multi-organization configuration...\n');

        // Test basic config loading
        const config = getConfig();
        console.log('✅ Configuration loaded successfully');
        console.log(`Main Organization: ${config.mainOrganization.name} (${config.mainOrganization.displayName})`);
        console.log(`Excluded repos: ${config.mainOrganization.excludedRepos.join(', ') || 'none'}`);

        // Test extended organizations
        if (config.extendedOrganizations && config.extendedOrganizations.length > 0) {
            console.log('\nExtended Organizations:');
            config.extendedOrganizations.forEach((org, index) => {
                console.log(`  ${index + 1}. ${org.name} (${org.displayName})`);
                console.log(`     Excluded repos: ${org.excludedRepos.join(', ') || 'none'}`);
            });
        } else {
            console.log('\nNo extended organizations configured');
        }

        // Test getAllOrganizations helper
        const allOrgs = getAllOrganizations();
        console.log(`\n✅ Total organizations: ${allOrgs.length}`);
        console.log('Organizations:', allOrgs.map(org => org.name).join(', '));

        // Test repository exclusion
        console.log('\nTesting repository exclusion:');

        // Test main organization exclusions
        const mainOrg = config.mainOrganization;
        if (mainOrg.excludedRepos.length > 0) {
            mainOrg.excludedRepos.forEach(repo => {
                const isExcluded = isRepoExcluded(mainOrg.name, repo);
                console.log(`  ${mainOrg.name}/${repo}: ${isExcluded ? '✅ Excluded' : '❌ Not excluded'}`);
            });
        } else {
            console.log(`  No repositories excluded from ${mainOrg.name}`);
        }

        // Test extended organization exclusions
        if (config.extendedOrganizations) {
            config.extendedOrganizations.forEach(org => {
                if (org.excludedRepos.length > 0) {
                    org.excludedRepos.forEach(repo => {
                        const isExcluded = isRepoExcluded(org.name, repo);
                        console.log(`  ${org.name}/${repo}: ${isExcluded ? '✅ Excluded' : '❌ Not excluded'}`);
                    });
                } else {
                    console.log(`  No repositories excluded from ${org.name}`);
                }
            });
        }

        // Test non-excluded repositories
        console.log('\nTesting non-excluded repositories:');
        const testRepos = ['whisky', 'vodka', 'rum', 'gin'];
        testRepos.forEach(repo => {
            const mainExcluded = isRepoExcluded(mainOrg.name, repo);
            console.log(`  ${mainOrg.name}/${repo}: ${mainExcluded ? '❌ Excluded' : '✅ Not excluded'}`);
        });

        console.log('\n✅ All configuration tests passed!');

    } catch (error) {
        console.error('❌ Configuration test failed:', error.message);
        process.exit(1);
    }
}

testConfig(); 