'use client';

import { useAppStore } from '@/lib/store';
import { useSessionUser } from '@/lib/auth-context';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, Home as HomeIcon, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function ProfileMenu() {
  const { 
    isProfileMenuOpen, 
    setProfileMenuOpen
  } = useAppStore();
  const { user, isAuthenticated } = useSessionUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setProfileMenuOpen(false);
    router.push('/');
  };

  const handleSwitchToHosting = () => {
    setProfileMenuOpen(false);
    router.push('/host');
  };

  return (
    <>
      {isProfileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setProfileMenuOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white rounded-t-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Profile Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setProfileMenuOpen(false)}>
                ×
              </Button>
            </div>
            
            <div className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{user?.name}</h3>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2">
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="h-4 w-4 mr-3" />
                        Profile Settings
                      </Button>
                    </Link>

                    <Link href="/bookings">
                      <Button variant="ghost" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-3" />
                        My Bookings
                      </Button>
                    </Link>

                    <Link href="/messages">
                      <Button variant="ghost" className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-3" />
                        Messages
                      </Button>
                    </Link>

                    {user?.role === 'host' && (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={handleSwitchToHosting}
                      >
                        <HomeIcon className="h-4 w-4 mr-3" />
                        Switch to Hosting
                      </Button>
                    )}

                    {user?.role === 'admin' && (
                      <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-3" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}

                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <Link href="/login">
                    <Button className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Join as Host */}
              <div className="pt-4 border-t">
                <Link href="/join-host">
                  <Button variant="outline" className="w-full">
                    Join as Host
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}