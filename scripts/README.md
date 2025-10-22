# Scripts Directory

This directory contains automation scripts organized by project. Each project has its own subdirectory with its specific scripts and dependencies.

## Structure

```
scripts/
├── org-gov/          # Scripts for the org Governance project
│   ├── org-stats/      # Organization statistics scripts
│   ├── drep-voting/    # DRep voting automation scripts
│   ├── discord-stats/  # Discord statistics scripts
│   ├── catalyst-proposals/ # Catalyst proposal data scripts
│   └── package.json    # Dependencies for org-gov scripts
└── README.md           # This file
```

## Projects

### org-gov
Scripts for the org Governance application, including:
- Organization statistics generation
- DRep voting automation
- Discord statistics collection
- Catalyst proposal data updates

## Usage

Each project directory contains its own `package.json` with specific dependencies. To run scripts:

```bash
# Navigate to the project's script directory
cd scripts/org-gov

# Install dependencies
npm install

# Run a specific script
npm run <script-name>
```

## GitHub Actions Integration

These scripts are automatically executed by GitHub Actions workflows located in `.github/workflows/`. The workflows are configured to use the appropriate working directory for each project.

## Adding New Projects

To add scripts for a new project:

1. Create a new directory: `scripts/<project-name>/`
2. Add a `package.json` with project-specific dependencies
3. Create your script files
4. Update any relevant GitHub Actions workflows to use the new path 