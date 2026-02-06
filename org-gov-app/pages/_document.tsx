import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html data-theme="dark" lang="en">
            <Head>
                {/* Favicon and Icons */}
                <link rel="icon" href="/blockprint-logo.png" type="image/png" />
                <link rel="apple-touch-icon" href="/blockprint-logo.png" />
                <link rel="shortcut icon" href="/blockprint-logo.png" type="image/png" />
                
                {/* Theme Color */}
                <meta name="theme-color" content="#0033AD" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
} 