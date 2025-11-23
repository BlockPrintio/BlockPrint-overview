import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Geist, Geist_Mono } from "next/font/google";
import '../styles/globals.css';
import { DataProvider } from '../contexts/DataContext';
import Navigation from '../components/Navigation';
import config from '../config';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
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
            <div className={`${geistSans.variable} ${geistMono.variable}`}>
                <DataProvider>
                    <div className="app-layout">
                        <Navigation />
                        <main className="main-content">
                            <Component {...pageProps} />
                        </main>
                    </div>
                </DataProvider>
            </div>
        </>
    );
}

export default MyApp; 