import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Métrical Pro',
  description: 'Calculez facilement et avec précision le métré de vos ouvrages.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
