'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/navigation/TopNav';
import { BottomNav } from '@/components/navigation/BottomNav';
import MobileHeaderBar from '@/components/navigation/MobileHeaderBar';
import { Footer } from '@/components/layout/Footer';

const HIDE_SEARCH_PATHS = ['/room', '/search'];

interface PublicLayoutShellProps {
  children: React.ReactNode;
}

export function PublicLayoutShell({ 
  children
}: PublicLayoutShellProps) {
  const pathname = usePathname();
  const hideSearch = HIDE_SEARCH_PATHS.some(path => pathname.startsWith(path));

  return (
    <>
      <TopNav />
      {!hideSearch && <MobileHeaderBar />}
      <main className="min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
