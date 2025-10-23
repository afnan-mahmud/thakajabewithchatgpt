'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllText?: string;
  className?: string;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  viewAllHref, 
  viewAllText = "View All",
  className 
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-600 text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      
      {viewAllHref && (
        <Link href={viewAllHref}>
          <Button 
            variant="outline" 
            size="sm"
            className="group hover:bg-brand hover:text-white hover:border-brand transition-all duration-200"
          >
            {viewAllText}
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}
    </div>
  );
}
