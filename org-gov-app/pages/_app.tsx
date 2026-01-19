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
                <title>{config.mainOrganization.displayName}.io Governance</title>
                <meta name="description" content="BlockPrint.io Governance Platform" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
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