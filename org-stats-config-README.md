# Organization Stats Configuration

This document describes the configuration structure for the organization statistics scripts that support multiple organizations with repository exclusion lists.

## Configuration Structure

The configuration file (`org-stats-config.json`) supports a main organization and multiple extended organizations, each with their own repository exclusion lists.

### Main Organization

The main organization is the primary organization for which statistics are collected. It contains:

- `name`: GitHub organization name (e.g., "MeshJS")
- `displayName`: Human-readable display name (e.g., "MeshJS")
- `logo`: Logo configuration for the organization
- `logoWithName`: Logo with name configuration
- `excludedRepos`: Array of repository names to exclude from processing

### Extended Organizations

Extended organizations are additional organizations whose repositories should also be included in the statistics. Each extended organization contains:

- `name`: GitHub organization name
- `displayName`: Human-readable display name
- `excludedRepos`: Array of repository names to exclude from processing

## Complete Configuration Reference

### Organization Configuration

```json
{
    "mainOrganization": {
        "name": "MeshJS",
        "displayName": "MeshJS",
        "logo": {
            "src": "/logo-mesh-white-512x512.png",
            "width": 40,
            "height": 40
        },
        "logoWithName": {
            "src": "/mesh-white-txt.png",
            "width": 120,
            "height": 120
        },
        "excludedRepos": []
    },
    "extendedOrganizations": [
        {
            "name": "example-org",
            "displayName": "Example Organization",
            "excludedRepos": [
                "legacy-repo",
                "deprecated-project"
            ]
        }
    ]
}
```

### Repository Configuration

```json
{
    "repositories": {
        "governance": "dashboard-template",
        "dependentsCountRepo": "mesh"
    }
}
```

**Fields:**
- `governance`: The repository name that contains governance documentation and voting history
- `dependentsCountRepo`: The main repository used to count dependent repositories on GitHub

### Cardano Blockchain Configuration

```json
{
    "poolId": "pool1wnrrg33lw9fxcn0h3x3vexh78up660ajgk7pvrlrz5kkcgh9khs",
    "drepId": "drep1yv4uesaj92wk8ljlsh4p7jzndnzrflchaz5fzug3zxg4naqkpeas3"
}
```

**Fields:**
- `poolId`: Your stake pool's bech32 identifier for tracking pool performance and voting history
- `drepId`: Your DRep (Delegated Representative) identifier for tracking governance participation

### Catalyst Projects Configuration

```json
{
    "catalystProjectIds": "1000107,1100271,1200148,1200147,1200220,1300135,1300134,1300130,1300050,1300036"
}
```

**Fields:**
- `catalystProjectIds`: Comma-separated list of Catalyst project IDs to track funding proposals and milestones

### Discord Configuration

```json
{
    "discordGuildId": "907191435864977459",
    "discordStats": {
        "useApiAction": false,
        "description": "Set to true if your Discord server has more than 500 members to use the API-based action, false for the standard action (default: false)"
    }
}
```

**Fields:**
- `discordGuildId`: Your Discord server's guild ID for collecting member statistics
- `discordStats.useApiAction`: Boolean flag to determine which Discord statistics collection method to use
  - `true`: Use API-based action for servers with 500+ members
  - `false`: Use bot-based action for smaller servers (default)

### NPM Packages Configuration

```json
{
    "npmPackages": {
        "mesh-core": "@meshsdk/core",
        "mesh-react": "@meshsdk/react"
    }
}
```

**Fields:**
- `npmPackages`: Object mapping package keys to NPM package names for tracking download statistics

### Social Links Configuration

```json
{
    "socialLinks": [
        {
            "name": "GitHub",
            "url": "https://github.com/MeshJS"
        },
        {
            "name": "Twitter",
            "url": "https://x.com/meshsdk"
        },
        {
            "name": "Discord",
            "url": "https://discord.gg/v7ncDWHm"
        }
    ]
}
```

**Fields:**
- `socialLinks`: Array of social media links displayed in the dashboard

### Builder Projects Configuration

```json
{
    "builderProjects": [
        {
            "id": "b1",
            "icon": "/blink-labs.png",
            "url": "https://blinklabs.io/"
        }
    ]
}
```

**Fields:**
- `builderProjects`: Array of builder projects to showcase in the dashboard
  - `id`: Unique identifier for the project
  - `icon`: Path to the project's icon image
  - `url`: Link to the project's website

### Highlighted Projects Configuration

```json
{
    "highlightedProjects": [
        {
            "id": "Gasless Tx Library",
            "name": "Gasless Tx Library",
            "description": "TypeScript library that enables gasless transactions on the Cardano blockchain.",
            "icon": "/nucast.png",
            "url": "https://github.com/Nucastio/gasless-tx-ts",
            "category": "Development Tool"
        }
    ]
}
```

