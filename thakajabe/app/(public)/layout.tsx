import type { Metadata } from 'next'
import { PublicLayoutShell } from '@/components/layout/PublicLayoutShell'

export const metadata: Metadata = {
  title: 'Thaka Jabe — Find Your Perfect Stay in Bangladesh',
  description: 'Discover and book verified rooms across Bangladesh with Thaka Jabe. Premium accommodations, instant booking, and 24/7 support.',
  keywords: 'hotel booking, room rental, accommodation, travel, stay, Bangladesh, Dhaka, Chittagong, Sylhet, Cox\'s Bazar',
  authors: [{ name: 'Thaka Jabe' }],
  openGraph: {
    title: 'Thaka Jabe — Find Your Perfect Stay in Bangladesh',
    description: 'Discover and book verified rooms across Bangladesh with Thaka Jabe.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Thaka Jabe',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thaka Jabe — Find Your Perfect Stay in Bangladesh',
    description: 'Discover and book verified rooms across Bangladesh with Thaka Jabe.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#dc2627',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Replace with actual NextAuth session
  const isAuthenticated = false;
  const userRole = 'guest' as 'admin' | 'host' | 'guest';
  const userName = undefined;

  return (
    <PublicLayoutShell 
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      userName={userName}
    >
      {children}
    </PublicLayoutShell>
  )
}
