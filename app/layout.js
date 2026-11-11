import './globals.css';

export const metadata = {
  title: 'Mega Build — трансформация харитаси (8 йўналиш)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap&subset=cyrillic" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
