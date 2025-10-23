'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarCheck, MessageSquare, Phone, User, UserRound } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface BottomNavProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'host' | 'guest';
  userName?: string;
}

export function BottomNav({ 
  isAuthenticated = false, 
  userRole = 'guest',
  userName 
}: BottomNavProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true);
    
    // Check if we're on mobile on mount and resize
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsVisible(true); // Reset visibility on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Only add scroll listener on mobile
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, lastScrollY]);

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      isActive: pathname === '/',
    },
    {
      href: '/bookings',
      icon: CalendarCheck,
      label: 'Booking',
      isActive: pathname.startsWith('/bookings'),
    },
    {
      href: '/messages',
      icon: MessageSquare,
      label: 'Message',
      isActive: pathname.startsWith('/messages'),
    },
    {
      href: 'https://wa.me/+8801820500747',
      icon: Phone,
      label: 'Contact',
      isActive: false,
      external: true,
    },
  ];

  // Don't render anything on desktop or during SSR
  if (!isClient || !isMobile) {
    return null;
  }

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur supports-[padding-bottom:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-in-out",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="h-16 grid grid-cols-5 text-xs">
        {/* Navigation Items */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center min-h-[44px] px-2 py-1 transition-colors",
              item.isActive ? "text-brand" : "text-gray-600 hover:text-gray-900"
            )}
            {...(item.external && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            <item.icon className={cn(
              "h-5 w-5 mb-1",
              item.isActive ? "text-brand" : "text-gray-600"
            )} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Login/Profile */}
        <div className="flex flex-col items-center justify-center min-h-[44px] px-2 py-1">
          {!isAuthenticated ? (
            <Link
              href="/login"
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                pathname === '/login' ? "text-brand" : "text-gray-600 hover:text-gray-900"
              )}
            >
              <User className={cn(
                "h-5 w-5 mb-1",
                pathname === '/login' ? "text-brand" : "text-gray-600"
              )} />
              <span className="text-xs font-medium">Login</span>
            </Link>
          ) : (
            <UserMenu
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              userName={userName}
              triggerIcon={
                <UserRound className={cn(
                  "h-5 w-5 mb-1",
                  pathname.startsWith('/admin') || pathname.startsWith('/host') || pathname.startsWith('/bookings') 
                    ? "text-brand" 
                    : "text-gray-600"
                )} />
              }
              triggerClassName="flex flex-col items-center justify-center p-0 h-auto hover:bg-transparent"
            />
          )}
        </div>
      </div>
    </nav>
  );
}
