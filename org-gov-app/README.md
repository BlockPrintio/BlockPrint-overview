# BlockPrint Governance Dashboard

A modern, comprehensive governance dashboard for BlockPrint showcasing our Cardano community's projects, contributors, Catalyst proposals, and ecosystem impact.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
org-gov-app/
├── components/          # React components
├── contexts/           # React contexts (DataContext)
├── data/              # Static data files
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── pages/             # Next.js pages
├── styles/            # CSS modules
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── public/            # Static assets
```

## 🎨 Features

- **Modern UI Design** - Clean, intuitive interface with glassmorphism effects
- **Responsive Layout** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Data** - Automatic updates from GitHub Actions
- **Catalyst Proposals** - Track Fund 15 proposals and their status
- **Contributors Showcase** - Display community contributors
- **Project Gallery** - Showcase BlockPrint's open source projects

## 🔧 Configuration

The dashboard is configured via `org-stats-config.json` in the root directory. Key settings include:

- Organization name and logos
- Social media links
- Repository configurations
- Catalyst project IDs
- Discord server ID

## 📦 Dependencies

- **Next.js 16.1.3** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **CSS Modules** - Scoped styling

## 🎨 Design System

The dashboard uses a custom design system with:

- **Colors**: Deep blue (#0033AD) primary, cyan (#06b6d4) secondary
- **Typography**: Helvetica Neue with bold weights
- **Effects**: Glassmorphism, smooth transitions, hover effects
- **Layout**: Responsive grid system

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables if needed
3. Deploy automatically on push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

**Built with ❤️ by the BlockPrint community**
