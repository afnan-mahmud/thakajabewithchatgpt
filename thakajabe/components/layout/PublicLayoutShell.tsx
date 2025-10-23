'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/navigation/TopNav';
import { BottomNav } from '@/components/navigation/BottomNav';
import { HeaderSearchBar } from '@/components/navigation/HeaderSearchBar';
import MobileHeaderBar from '@/components/navigation/MobileHeaderBar';

const HIDE_SEARCH_PATHS = ['/room'];

interface PublicLayoutShellProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'host' | 'guest';
  userName?: string;
}

export function PublicLayoutShell({ 
  children, 
  isAuthenticated = false, 
  userRole = 'guest',
  userName 
}: PublicLayoutShellProps) {
  const pathname = usePathname();
  const hideSearch = HIDE_SEARCH_PATHS.some(path => pathname.startsWith(path));

  return (
    <>
      <TopNav 
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        userName={userName}
      />
      {!hideSearch && <HeaderSearchBar />}
      {!hideSearch && <MobileHeaderBar />}
      <main className="min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav 
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        userName={userName}
      />
    </>
  );
}
