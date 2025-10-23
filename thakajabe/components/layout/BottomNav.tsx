'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MessageCircle, Phone, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/bookings', icon: Calendar, label: 'Booking' },
  { href: '/messages', icon: MessageCircle, label: 'Message' },
  { href: '/contact', icon: Phone, label: 'Contact' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, setProfileMenuOpen } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center py-2 px-3 rounded-lg transition-colors',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Profile/Login button */}
        <button
          onClick={() => setProfileMenuOpen(true)}
          className={cn(
            'flex flex-col items-center py-2 px-3 rounded-lg transition-colors',
            pathname.startsWith('/profile') || pathname.startsWith('/admin') || pathname.startsWith('/host')
              ? 'text-primary bg-primary/10'
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">
            {isAuthenticated ? 'Profile' : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
}
