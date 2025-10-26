'use client';

import { PublicLayoutShell } from '@/components/layout/PublicLayoutShell';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PublicLayoutShell>
      {children}
    </PublicLayoutShell>
  )
}
