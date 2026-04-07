import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* SEO */}
        <title>FormIQ — Your Gym Brain</title>
        <meta name="description" content="Plan, log, and track your workouts. Interactive muscle map, plate calculator, stretch routines, cardio tracker. Free, no account needed." />
        <meta name="theme-color" content="#000000" />

        {/* Open Graph */}
        <meta property="og:title" content="FormIQ — Your Gym Brain" />
        <meta property="og:description" content="Plan, log, and track every workout. Free, offline, no account needed." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://formiq-navy.vercel.app" />

        {/* PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FormIQ" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />

        {/* Fonts — Inter via Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalStyles = `
* { box-sizing: border-box; }
body {
  background-color: #000000;
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #111; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #00E676; }

/* Smooth scroll */
html { scroll-behavior: smooth; }

/* Selection color */
::selection { background: #00E67640; color: #fff; }
`;
