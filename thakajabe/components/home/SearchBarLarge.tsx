'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationCombobox } from '@/components/search/LocationCombobox';
import { DateRangePopover } from '@/components/search/DateRangePopover';
import { GuestsPopover } from '@/components/search/GuestsPopover';
import { usePixelEvents } from '@/hooks/usePixelEvents';

// Type assertions for tracking

interface SearchFormData {
  location: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: {
    adults: number;
    children: number;
  };
}

interface SearchBarLargeProps {
  variant?: 'hero' | 'header';
}

export function SearchBarLarge({ variant = 'hero' }: SearchBarLargeProps) {
  const router = useRouter();
  const { fireSearch } = usePixelEvents();
  const [formData, setFormData] = useState<SearchFormData>({
    location: '',
    checkIn: undefined,
    checkOut: undefined,
    guests: {
      adults: 1,
      children: 0,
    },
  });

  const handleSearch = () => {
    // Fire search tracking events
    fireSearch(formData.location, {
      check_in: formData.checkIn?.toISOString(),
      check_out: formData.checkOut?.toISOString(),
      guests: formData.guests.adults + formData.guests.children,
    });

    // Build query parameters
    const params = new URLSearchParams();
    
    if (formData.location) params.append('location', formData.location);
    if (formData.checkIn) params.append('checkIn', formData.checkIn.toISOString().split('T')[0]);
    if (formData.checkOut) params.append('checkOut', formData.checkOut.toISOString().split('T')[0]);
    if (formData.guests.adults > 0) params.append('adults', formData.guests.adults.toString());
    if (formData.guests.children > 0) params.append('children', formData.guests.children.toString());

    router.push(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (variant === 'header') {
    return (
      <div className="bg-white rounded-full border shadow-sm p-1">
        {/* Header Layout: One row with dividers */}
        <div className="flex items-center">
          {/* Location */}
          <div className="flex-1 px-4">
            <LocationCombobox
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              placeholder="Where are you going?"
              className="border-0 shadow-none focus:ring-0"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200" />

          {/* Date Range */}
          <div className="flex-1 px-4">
            <DateRangePopover
              value={{ from: formData.checkIn, to: formData.checkOut }}
              onChange={(range) => setFormData(prev => ({ 
                ...prev, 
                checkIn: range.from, 
                checkOut: range.to 
              }))}
              placeholder="Check in – Check out"
              className="border-0 shadow-none focus:ring-0"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200" />

          {/* Guests */}
          <div className="flex-1 px-4">
            <GuestsPopover
              value={formData.guests}
              onChange={(guests) => setFormData(prev => ({ ...prev, guests }))}
              placeholder="Guests"
              className="border-0 shadow-none focus:ring-0"
            />
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            onKeyPress={handleKeyPress}
            className="ml-2 h-10 w-10 rounded-full bg-brand hover:bg-brand/90 text-white p-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-2">
      {/* Desktop Layout: | Location | Check in – Check out | Guests | Search Button | */}
      <div className="hidden md:grid md:grid-cols-4 gap-2">
        {/* Location */}
        <LocationCombobox
          value={formData.location}
          onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
          placeholder="Where are you going?"
        />

        {/* Date Range */}
        <DateRangePopover
          value={{ from: formData.checkIn, to: formData.checkOut }}
          onChange={(range) => setFormData(prev => ({ 
            ...prev, 
            checkIn: range.from, 
            checkOut: range.to 
          }))}
          placeholder="Check in – Check out"
        />

        {/* Guests */}
        <GuestsPopover
          value={formData.guests}
          onChange={(guests) => setFormData(prev => ({ ...prev, guests }))}
          placeholder="Guests"
        />

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          onKeyPress={handleKeyPress}
          className="h-14 bg-brand hover:bg-brand/90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>

      {/* Mobile Layout: Stacked 3 rows */}
      <div className="md:hidden space-y-3">
        {/* Row 1: Location input */}
        <LocationCombobox
          value={formData.location}
          onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
          placeholder="Where are you going?"
          className="w-full"
        />

        {/* Row 2: [Dates] [Guests] side-by-side */}
        <div className="grid grid-cols-2 gap-2">
          <DateRangePopover
            value={{ from: formData.checkIn, to: formData.checkOut }}
            onChange={(range) => setFormData(prev => ({ 
              ...prev, 
              checkIn: range.from, 
              checkOut: range.to 
            }))}
            placeholder="Check in – Check out"
            className="w-full"
          />

          <GuestsPopover
            value={formData.guests}
            onChange={(guests) => setFormData(prev => ({ ...prev, guests }))}
            placeholder="Guests"
            className="w-full"
          />
        </div>

        {/* Row 3: Full-width brand Search Button */}
        <Button
          onClick={handleSearch}
          onKeyPress={handleKeyPress}
          className="w-full h-14 bg-brand hover:bg-brand/90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Search className="h-5 w-5 mr-2" />
          Search Rooms
        </Button>
      </div>

      {/* Quick Filters - Hidden on mobile to save space */}
      <div className="hidden md:block mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, location: 'Dhaka' }))}
          className="text-xs hover:bg-brand hover:text-white transition-colors"
        >
          Dhaka
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, location: 'Chittagong' }))}
          className="text-xs hover:bg-brand hover:text-white transition-colors"
        >
          Chittagong
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, location: 'Sylhet' }))}
          className="text-xs hover:bg-brand hover:text-white transition-colors"
        >
          Sylhet
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, location: 'Cox\'s Bazar' }))}
          className="text-xs hover:bg-brand hover:text-white transition-colors"
        >
          Cox's Bazar
        </Button>
      </div>
    </div>
  );
}