**Fields:**
- `highlightedProjects`: Array of projects to highlight in the dashboard
  - `id`: Unique identifier for the project
  - `name`: Display name for the project
  - `description`: Brief description of the project
  - `icon`: Path to the project's icon image
  - `url`: Link to the project
  - `category`: Optional category classification

### Showcase Repositories Configuration

```json
{
    "showcaseRepos": [
        {
            "name": "Mesh Core",
            "description": "Collection of comprehensive TypeScript libraries for blockchain development on Cardano.",
            "icon": "/logo-mesh-white-512x512.png",
            "url": "https://github.com/MeshJS/mesh"
        }
    ]
}
```

**Fields:**
- `showcaseRepos`: Array of repositories to showcase in the dashboard
  - `name`: Display name for the repository
  - `description`: Brief description of the repository
  - `icon`: Path to the repository's icon image
  - `url`: Link to the repository

## Repository Exclusion

Each organization can specify repositories to exclude from processing:

```json
{
    "name": "my-org",
    "displayName": "My Organization",
    "excludedRepos": [
        "legacy-repo",
        "deprecated-project",
        "test-repository",
        "temp-fork"
    ]
}
```

### When to Exclude Repositories

Consider excluding repositories that:

- Are legacy or deprecated
- Are temporary forks or test repositories
- Don't represent meaningful contributions
- Are archived or no longer maintained
- Contain sensitive or private information
- Are automatically generated or bot-created

## Organization Tracking

When processing repositories, the system now tracks which organization each repository belongs to. This information is stored in the contributor data:

```json
{
    "login": "username",
    "repositories": [
        {
            "name": "MeshJS/mesh",
            "commits": 10,
            "pull_requests": 5,
            "contributions": 15,
            "organization": "MeshJS"
        },
        {
            "name": "example-org/some-repo",
            "commits": 3,
            "pull_requests": 1,
            "contributions": 4,
            "organization": "example-org"
        }
    ]
}
```

## GitHub Actions Integration

The configuration is used by several GitHub Actions workflows:

### Organization Statistics (`org-stats.yml`)
- **Schedule**: Every Thursday at midnight UTC
- **Uses**: `mainOrganization`, `extendedOrganizations`, `repositories`, `npmPackages`
- **Output**: Organization statistics and contributor data

### Discord Statistics (`update-discord-stats.yml`)
- **Schedule**: 1st day of each month at 2:00 AM UTC
- **Uses**: `discordGuildId`, `discordStats.useApiAction`
- **Output**: Discord server statistics

### Stake Pool Information (`stake-pool-info.yml`)
- **Schedule**: Daily at 23:00 UTC
- **Uses**: `poolId`
- **Output**: Stake pool performance and voting data

### DRep Voting (`drep-voting.yml`)
- **Schedule**: Twice daily at 4:10 AM and 4:10 PM UTC
- **Uses**: `drepId`, `mainOrganization.name`, `repositories.governance`
- **Output**: DRep voting history and rationales

### DRep Delegation (`drep-delegation.yml`)
- **Schedule**: Mondays and Thursdays at 00:20 UTC
- **Uses**: `drepId`
- **Output**: DRep delegation information

### Catalyst Proposals (`update-catalyst-docs.yml`)
- **Schedule**: Mondays, Wednesdays, Fridays at 00:10 UTC
- **Uses**: `catalystProjectIds`
- **Output**: Catalyst proposal data and funding information

### Milestones Data (`generate-milestones-data.yml`)
- **Schedule**: Mondays, Wednesdays, Fridays at 00:20 UTC
- **Uses**: `catalystProjectIds`
- **Output**: Project milestone progress and completion data

### Yearly Contributors (`org-yearly-contributors.yml`)
- **Schedule**: Every Monday at midnight UTC
- **Uses**: `mainOrganization`, `extendedOrganizations`
- **Output**: Yearly contributor statistics

## Script Behavior

### Repository Processing

1. **Multi-Organization Support**: Scripts now process repositories from all configured organizations (main + extended)
2. **Exclusion Filtering**: Repositories listed in `excludedRepos` are automatically filtered out
3. **Organization Tracking**: Each repository is tagged with its source organization
4. **Unified Processing**: All repositories are processed together, maintaining contributor deduplication across organizations

### Contributor Data

- Contributors are tracked across all organizations
- Repository contributions include organization information
- Repository names are prefixed with organization (e.g., "sidan-lab/whisky")
- Statistics are aggregated across all organizations

### Error Handling

- If an organization cannot be accessed, the script continues with other organizations
- Repository access errors are logged but don't stop processing
- Missing or invalid configuration fields are validated and reported

## Validation

The configuration loader validates:

- Required fields for main organization
- Required fields for extended organizations
- Array types for exclusion lists
- Organization name uniqueness

## Usage

The configuration is automatically loaded by the scripts. No changes to script execution are required - the scripts will automatically detect and use the new multi-organization structure.

The scripts will process all organizations and their repositories according to the configuration. 