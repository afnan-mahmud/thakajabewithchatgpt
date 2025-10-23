'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  name: string;
  country: string;
  type: 'city' | 'region' | 'landmark';
}

interface LocationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// API-based location data
const fetchLocations = async (query: string): Promise<Location[]> => {
  try {
    const response = await fetch(`/api/locations?s=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      name: item.label,
      country: 'Bangladesh',
      type: 'city' as const,
    }));
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return [];
  }
};

export function LocationCombobox({ 
  value, 
  onChange, 
  placeholder = "Where are you going?",
  className 
}: LocationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter locations based on input
  useEffect(() => {
    const loadLocations = async () => {
      if (value.trim() === '') {
        // Show top 6 cities by default
        const defaultLocations = await fetchLocations('');
        setFilteredLocations(defaultLocations.slice(0, 6));
      } else {
        const filtered = await fetchLocations(value);
        setFilteredLocations(filtered.slice(0, 8));
      }
      setSelectedIndex(-1);
    };
    
    loadLocations();
  }, [value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    onChange(location.name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredLocations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredLocations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredLocations.length) {
          handleLocationSelect(filteredLocations[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur (with delay to allow clicks)
  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pl-10 pr-10 h-14 border-0 focus:ring-0 text-base text-gray-700 placeholder:text-gray-400"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            ×
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <div ref={listRef} className="py-2">
            {filteredLocations.map((location, index) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleLocationSelect(location)}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                  selectedIndex === index && 'bg-gray-50',
                  'flex items-center justify-between'
                )}
              >
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{location.name}</div>
                    <div className="text-sm text-gray-500">{location.country}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {location.type}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && value.trim() !== '' && filteredLocations.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="px-4 py-6 text-center text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No locations found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        </div>
      )}
    </div>
  );
}
