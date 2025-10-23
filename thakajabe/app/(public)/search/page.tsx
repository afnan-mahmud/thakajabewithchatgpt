'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterModal } from '@/components/search/FilterModal';
import { SortDropdown } from '@/components/search/SortDropdown';
import { StickyFilterButton } from '@/components/search/StickyFilterButton';
import { 
  MapPin, 
  Users, 
  DollarSign, 
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Room {
  _id: string;
  title: string;
  description: string;
  address: string;
  locationName: string;
  roomType: string;
  amenities: string[];
  basePriceTk: number;
  commissionTk: number;
  totalPriceTk: number;
  images: { url: string; w: number; h: number }[];
  instantBooking: boolean;
  createdAt: string;
  host: {
    displayName: string;
    locationName: string;
  };
}

interface SearchFilters {
  location: string;
  minPrice: number;
  maxPrice: number;
  roomType: string;
}

interface SearchResults {
  rooms: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    query: string;
    location: string;
    minPrice: number;
    maxPrice: number;
    type: string;
    sort: string;
  };
}

export default function RoomSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    minPrice: 0,
    maxPrice: 50000,
    roomType: '',
  });
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort,
      });

      if (searchQuery) params.append('q', searchQuery);
      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 50000) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.roomType) params.append('type', filters.roomType);

      const response = await api.rooms.search<SearchResults>(params.toString());
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.message || 'Failed to search rooms');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sort, page]);

  useEffect(() => {
    searchRooms();
  }, [searchRooms]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoomTypeLabel = (roomType: string) => {
    const types: Record<string, string> = {
      single: 'Single Room',
      double: 'Double Room',
      family: 'Family Room',
      suite: 'Suite',
      other: 'Other',
    };
    return types[roomType] || roomType;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="w-full">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search for rooms, locations, or amenities..."
                className="w-full"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FilterModal
                  onApplyFilters={handleFiltersChange}
                  currentFilters={filters}
                />
                
                {/* Active Filters Display */}
                <div className="flex items-center space-x-2">
                  {filters.location && (
                    <Badge variant="secondary" className="text-xs">
                      Location: {filters.location}
                    </Badge>
                  )}
                  {(filters.minPrice > 0 || filters.maxPrice < 50000) && (
                    <Badge variant="secondary" className="text-xs">
                      Price: ৳{filters.minPrice.toLocaleString()} - ৳{filters.maxPrice.toLocaleString()}
                    </Badge>
                  )}
                  {filters.roomType && (
                    <Badge variant="secondary" className="text-xs">
                      Type: {getRoomTypeLabel(filters.roomType)}
                    </Badge>
                  )}
                </div>
              </div>

              <SortDropdown
                onSortChange={handleSortChange}
                currentSort={sort}
                className="w-48"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Searching rooms...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={searchRooms}>Try Again</Button>
          </div>
        )}

        {results && !loading && (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {results.pagination.total} rooms found
                </h1>
                {searchQuery && (
                  <p className="text-gray-600 mt-1">
                    Results for "{searchQuery}"
                  </p>
                )}
              </div>
            </div>

            {/* Room Grid */}
            {results.rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.rooms.map((room) => (
                  <Card key={room._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/room/${room._id}`}>
                      <div className="aspect-video relative">
                        {room.images[0] ? (
                          <Image
                            src={room.images[0].url}
                            alt={room.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        {room.instantBooking && (
                          <Badge className="absolute top-2 right-2 bg-green-600">
                            Instant Book
                          </Badge>
                        )}
                      </div>
                    </Link>
                    
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-1">
                          {room.title}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="line-clamp-1">{room.locationName}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{getRoomTypeLabel(room.roomType)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                            <span className="font-semibold text-green-600">
                              ৳{room.totalPriceTk.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">/night</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">4.5</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {room.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No rooms found matching your criteria.</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilters({ location: '', minPrice: 0, maxPrice: 50000, roomType: '' });
                  setPage(1);
                }}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {results.pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!results.pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, results.pagination.pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!results.pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Filter Button for Mobile */}
      <StickyFilterButton
        onApplyFilters={handleFiltersChange}
        currentFilters={filters}
      />
    </div>
  );
}
