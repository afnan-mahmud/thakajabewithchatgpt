'use client';

import Link from 'next/link';
import { UserMenu } from './UserMenu';

interface TopNavProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'host' | 'guest';
  userName?: string;
}

export function TopNav({ 
  isAuthenticated = false, 
  userRole = 'guest',
  userName 
}: TopNavProps) {
  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="container h-14 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-xl font-semibold text-brand hover:text-brand/80 transition-colors"
        >
          Thaka Jabe
        </Link>

        {/* Right cluster */}
        <div className="flex items-center space-x-4">
          {/* Become Host Link */}
          <Link 
            href="/join-host" 
            className="text-sm font-medium text-gray-700 hover:text-brand hover:underline transition-colors"
          >
            Become Host
          </Link>

          {/* User Menu */}
          <UserMenu 
            isAuthenticated={isAuthenticated}
            userRole={userRole}
            userName={userName}
          />
        </div>
      </div>
    </header>
  );
}
