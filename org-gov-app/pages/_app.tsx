import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import '../styles/globals.css';
import { DataProvider } from '../contexts/DataContext';
import Navigation from '../components/Navigation';
import Substrate from '../components/Substrate';
import config from '../config';

// Archivo carries a width axis. That axis is the type decision on this site:
// sheet titles are set expanded, the way drafting lettering is, while body
// copy stays at normal width. One family doing two jobs it can genuinely do.
const archivo = Archivo({
    variable: "--font-archivo",
    subsets: ["latin"],
    axes: ["wdth"],
    display: "swap",
});

// Mono is not decoration here. It marks recorded values — project IDs, ADA
// amounts, counts, dates — which is the entire subject of the dashboard.
const plexMono = IBM_Plex_Mono({
    variable: "--font-plex-mono",
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    display: "swap",
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                {/* Template string, not `{value} literal`. The latter hands React
                    a two-element array, which it refuses to render in <title> —
                    the tag then ships empty on every route, which is how this
                    site spent its life with unlabelled tabs and bookmarks.
                    Pages override this with their own <Head>. */}
                <title>{`${config.mainOrganization.displayName} Governance Record`}</title>
                <meta name="description" content="BlockPrint is a Cardano developer community in Lagos, Nigeria, focused on making blockchain accessible through open source projects and innovative solutions." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                
                {/* Favicon and Icons */}
                <link rel="icon" href="/blockprint-logo.png" type="image/png" />
                <link rel="apple-touch-icon" href="/blockprint-logo.png" />
                <link rel="shortcut icon" href="/blockprint-logo.png" type="image/png" />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${config.mainOrganization.displayName} Governance Dashboard`} />
                <meta property="og:description" content="BlockPrint is a Cardano developer community in Lagos, Nigeria, focused on making blockchain accessible through open source projects and innovative solutions." />
                <meta property="og:image" content="/blockprint-logo.png" />
                <meta property="og:url" content="https://blockprint.team" />
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${config.mainOrganization.displayName} Governance Dashboard`} />
                <meta name="twitter:description" content="BlockPrint is a Cardano developer community in Lagos, Nigeria, focused on making blockchain accessible through open source projects and innovative solutions." />
                <meta name="twitter:image" content="/blockprint-logo.png" />
            </Head>
            <DataProvider>
                {/* The font variables and the element that consumes them are the
                    same node, so `font-family: var(--font-body)` resolves here
                    rather than at <body>, where --font-archivo is out of scope. */}
                <div className={`app-layout ${archivo.variable} ${plexMono.variable}`}>
                    <a href="#sheet" className="skip-link">Skip to content</a>
                    {/* Texture, behind everything. Fixed and negative-z, so it
                        never enters the flow or the tab order. */}
                    <Substrate />
                    <Navigation />
                    <main className="main-content" id="sheet">
                        <Component {...pageProps} />
                    </main>
                </div>
            </DataProvider>
        </>
    );
}

export default MyApp; 