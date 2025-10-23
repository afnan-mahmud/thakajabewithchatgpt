'use client';

import { Building2, DoorClosed, Hotel } from 'lucide-react';
import { MobileSearchTrigger } from '@/components/search/MobileSearchTrigger';

export default function MobileHeaderBar() {
  const categories = [
    { 
      key: 'apartments', 
      label: 'Apartments', 
      href: '/search?type=apartment', 
      icon: Building2 
    },
    { 
      key: 'rooms', 
      label: 'Rooms', 
      href: '/search?type=room', 
      icon: DoorClosed 
    },
    { 
      key: 'hotels', 
      label: 'Hotels', 
      href: '/search?type=hotel', 
      icon: Hotel 
    }
  ];

  return (
    <div className="block md:hidden bg-white border-b border-gray-200 z-30">
      <div className="container py-3">
        {/* Search trigger pill */}
        <MobileSearchTrigger />

        {/* Category tabs */}
        <div className="mt-3 flex items-center justify-between">
          {categories.map((category) => (
            <a 
              key={category.key} 
              href={category.href} 
              className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-brand transition-colors min-h-10 justify-center px-2"
            >
              <category.icon className="h-5 w-5" />
              <span>{category.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
