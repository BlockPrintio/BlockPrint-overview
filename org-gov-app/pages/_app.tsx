import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Space_Mono } from "next/font/google";
import '../styles/globals.css';
import { DataProvider } from '../contexts/DataContext';
import Navigation from '../components/Navigation';
import config from '../config';

const spaceMono = Space_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "700"],
    display: "swap",
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>{config.mainOrganization.displayName} Governance Dashboard</title>
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
            <div className={spaceMono.variable}>
                <DataProvider>
                    <div className="app-layout">
                        <Navigation />
                        <main className="main-content" style={{ marginTop: '80px' }}>
                            <Component {...pageProps} />
                        </main>
                    </div>
                </DataProvider>
            </div>
        </>
    );
}

export default MyApp; 