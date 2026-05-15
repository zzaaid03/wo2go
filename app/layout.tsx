import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { LanguageProvider } from '@/components/language-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'wo2go — Direct train connections from Saarbrücken Hbf',
  description:
    'See where you can go by train directly from Saarbrücken Hbf in the next 12 hours. Filter by regional trains, major stations, and more.',
  openGraph: {
    title: 'wo2go — Direct train connections from Saarbrücken Hbf',
    description:
      'See where you can go by train directly from Saarbrücken Hbf in the next 12 hours.',
    type: 'website',
  },
};

/**
 * Root layout — Server Component.
 *
 * The LanguageProvider is a Client Component that forms the client boundary.
 * It wraps the entire app so all children can access the language context.
 *
 * Note: lang="de" is set statically. Dynamically updating <html lang> when
 * the user switches to English would require a client-side effect on
 * document.documentElement or moving lang into a Client Component wrapper.
 * That's more complexity than it's worth for Phase 1. Flagged for Phase 2.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
