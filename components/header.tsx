'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SiteLogo } from '@/components/site-logo';
import { LanguageToggle } from '@/components/language-toggle';

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="relative border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div
        className={
          isHome
            ? 'mx-auto flex max-w-3xl justify-end px-4 py-4'
            : 'mx-auto flex max-w-3xl items-center justify-center px-4 py-5'
        }
      >
        {!isHome && (
          <Link href="/" className="transition-opacity hover:opacity-90">
            <SiteLogo />
          </Link>
        )}
      </div>
      <div className="absolute top-4 right-4 sm:top-5 sm:right-6">
        <LanguageToggle />
      </div>
    </header>
  );
}
