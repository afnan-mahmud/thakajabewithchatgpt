'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RoomCard } from './RoomCard';
import { cn } from '@/lib/utils';

interface RoomItem {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
}

interface RoomRailProps {
  items: RoomItem[];
  className?: string;
}

export function RoomRail({ items, className }: RoomRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one card + gap
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      // Check scroll buttons after a short delay
      setTimeout(checkScrollButtons, 150);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Navigation Buttons - Hidden on mobile */}
      <div className="hidden md:block">
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkScrollButtons}
        className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-72 md:w-80 snap-start">
            <RoomCard
              id={item.id}
              title={item.title}
              location={item.location}
              price={item.price}
              image={item.image}
              rating={item.rating}
              reviews={item.reviews}
            />
          </div>
        ))}
      </div>

      {/* Scroll Indicators - Mobile only */}
      <div className="md:hidden flex justify-center mt-4 space-x-2">
        {items.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-gray-300"
          />
        ))}
      </div>
    </div>
  );
}
