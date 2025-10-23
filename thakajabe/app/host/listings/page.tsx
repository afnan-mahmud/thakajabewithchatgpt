'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Home,
  MapPin,
  DollarSign,
  Calendar,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Listing {
  id: string;
  title: string;
  description: string;
  address: string;
  locationName: string;
  roomType: string;
  basePriceTk: number;
  commissionTk: number;
  totalPriceTk: number;
  images: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  instantBooking: boolean;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

export default function HostListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockListings: Listing[] = [
    {
      id: '1',
      title: 'Luxury Apartment in Gulshan',
      description: 'Beautiful 2-bedroom apartment with modern amenities',
      address: 'House 123, Road 45, Gulshan 1',
      locationName: 'Gulshan, Dhaka',
      roomType: 'Apartment',
      basePriceTk: 8000,
      commissionTk: 800,
      totalPriceTk: 8800,
      images: ['/images/room1.jpg'],
      status: 'approved',
      instantBooking: true,
      amenities: ['WiFi', 'AC', 'Kitchen', 'Parking'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Cozy Studio in Dhanmondi',
      description: 'Perfect for solo travelers',
      address: 'House 456, Road 27, Dhanmondi',
      locationName: 'Dhanmondi, Dhaka',
      roomType: 'Studio',
      basePriceTk: 5000,
      commissionTk: 500,
      totalPriceTk: 5500,
      images: ['/images/room2.jpg'],
      status: 'pending',
      instantBooking: false,
      amenities: ['WiFi', 'AC', 'TV'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
    },
    {
      id: '3',
      title: 'Family House in Uttara',
      description: 'Spacious 3-bedroom house for families',
      address: 'House 789, Sector 7, Uttara',
      locationName: 'Uttara, Dhaka',
      roomType: 'House',
      basePriceTk: 12000,
      commissionTk: 1200,
      totalPriceTk: 13200,
      images: ['/images/room3.jpg'],
      status: 'draft',
      instantBooking: false,
      amenities: ['WiFi', 'AC', 'Kitchen', 'Garden', 'Parking'],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
    },
  ];

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchTerm]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Mock API call
      setListings(mockListings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = listings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.roomType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const handleToggleInstantBooking = async (listingId: string, enabled: boolean) => {
    try {
      // Mock API call
      setListings(listings.map(listing => 
        listing.id === listingId 
          ? { ...listing, instantBooking: enabled }
          : listing
      ));
    } catch (error) {
      console.error('Failed to toggle instant booking:', error);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      // Mock API call
      setListings(listings.filter(listing => listing.id !== listingId));
    } catch (error) {
      console.error('Failed to delete listing:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <Link href="/host/listings/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.length}</div>
            <p className="text-xs text-gray-500 mt-1">All properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {listings.filter(l => l.status === 'approved').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Approved listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {listings.filter(l => l.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Instant Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {listings.filter(l => l.instantBooking).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Enabled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Listings</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                    {listing.images[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                          {getStatusBadge(listing.status)}
                          {listing.instantBooking && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              Instant Booking
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {listing.locationName}
                          </div>
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-1" />
                            {listing.roomType}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ৳{listing.totalPriceTk.toLocaleString()}/night
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold">৳{listing.totalPriceTk.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">
                          Base: ৳{listing.basePriceTk.toLocaleString()}
                          {listing.commissionTk > 0 && (
                            <span> + Commission: ৳{listing.commissionTk.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Instant Booking:</span>
                          <Switch
                            checked={listing.instantBooking}
                            onCheckedChange={(enabled) => handleToggleInstantBooking(listing.id, enabled)}
                            disabled={listing.status !== 'approved'}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link href={`/host/listings/${listing.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          
                          <Link href={`/host/listings/${listing.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Created: {new Date(listing.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Updated: {new Date(listing.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredListings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No listings found matching your criteria.</p>
                <Link href="/host/listings/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
