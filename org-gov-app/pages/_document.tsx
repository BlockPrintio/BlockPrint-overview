import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Favicon and Icons */}
                <link rel="icon" href="/blockprint-logo.png" type="image/png" />
                <link rel="apple-touch-icon" href="/blockprint-logo.png" />
                <link rel="shortcut icon" href="/blockprint-logo.png" type="image/png" />

                {/* Matches the paper ground so mobile browser chrome does not
                    frame the sheet in a colour the page no longer uses. */}
                <meta name="theme-color" content="#f6f4f0" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
} 