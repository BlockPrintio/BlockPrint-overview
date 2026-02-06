# BlockPrint Governance Dashboard

A comprehensive governance dashboard for BlockPrint, showcasing our Cardano community's projects, contributors, Catalyst proposals, and ecosystem impact.

[![BlockPrint](https://img.shields.io/badge/BlockPrint-Cardano-blue?style=for-the-badge)](https://blockprint.team)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## 🌟 About BlockPrint

BlockPrint is a Cardano developer community based in Lagos, Nigeria, focused on making blockchain accessible through open source projects and innovative solutions. We are passionate about building tools that empower developers and improve the Cardano ecosystem.

### Our Mission

To make blockchain technology accessible, understandable, and usable for developers and end-users through:
- **Open Source Development** - Building reusable tools and libraries
- **Education & Onboarding** - Creating resources for developers new to Cardano
- **Governance Participation** - Contributing to Cardano's decentralized governance
- **Community Building** - Fostering collaboration and knowledge sharing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- GitHub account with access to BlockPrint repositories
- (Optional) Koios API key for Cardano blockchain data

### Installation

```bash
# Clone the repository
git clone https://github.com/BlockPrintio/BlockPrint-overview.git
cd BlockPrint-overview

# Install dependencies
cd org-gov-app
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

## 📋 Features

This dashboard provides:

- **📊 Organization Statistics** - GitHub stars, forks, contributors, and repository analytics
- **👥 Contributors** - Showcase of community contributors and their contributions
- **💡 Catalyst Proposals** - Track Fund 15 proposals and their progress
- **📦 Projects** - Display of BlockPrint's open source projects and repositories
- **🔗 Social Integration** - Links to GitHub, Twitter, and Discord
- **📈 Real-time Data** - Automatic updates via GitHub Actions

## 🎯 Fund 15 Proposals

BlockPrint has submitted two proposals to Cardano's Project Catalyst Fund 15:

### 1. BlockPrint | Gimbalabs build a cardano Treasury explorer
- **Budget**: 150,000 ADA
- **Status**: Pending Vote
- **Description**: Build a dedicated Cardano Treasury Explorer that consolidates treasury activity into a single platform for visibility of fund flows, spending trends, and treasury sustainability.
- **Link**: [View Proposal](https://projectcatalyst.io/funds/15/cardano-use-cases-prototype-and-launch/blockprint-or-gimbalabs-build-a-cardano-treasury-explorer)

### 2. CS-Code: Web-IDE scaffolder for onchain and offchain code
- **Budget**: 80,000 ADA
- **Status**: Pending Vote
- **Description**: Build a unified, web-based IDE comprising all Cardano on-chain and off-chain libraries with ready-to-use templates, full-stack scaffolding, integrated testing, and simplified deployment.
- **Link**: [View Proposal](https://projectcatalyst.io/funds/15/cardano-use-cases-prototype-and-launch/cs-code-web-ide-scaffolder-for-onchain-and-offchain-code)

**Your support and votes are crucial for these projects to receive funding!**

## 👥 Our Team

BlockPrint is built by a diverse team of developers, designers, and blockchain enthusiasts. Meet our contributors:

- **Emmanuel Asaolu (temasar)** - Lead Developer
- **Jethro Adebisi** - Co-lead Developer and UX Designer
- **Gideon Ovwiomor** - Blockchain Developer
- **Kadiri Ahmed Tunde** - Front-end Developer
- **Treasure Olayemi (TAENTED9)** - Backend Engineer
- **Oloyede Al-amin Oladapo (Xanes)** - Full-stack Developer
- **Emafido Emmanuel Aridon** - Full-stack Developer
- **Okeowo Quam** - Mobile Developer
- **Oluwajuwon Oluwaseun** - Front-end Developer

View all contributors at [blockprint.team/contributors](https://blockprint.team/contributors)

## 🔗 Connect With Us

- **Website**: [blockprint.team](https://blockprint.team)
- **GitHub**: [@BlockPrintio](https://github.com/BlockPrintio)
- **Twitter**: [@blockprint0](https://x.com/blockprint0)
- **Discord**: [Join our community](https://discord.gg/k4nFCf9MkB)

## 🏗️ Technology Stack

- **Framework**: Next.js 16.1.3
- **Language**: TypeScript
- **Styling**: CSS Modules with custom design system
- **Font**: Helvetica Neue
- **Deployment**: Vercel (recommended)

## 📊 Data Sources

The dashboard automatically fetches data from:

- **GitHub API** - Repository statistics and contributor data
- **Koios API** - Cardano blockchain data
- **Project Catalyst API** - Proposal and milestone data
- **Discord API** - Community statistics

## 🔧 Configuration

### Organization Settings

Edit `org-stats-config.json` to configure:

- Organization name and display settings
- Logo paths and dimensions
- Social media links
- Repository exclusions
- Catalyst project IDs
- Discord server ID

### GitHub Actions

The dashboard uses GitHub Actions to automatically collect and update data:

- **Organization Statistics** - Weekly updates
- **Contributor Data** - Real-time tracking
- **Catalyst Proposals** - Regular sync
- **Discord Stats** - Monthly updates

### Required Secrets

Add these secrets to your GitHub repository:

| Secret Name | Description |
|-------------|-------------|
| `KOIOS_API_KEY` | Koios API key for Cardano data |

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to [Vercel](https://vercel.com)
2. Set environment variables if needed
3. Deploy automatically on every push

### Manual Deployment

```bash
cd org-gov-app
npm install
npm run build
npm start
```

## 🎨 Design System

The dashboard uses a modern design system with:

- **Color Palette**: Deep blue (#0033AD) primary, cyan (#06b6d4) secondary
- **Typography**: Helvetica Neue with bold weights
- **Glassmorphism**: Modern glass-effect cards and components
- **Responsive**: Mobile-first design approach

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

We welcome contributions! BlockPrint is built by the community, for the community.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🙏 Acknowledgments

- **Gimbalabs** - Collaboration partner and mentor
- **Cardano Community** - For support and feedback
- **Project Catalyst** - For funding opportunities
- **All Contributors** - For making BlockPrint possible

## 📞 Support

Need help or have questions?

- **Discord**: Join our [Discord server](https://discord.gg/k4nFCf9MkB)
- **GitHub Issues**: Open an issue in this repository
- **Email**: Contact us through our website

---

**Made with ❤️ by the BlockPrint community for the Cardano ecosystem**

*Building the future of blockchain, one commit at a time.*
