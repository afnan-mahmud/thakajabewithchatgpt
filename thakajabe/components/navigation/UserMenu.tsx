'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, User, UserPlus, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'host' | 'guest';
  userName?: string;
  className?: string;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
}

export function UserMenu({ 
  isAuthenticated = false, 
  userRole = 'guest',
  userName,
  className,
  triggerIcon,
  triggerClassName 
}: UserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // TODO: Implement actual logout with NextAuth
    // await signOut();
    console.log('Logout clicked');
    // For now, just redirect to home
    router.push('/');
  };

  const getDashboardPath = () => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'host':
        return '/host';
      default:
        return '/bookings';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-gray-100",
            triggerClassName
          )}
          aria-label="User menu"
        >
          {triggerIcon || <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {!isAuthenticated ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login" className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/register" className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href={getDashboardPath()} className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
